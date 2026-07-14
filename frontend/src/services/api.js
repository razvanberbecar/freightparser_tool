// axios client + API calls for the FreightParse backend.

import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const api = axios.create({ baseURL: API_URL })

// Shown when the backend can't read a document (low confidence / failure) and
// didn't provide its own message.
export const REUPLOAD_MESSAGE =
  "We couldn't read this document reliably. Please re-upload a clearer, higher-quality scan or photo."

// POST /api/extract (multipart) -> extracted fields JSON (incl. `confidence`).
export async function extractDocument(file, docType) {
  const form = new FormData()
  form.append('file', file)
  form.append('doc_type', docType)
  try {
    const { data } = await api.post('/api/extract', form)
    return data
  } catch (err) {
    throw new Error(errorMessage(err))
  }
}

// POST /api/export (JSON) -> triggers a browser download of the filled .xlsx.
export async function exportDocument(fields, docType) {
  try {
    const res = await api.post(
      '/api/export',
      { doc_type: docType, fields },
      { responseType: 'blob' },
    )
    const filename =
      filenameFromDisposition(res.headers['content-disposition']) ||
      `${docType}_export.xlsx`
    triggerDownload(res.data, filename)
  } catch (err) {
    throw new Error(await blobErrorMessage(err))
  }
}

// --- helpers ---

function errorMessage(err) {
  const detail = err?.response?.data?.detail
  if (detail) return typeof detail === 'string' ? detail : REUPLOAD_MESSAGE
  if (err?.response) return REUPLOAD_MESSAGE
  return 'Could not reach the server. Is the backend running on port 8000?'
}

// Export errors arrive as a Blob (responseType: 'blob'); read + parse it.
async function blobErrorMessage(err) {
  const data = err?.response?.data
  if (data instanceof Blob) {
    try {
      const parsed = JSON.parse(await data.text())
      if (parsed?.detail) return parsed.detail
    } catch {
      /* fall through */
    }
  }
  if (err?.response) return 'Export failed. Please try again.'
  return 'Could not reach the server. Is the backend running on port 8000?'
}

function filenameFromDisposition(header) {
  if (!header) return null
  const match = /filename="?([^"]+)"?/.exec(header)
  return match ? match[1] : null
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
