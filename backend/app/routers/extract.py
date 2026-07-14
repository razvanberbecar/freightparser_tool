"""POST /api/extract — accept a document upload, return extracted freight fields.

Content-Type: multipart/form-data with ``file`` and ``doc_type`` (cmr|awb).
Status codes: 200 success, 413 file too large, 422 bad input / unreadable
document, 500 extraction failed.
"""

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from pydantic import ValidationError

from app import config
from app.models.extraction import EXTRACTION_MODELS
from app.services import claude_service, pdf_service

router = APIRouter()


@router.post("/extract")
async def extract(
    file: UploadFile = File(...),
    doc_type: str = Form(...),
):
    if doc_type not in EXTRACTION_MODELS:
        raise HTTPException(
            status_code=422, detail="doc_type must be one of: cmr, awb."
        )

    data = await file.read()
    if not data:
        raise HTTPException(status_code=422, detail="Uploaded file is empty.")

    max_bytes = config.MAX_FILE_SIZE_MB * 1024 * 1024
    if len(data) > max_bytes:
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds the {config.MAX_FILE_SIZE_MB} MB limit.",
        )

    try:
        images = pdf_service.prepare_document_images(data, file.content_type or "")
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    try:
        fields = claude_service.extract_fields(images, doc_type)
    except claude_service.LowQualityDocumentError as exc:
        # Client can act on this — tell them to re-upload a clearer document.
        raise HTTPException(status_code=422, detail=exc.user_message) from exc
    except claude_service.ExtractionError as exc:
        raise HTTPException(status_code=500, detail=exc.user_message) from exc

    model = EXTRACTION_MODELS[doc_type]
    try:
        return model.model_validate(fields)
    except ValidationError:
        # Preserve the extracted data rather than fail on a minor type quirk.
        return fields
