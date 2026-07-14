"""Pydantic model for the /api/export request payload.

Carries the (user-corrected) extracted fields plus the target document type.
Fields are a flexible dict so the user can edit any value before export; the
Excel layer maps field names to template named ranges (Phase 4).
"""

from typing import Any

from pydantic import BaseModel, Field

from app.models.extraction import DocType


class ExportRequest(BaseModel):
    doc_type: DocType
    fields: dict[str, Any] = Field(default_factory=dict)
