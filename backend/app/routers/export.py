"""POST /api/export — accept corrected fields, return a filled .xlsx download.

Content-Type: application/json (``doc_type`` + ``fields``).
Status codes: 200 success with file, 422 validation error, 500 generation failed.
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from app.models.export import ExportRequest
from app.services import excel_service

router = APIRouter()

_XLSX_MEDIA_TYPE = (
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
)


@router.post("/export")
def export(request: ExportRequest):
    try:
        buffer = excel_service.generate_export_workbook(
            request.doc_type, request.fields
        )
    except Exception as exc:  # noqa: BLE001 - surface any generation failure as 500
        raise HTTPException(
            status_code=500, detail=f"Failed to generate the Excel file: {exc}"
        ) from exc

    filename = f"{request.doc_type}_export.xlsx"
    return StreamingResponse(
        buffer,
        media_type=_XLSX_MEDIA_TYPE,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
