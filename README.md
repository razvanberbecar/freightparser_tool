# FreightParse

AI-Powered Freight Document Parser. Upload a client order, packing list, or
shipping instruction and FreightParse extracts the freight-relevant fields and
produces a ready-to-send **CMR** or **AWB** in Excel. (Bill of Lading support is
deferred — see Phase 4 below.)

**Stack:** FastAPI (Python) + React (Vite) + Claude API (Sonnet 4.6) · Vercel + Railway

---

## Project layout

```
freightparse/
├── backend/     # FastAPI service (extraction + Excel export)
├── frontend/    # React + Vite + Tailwind UI
├── templates/   # Master Excel templates (CMR / AWB) with named ranges
├── .gitignore
└── README.md
```

## Quick start (local development)

### Backend — http://localhost:8000

```bash
cd backend
python -m venv venv
# Windows (PowerShell):
venv\Scripts\Activate.ps1
# macOS / Linux:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env          # then edit .env and add your ANTHROPIC_API_KEY
uvicorn app.main:app --reload --port 8000
```

Interactive API docs: http://localhost:8000/docs

### Frontend — http://localhost:5173

```bash
cd frontend
npm install
npm run dev
```

## Implementation status

- [x] **Phase 1** — Project setup (folder structure, venv, deps, dev servers)
- [x] **Phase 2** — Claude extraction service (code complete; prompt tuning against real docs pending a live API key)
- [x] **Phase 3** — Backend API (`/api/extract`, `/api/export`, `/health`, CORS). Export currently writes a generic Field/Value sheet; Phase 4 swaps in the templated named-range output.
- [x] **Phase 4** — Excel templates. `cmr_template.xlsx` (trilingual RO/EN/FR) and `awb_template.xlsx` (IATA) built with named ranges (`backend/scripts/build_templates.py`); `excel_service` fills templates by named range; both extraction prompts + models output exactly the template field names, so `extract → export` fills the forms end-to-end. **BOL removed for now** (ocean vs. US-LTL bill of lading undecided — to revisit). (Visual eyeball of the templates in Excel still recommended.)
- [x] **Phase 5** — React frontend. Doc-type selector, drag-drop upload (react-dropzone), editable fields form (react-hook-form) with confidence badge, export/download, toasts (react-hot-toast), Tailwind styling. `doc_type` carried through extract → export. (`vite.config.js` dedupes React to avoid a pre-bundle "Invalid hook call".)
- [ ] Phase 6 — Integration testing
- [ ] Phase 7 — Deployment (Vercel + Railway)
- [ ] Phase 8 — Feedback & iteration

## Changes from the architecture doc

Decisions that intentionally deviate from the original architecture document:

- **Python 3.11** for the backend venv — the pinned dependency versions have no
  wheels for the machine's Python 3.14. Built from `uv`'s 3.11 interpreter.
- **Single Claude model, no fallback.** Extraction uses one model,
  `claude-sonnet-4-6` (the doc's `claude-haiku-4-5` primary + Sonnet fallback
  design was dropped). Configured via the single `MODEL` env var.
- **Errors instead of a model fallback.** If extraction fails, or the model
  returns low confidence / is missing a critical field, the backend returns an
  error (`user_message`) rather than retrying on another model. The frontend
  shows the user a clear message to re-upload a clearer, higher-quality document.
