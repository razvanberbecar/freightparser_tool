"""Pydantic models for extracted freight-document fields.

One model per output document type. Field names match the extraction prompt keys
**and the Excel template named ranges** (Section 8.2 — Claude's JSON keys are the
template field names), so ``excel_service`` fills each template by name. All
content fields are Optional (Claude returns null for anything it can't find);
models are lenient — they coerce common messy values and ignore unexpected keys.
"""

import re
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, field_validator, model_validator

DocType = Literal["cmr", "awb"]
Confidence = Literal["high", "medium", "low"]


def _coerce_number(v):
    """Accept numbers, or pull the leading number out of strings like '450 kg'."""
    if v is None or isinstance(v, (int, float)):
        return v
    if isinstance(v, str):
        match = re.search(r"[-+]?\d*[.,]?\d+", v)
        if match:
            return float(match.group().replace(",", "."))
        return None
    return None


class _ExtractionBase(BaseModel):
    """Shared config, confidence field, and empty-string handling."""

    model_config = ConfigDict(extra="ignore", str_strip_whitespace=True)

    confidence: Optional[Confidence] = None

    @model_validator(mode="before")
    @classmethod
    def _empty_strings_to_none(cls, data):
        """Treat "" (a common stand-in for null) as None."""
        if isinstance(data, dict):
            return {k: (None if v == "" else v) for k, v in data.items()}
        return data


class CMRExtraction(_ExtractionBase):
    """CMR fields — names match cmr_template.xlsx named ranges."""

    shipper: Optional[str] = None
    consignee: Optional[str] = None
    carrier: Optional[str] = None
    delivery_place: Optional[str] = None
    loading_place: Optional[str] = None
    loading_date: Optional[str] = None
    attached_docs: Optional[str] = None
    marks: Optional[str] = None
    num_packages: Optional[int] = None
    packing_method: Optional[str] = None
    cargo_description: Optional[str] = None
    statistical_number: Optional[str] = None
    gross_weight_kg: Optional[float] = None
    volume_m3: Optional[float] = None
    sender_instructions: Optional[str] = None
    payment_instructions: Optional[str] = None
    cash_on_delivery: Optional[str] = None
    special_agreements: Optional[str] = None
    established_place: Optional[str] = None
    established_date: Optional[str] = None
    adr_class: Optional[str] = None

    @field_validator("gross_weight_kg", "volume_m3", "num_packages", mode="before")
    @classmethod
    def _numbers(cls, v):
        return _coerce_number(v)


class AWBExtraction(_ExtractionBase):
    """AWB fields — names match awb_template.xlsx named ranges."""

    shipper_name: Optional[str] = None
    shipper_address: Optional[str] = None
    consignee_name: Optional[str] = None
    consignee_address: Optional[str] = None
    airport_departure: Optional[str] = None
    airport_destination: Optional[str] = None
    flight_number: Optional[str] = None
    flight_date: Optional[str] = None
    agent_name: Optional[str] = None
    agent_city: Optional[str] = None
    declared_value_carriage: Optional[str] = None
    declared_value_customs: Optional[str] = None
    insurance_amount: Optional[str] = None
    num_pieces: Optional[int] = None
    gross_weight_kg: Optional[float] = None
    rate_class: Optional[str] = None
    chargeable_weight: Optional[float] = None
    cargo_description: Optional[str] = None
    cargo_dimensions: Optional[str] = None
    reference_number: Optional[str] = None
    handling_info: Optional[str] = None
    accounting_info: Optional[str] = None
    total_prepaid: Optional[str] = None
    total_collect: Optional[str] = None
    other_charges: Optional[str] = None
    execution_date: Optional[str] = None
    execution_place: Optional[str] = None

    @field_validator("gross_weight_kg", "chargeable_weight", "num_pieces", mode="before")
    @classmethod
    def _numbers(cls, v):
        return _coerce_number(v)


# doc_type -> response model
# BOL is intentionally omitted for now (doc type not yet settled — see README).
EXTRACTION_MODELS: dict[str, type[_ExtractionBase]] = {
    "cmr": CMRExtraction,
    "awb": AWBExtraction,
}
