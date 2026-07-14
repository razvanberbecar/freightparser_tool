# FreightParse — Deployment Guide

**Backend → Railway, Frontend → Vercel.** Deploy the backend first (you need its
URL for the frontend), then the frontend, then point CORS back at the frontend.

Everything in the repo is already prepared for this. The steps below are the
account/dashboard actions **you** have to do — creating accounts, connecting the
GitHub repo, and pasting secrets can't be automated.

---

## 0. Prerequisites
- The repo is on GitHub, including the new deploy files: **commit + push**
  `backend/railway.json`, `backend/.python-version`, and this guide.
- Your `ANTHROPIC_API_KEY` (from the Anthropic console).
- The API key must **not** be in the repo — `backend/.env` is gitignored. If it
  ever got committed, rotate the key.

---

## 1. Backend → Railway

1. [railway.com](https://railway.com) → **New Project → Deploy from GitHub repo** → pick your repo.
2. Open the service → **Settings → Root Directory → `backend`**. (The backend lives in a subfolder.)
3. Nothing else to configure — the repo drives the build:
   - `railway.json` → start command `uvicorn app.main:app --host 0.0.0.0 --port $PORT` + health check on `/health`.
   - `.python-version` → pins **Python 3.11** (required — the pinned deps don't build on 3.12+).
   - `requirements.txt` → installed automatically by Nixpacks.
4. **Settings → Variables**, add:
   | Variable | Value |
   |---|---|
   | `ANTHROPIC_API_KEY` | `sk-ant-...` (your real key) |
   | `MODEL` | `claude-sonnet-4-6` *(optional — this is the default)* |
   | `MAX_FILE_SIZE_MB` | `10` *(optional)* |
   | `ALLOWED_ORIGINS` | leave blank for now — set in step 3 |
5. **Settings → Networking → Generate Domain**. Copy the URL, e.g. `https://freightparse-production.up.railway.app`.
6. Verify: open `<backend-url>/health` → `{"status":"ok","version":"1.0.0"}`, and `<backend-url>/docs` loads.

> If the build uses the wrong Python, add a variable `NIXPACKS_PYTHON_VERSION=3.11` and redeploy.

---

## 2. Frontend → Vercel

1. [vercel.com](https://vercel.com) → **Add New… → Project** → import the same GitHub repo.
2. **Root Directory → `frontend`**.
3. Framework Preset should auto-detect **Vite** (Build `npm run build`, Output `dist`). Leave the defaults.
4. **Environment Variables**, add (Production):
   | Variable | Value |
   |---|---|
   | `VITE_API_URL` | your Railway backend URL from step 1 (e.g. `https://freightparse-production.up.railway.app`) |

   > This is baked in at **build time**, so changing it later needs a redeploy. It must be named exactly `VITE_API_URL`.
5. **Deploy**. Copy the resulting URL, e.g. `https://freightparse.vercel.app`.

---

## 3. Wire CORS (point the backend at the frontend)

1. Back in **Railway → Variables**, set:
   ```
   ALLOWED_ORIGINS = https://freightparse.vercel.app
   ```
   Use the **exact** Vercel URL — `https://`, no trailing slash. Comma-separate multiple origins.
2. Railway redeploys automatically when a variable changes.

---

## 4. Test production
- Open your Vercel URL, pick CMR/AWB, upload a document, extract, edit, export.
- Run through [QA_CHECKLIST.md](QA_CHECKLIST.md) once against the live URLs.

**If extraction fails with a CORS / "Failed to fetch" error in the browser
console:** `ALLOWED_ORIGINS` on Railway doesn't exactly match the Vercel origin.
Fix the value (exact scheme + host, no trailing slash) and let it redeploy.

---

## Notes & gotchas
- **Python 3.11 is mandatory** for the backend — `.python-version` handles it;
  the `NIXPACKS_PYTHON_VERSION=3.11` variable is the fallback.
- **Vercel preview deployments** get unique URLs that aren't in `ALLOWED_ORIGINS`,
  so API calls from a preview will be blocked. Test on the production domain, or
  add the preview URL(s) to `ALLOWED_ORIGINS`.
- **Secrets:** the API key lives only in Railway's variables — never in the repo.
- **Cost:** Vercel's free tier covers the frontend; Railway is usage-based
  (small for this app — see the cost analysis in the architecture doc).
