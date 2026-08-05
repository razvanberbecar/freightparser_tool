"""Tests for /api/extract — Claude is mocked, so no billed API calls.

The endpoint accepts the source documents for one shipment (1..5 files) and
returns a merged ``{fields, conflicts, confidence, source_count}`` envelope.
"""

from app.services import claude_service

PDF = "application/pdf"


def _post(client, pdfs, doc_type):
    """POST one or more PDFs. ``pdfs`` is a single bytes or a list of bytes."""
    if isinstance(pdfs, (bytes, bytearray)):
        pdfs = [pdfs]
    files = [("files", (f"doc{i}.pdf", data, PDF)) for i, data in enumerate(pdfs)]
    return client.post("/api/extract", files=files, data={"doc_type": doc_type})


def test_health(client):
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


def test_extract_success_single_file(client, sample_pdf, monkeypatch):
    def fake_merged(images, doc_type):
        assert doc_type == "cmr"
        assert images  # pdf_service actually produced image blocks
        return {
            "fields": {
                "shipper": "SC Exemplu SRL",
                "cargo_description": "Piese auto",
                "gross_weight_kg": 450,
            },
            "conflicts": [],
            "confidence": "high",
        }

    monkeypatch.setattr(claude_service, "extract_merged", fake_merged)
    resp = _post(client, sample_pdf, "cmr")
    assert resp.status_code == 200
    body = resp.json()
    assert body["fields"]["shipper"] == "SC Exemplu SRL"
    assert body["fields"]["gross_weight_kg"] == 450.0  # coerced to float
    assert body["conflicts"] == []
    assert body["confidence"] == "high"
    assert body["source_count"] == 1
    # confidence is on the envelope, not among the template fields.
    assert "confidence" not in body["fields"]


def test_extract_merges_multiple_files_with_conflict(client, sample_pdf, monkeypatch):
    def fake_merged(images, doc_type):
        # Both documents' page images arrive in one call.
        assert len(images) >= 2
        return {
            "fields": {
                "shipper": "SC Exemplu SRL",
                "consignee": "GmbH Muster",
                "cargo_description": "Piese auto",
                "gross_weight_kg": 480,
            },
            "conflicts": [
                {
                    "field": "gross_weight_kg",
                    "values": [
                        {"value": 450, "source": "packing list"},
                        {"value": 480, "source": "invoice"},
                    ],
                }
            ],
            "confidence": "medium",
        }

    monkeypatch.setattr(claude_service, "extract_merged", fake_merged)
    resp = _post(client, [sample_pdf, sample_pdf], "cmr")
    assert resp.status_code == 200
    body = resp.json()
    assert body["source_count"] == 2
    assert len(body["conflicts"]) == 1
    conflict = body["conflicts"][0]
    assert conflict["field"] == "gross_weight_kg"
    assert {v["source"] for v in conflict["values"]} == {"packing list", "invoice"}


def test_extract_bad_doc_type(client, sample_pdf):
    resp = _post(client, sample_pdf, "bol")  # BOL removed
    assert resp.status_code == 422
    assert "cmr" in resp.json()["detail"]


def test_extract_too_many_files(client, sample_pdf):
    resp = _post(client, [sample_pdf] * 6, "cmr")  # limit is 5
    assert resp.status_code == 422
    assert "Maximum" in resp.json()["detail"]


def test_extract_unsupported_content_type(client):
    resp = client.post(
        "/api/extract",
        files=[("files", ("note.txt", b"hello", "text/plain"))],
        data={"doc_type": "cmr"},
    )
    assert resp.status_code == 422


def test_extract_empty_file(client):
    resp = client.post(
        "/api/extract",
        files=[("files", ("empty.pdf", b"", PDF))],
        data={"doc_type": "cmr"},
    )
    assert resp.status_code == 422


def test_extract_too_large(client, sample_pdf):
    big = b"%PDF" + b"0" * (11 * 1024 * 1024)  # > 10 MB limit
    resp = _post(client, [sample_pdf, big], "cmr")
    assert resp.status_code == 413


def test_extract_low_quality_returns_422(client, sample_pdf, monkeypatch):
    def fake(images, doc_type):
        raise claude_service.LowQualityDocumentError("low confidence")

    monkeypatch.setattr(claude_service, "extract_merged", fake)
    resp = _post(client, sample_pdf, "awb")
    assert resp.status_code == 422
    assert "re-upload" in resp.json()["detail"].lower()


def test_extract_service_error_returns_500(client, sample_pdf, monkeypatch):
    def fake(images, doc_type):
        raise claude_service.ExtractionError(
            "boom", user_message="Extraction is not configured."
        )

    monkeypatch.setattr(claude_service, "extract_merged", fake)
    resp = _post(client, sample_pdf, "cmr")
    assert resp.status_code == 500
    assert resp.json()["detail"] == "Extraction is not configured."
