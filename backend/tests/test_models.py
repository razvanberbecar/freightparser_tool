"""Regression tests: model fields stay aligned to template named ranges."""

from pathlib import Path

from openpyxl import load_workbook

from app.models.extraction import AWBExtraction, CMRExtraction, EXTRACTION_MODELS

TEMPLATES = Path(__file__).resolve().parents[1] / "templates"


def _named_ranges(doc_type: str) -> set[str]:
    wb = load_workbook(TEMPLATES / f"{doc_type}_template.xlsx")
    return set(wb.defined_names.keys())


def test_cmr_fields_match_template():
    fields = set(CMRExtraction.model_fields) - {"confidence"}
    assert fields == _named_ranges("cmr")


def test_awb_fields_match_template():
    fields = set(AWBExtraction.model_fields) - {"confidence"}
    assert fields == _named_ranges("awb")


def test_only_cmr_and_awb_supported():
    assert set(EXTRACTION_MODELS) == {"cmr", "awb"}


def test_number_coercion():
    m = CMRExtraction.model_validate(
        {"gross_weight_kg": "450 kg", "num_packages": "12 colete", "volume_m3": "2,5"}
    )
    assert m.gross_weight_kg == 450.0
    assert m.num_packages == 12
    assert m.volume_m3 == 2.5


def test_empty_string_becomes_none():
    m = CMRExtraction.model_validate({"shipper": "", "cargo_description": "Piese"})
    assert m.shipper is None
    assert m.cargo_description == "Piese"


def test_unexpected_keys_ignored():
    m = CMRExtraction.model_validate({"shipper": "A", "unexpected_field": "x"})
    assert m.shipper == "A"
    assert not hasattr(m, "unexpected_field")
