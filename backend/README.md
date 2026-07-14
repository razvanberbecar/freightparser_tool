# FreightParse — Backend (FastAPI)

## Setup

```bash
cd backend
python -m venv venv
venv\Scripts\Activate.ps1     # Windows PowerShell
# source venv/bin/activate    # macOS / Linux

pip install -r requirements.txt
cp .env.example .env          # add your ANTHROPIC_API_KEY
```

## Run

```bash
uvicorn app.main:app --reload --port 8000
```

- Health check: http://localhost:8000/health
- Swagger UI: http://localhost:8000/docs

## Test

```bash
pip install -r requirements-dev.txt
python -m pytest        # from the backend/ directory
```

Endpoint tests mock Claude (no billed API calls); `tests/test_models.py`
guards that the extraction model fields stay aligned to the template named
ranges.

## Layout

| Path | Purpose |
|------|---------|
| `app/main.py` | FastAPI entry point, CORS, `/health` |
| `app/config.py` | Environment / settings |
| `app/models/` | Pydantic models (Phase 3) |
| `app/routers/` | `/api/extract`, `/api/export` (Phase 3) |
| `app/services/` | Claude, PDF, Excel services (Phase 2 / 4) |
| `app/prompts/` | Per-doc-type extraction prompts (Phase 2) |
| `templates/` | Master `.xlsx` templates with named ranges (Phase 4) |
| `tests/` | Endpoint tests (Phase 3) |

> **Note:** built against **Python 3.11** — the pinned dependency versions in
> `requirements.txt` do not yet ship wheels for Python 3.14.

## Extraction behaviour

- Single Claude model, `MODEL=claude-sonnet-4-6` (no model fallback).
- On failure, low confidence, or a missing critical field, `claude_service`
  raises `ExtractionError` / `LowQualityDocumentError`. The `/api/extract`
  router (Phase 3) maps these to an HTTP error carrying `user_message`, which
  the frontend shows as a "re-upload a clearer document" prompt.
