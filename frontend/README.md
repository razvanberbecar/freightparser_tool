# FreightParse — Frontend (React + Vite + Tailwind)

## Setup

```bash
cd frontend
npm install
```

## Run

```bash
npm run dev
```

Opens on http://localhost:5173. Set `VITE_API_URL` in `.env` to point at the
backend (defaults to http://localhost:8000). The backend must be running for
extraction/export to work.

## Flow

Choose doc type (CMR / AWB) → drag-drop a document → review/edit the extracted
fields → **Export to Excel** downloads the filled template. The selected doc
type is carried through extract *and* export, so it can never mismatch.

## Layout

| Path | Purpose |
|------|---------|
| `src/main.jsx` | React entry point |
| `src/App.jsx` | Root — composes the flow, holds the react-hook-form instance |
| `src/components/DocTypeSelector.jsx` | CMR / AWB selector |
| `src/components/UploadZone.jsx` | Drag-and-drop upload (react-dropzone) |
| `src/components/LoadingSpinner.jsx` | Shown during extraction |
| `src/components/ExtractedFields.jsx` | Editable field form (react-hook-form) + confidence badge |
| `src/components/ExportButton.jsx` | Triggers export + download |
| `src/services/api.js` | axios calls to `/api/extract` and `/api/export` |
| `src/hooks/useExtraction.js` | Doc type / upload / extract / export state |
| `src/styles/index.css` | Tailwind imports |

> **Vite note:** `vite.config.js` pins a single React instance
> (`resolve.dedupe` + `optimizeDeps.include`) — without it, Vite's dep
> pre-bundle can duplicate React and cause "Invalid hook call".
