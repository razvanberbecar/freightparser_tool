"""POST /api/extract — accept the source documents for ONE shipment, return a
merged freight field set.

Content-Type: multipart/form-data with one or more ``files`` and ``doc_type``
(cmr|awb). Claude merges the documents into one field set and flags any
conflicting values.

Status codes: 200 success, 413 a file too large, 422 bad input / too many files
/ unreadable document, 500 extraction failed.
"""

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from pydantic import ValidationError

from app import config
from app.models.extraction import EXTRACTION_MODELS, MergedExtraction
from app.services import claude_service, pdf_service

router = APIRouter()

# Max source documents per shipment (architecture doc Section 1.1 / 5).
MAX_FILES = 5


@router.post("/extract")
async def extract(
    files: list[UploadFile] = File(...),
    doc_type: str = Form(...),
):
    if doc_type not in EXTRACTION_MODELS:
        raise HTTPException(
            status_code=422, detail="doc_type must be one of: cmr, awb."
        )

    if not files:
        raise HTTPException(status_code=422, detail="Upload at least one document.")
    if len(files) > MAX_FILES:
        raise HTTPException(
            status_code=422,
            detail=f"Maximum {MAX_FILES} documents per shipment.",
        )

    max_bytes = config.MAX_FILE_SIZE_MB * 1024 * 1024
    documents: list[tuple[bytes, str]] = []
    for f in files:
        data = await f.read()
        if not data:
            raise HTTPException(
                status_code=422,
                detail=f"Uploaded file '{f.filename}' is empty.",
            )
        if len(data) > max_bytes:
            raise HTTPException(
                status_code=413,
                detail=(
                    f"File '{f.filename}' exceeds the "
                    f"{config.MAX_FILE_SIZE_MB} MB limit."
                ),
            )
        documents.append((data, f.content_type or ""))

    try:
        images = pdf_service.prepare_shipment_images(documents)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    try:
        result = claude_service.extract_merged(images, doc_type)
    except claude_service.LowQualityDocumentError as exc:
        # Client can act on this — tell them to re-upload a clearer document.
        raise HTTPException(status_code=422, detail=exc.user_message) from exc
    except claude_service.ExtractionError as exc:
        raise HTTPException(status_code=500, detail=exc.user_message) from exc

    # Validate/coerce the merged fields against the doc-type model, but preserve
    # the raw data rather than fail on a minor type quirk.
    model = EXTRACTION_MODELS[doc_type]
    try:
        validated_fields = model.model_validate(result["fields"]).model_dump()
    except ValidationError:
        validated_fields = result["fields"]
    # confidence is carried on the envelope, not among the template fields.
    validated_fields.pop("confidence", None)

    return MergedExtraction(
        fields=validated_fields,
        conflicts=result["conflicts"],
        confidence=result["confidence"],
        source_count=len(files),
    )
