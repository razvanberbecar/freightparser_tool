# FreightParse — Manual QA Checklist

Run before shipping / after significant changes. The automated suite
(`cd backend && python -m pytest`) covers the API contract with Claude mocked;
this checklist covers the things it can't — real extraction, the browser UI,
downloads, and real-document edge cases.

## Setup
- [ ] Backend running: `cd backend && .\venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000`
- [ ] `backend/.env` has a real `ANTHROPIC_API_KEY`
- [ ] Frontend running: `cd frontend && npm run dev` → http://localhost:5173
- [ ] `GET /health` returns `{"status":"ok"}`; `/docs` loads

## Happy path — CMR
- [ ] Select **CMR**; upload zone becomes active
- [ ] Drag-drop (and separately, click-to-browse) a real CMR / client order (PDF)
- [ ] Spinner shows, then fields appear with a confidence badge
- [ ] Extracted values look correct against the source document
- [ ] Edit a field (e.g. fix a weight), then **Export to Excel**
- [ ] Downloaded `cmr_export.xlsx` opens in Excel, is the CMR form, and shows your **edited** value in the right box

## Happy path — AWB
- [ ] Repeat with **AWB** + a real Air Waybill / shipping doc
- [ ] `awb_export.xlsx` opens and fields land in the correct boxes

## Doc type is carried through
- [ ] Extract a CMR, export → file is a **CMR** (never asks for / mixes doc type)

## Error handling
- [ ] Upload an unsupported file (e.g. `.txt`) → clear "unsupported file" toast, no crash
- [ ] Upload a file > 10 MB → "exceeds 10 MB" toast
- [ ] Upload a blank/blurry/non-freight doc → **422** with the "re-upload a clearer document" message (not a silent failure)
- [ ] Stop the backend, then upload → "Could not reach the server" toast
- [ ] **Start over** resets back to the upload step

## Extraction quality (real documents)
- [ ] Multi-page PDF — first 3 pages are used
- [ ] Documents in RO / EN / DE / FR extract reasonably
- [ ] Photo/scan (JPG/PNG) of a document, not just a text PDF
- [ ] `confidence: medium` shows the "review carefully" note

## UI / theme
- [ ] Theme toggle (top-right) switches light ↔ dark; both are readable
- [ ] Choice persists across a page reload
- [ ] Inputs, badges, dropzone, and toasts all styled in both themes
- [ ] Layout is usable on a narrow window
