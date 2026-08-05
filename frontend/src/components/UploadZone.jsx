// UploadZone — drag-and-drop / click upload for the source documents of ONE
// shipment. Users stage 1–5 files (invoice, packing list, instructions, …),
// remove any before extracting, then trigger the merged extraction.

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import { FileText, FileUp, Lock, Sparkles, X } from 'lucide-react'

const MAX_SIZE = 10 * 1024 * 1024 // 10 MB (matches backend MAX_FILE_SIZE_MB)
const MAX_FILES = 5 // matches backend MAX_FILES

const ACCEPT = {
  'application/pdf': ['.pdf'],
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/tiff': ['.tif', '.tiff'],
}

const fileId = (f) => `${f.name}:${f.size}:${f.lastModified}`
const formatSize = (bytes) => `${(bytes / 1024).toFixed(0)} KB`

// Crop-mark corner brackets — a technical frame around the drop surface.
function Corners({ active }) {
  const base = 'pointer-events-none absolute h-3 w-3 transition-colors duration-200'
  const color = active ? 'border-accent' : 'border-line-strong'
  return (
    <>
      <span className={`${base} ${color} left-2 top-2 border-l border-t`} />
      <span className={`${base} ${color} right-2 top-2 border-r border-t`} />
      <span className={`${base} ${color} bottom-2 left-2 border-b border-l`} />
      <span className={`${base} ${color} bottom-2 right-2 border-b border-r`} />
    </>
  )
}

function UploadZone({ docType, onExtract }) {
  const disabled = !docType
  const [files, setFiles] = useState([])

  const addFiles = useCallback((incoming) => {
    setFiles((prev) => {
      const byId = new Map(prev.map((f) => [fileId(f), f]))
      for (const f of incoming) byId.set(fileId(f), f)
      const merged = Array.from(byId.values())
      if (merged.length > MAX_FILES) {
        toast.error(`Maximum ${MAX_FILES} documents per shipment.`)
        return merged.slice(0, MAX_FILES)
      }
      return merged
    })
  }, [])

  const removeFile = useCallback((id) => {
    setFiles((prev) => prev.filter((f) => fileId(f) !== id))
  }, [])

  const onDrop = useCallback(
    (accepted) => {
      if (accepted.length) addFiles(accepted)
    },
    [addFiles],
  )

  const onDropRejected = useCallback((rejections) => {
    const err = rejections[0]?.errors?.[0]
    if (err?.code === 'file-too-large') toast.error('A file exceeds the 10 MB limit.')
    else if (err?.code === 'file-invalid-type')
      toast.error('Unsupported file. Use PDF, PNG, JPG, or TIFF.')
    else if (err?.code === 'too-many-files')
      toast.error(`Maximum ${MAX_FILES} documents per shipment.`)
    else toast.error(err?.message || 'That file could not be accepted.')
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: ACCEPT,
    maxSize: MAX_SIZE,
    maxFiles: MAX_FILES,
    multiple: true,
    disabled,
  })

  const hasFiles = files.length > 0

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={[
          'relative flex flex-col items-center justify-center overflow-hidden rounded-xl border transition-colors duration-200',
          hasFiles ? 'min-h-[11rem]' : 'min-h-[22rem]',
          disabled
            ? 'cursor-not-allowed border-line bg-surface/40'
            : isDragActive
              ? 'cursor-copy border-accent bg-accent/[0.06]'
              : 'cursor-pointer border-line bg-surface hover:border-line-strong',
        ].join(' ')}
      >
        <div className="blueprint absolute inset-0 opacity-60" aria-hidden="true" />
        <Corners active={isDragActive && !disabled} />

        <input {...getInputProps()} />

        <div className="relative flex flex-col items-center px-6 text-center">
          <div
            className={[
              'mb-5 flex h-12 w-12 items-center justify-center rounded-lg border transition-all duration-200',
              disabled
                ? 'border-line text-faint'
                : isDragActive
                  ? 'scale-110 border-accent bg-accent text-accent-ink'
                  : 'border-line-strong bg-raised text-muted',
            ].join(' ')}
          >
            {disabled ? <Lock size={18} /> : <FileUp size={18} />}
          </div>

          {disabled ? (
            <>
              <p className="text-sm font-medium text-muted">Select an output format to begin</p>
              <p className="label-micro mt-2">Choose CMR or AWB above</p>
            </>
          ) : isDragActive ? (
            <p className="text-sm font-medium text-accent">Release to add</p>
          ) : (
            <>
              <p className="text-[0.9375rem] font-medium text-ink">
                {hasFiles
                  ? 'Add more documents for this shipment'
                  : 'Drop the shipment documents here'}
              </p>
              <p className="mt-1 text-sm text-muted">
                or{' '}
                <span className="text-accent underline decoration-accent/40 underline-offset-2">
                  browse your files
                </span>
              </p>
              <div className="mt-6 flex items-center gap-2 label-micro">
                <span>PDF · PNG · JPG · TIFF</span>
                <span className="h-2.5 w-px bg-line-strong" />
                <span>Up to {MAX_FILES} files · 10 MB each</span>
              </div>
            </>
          )}
        </div>
      </div>

      {hasFiles && (
        <div className="animate-fade-up space-y-3">
          <div className="flex items-center gap-3">
            <h3 className="label-micro text-accent">
              {files.length} {files.length === 1 ? 'document încărcat' : 'documente încărcate'}
            </h3>
            <span className="h-px flex-1 bg-line" aria-hidden="true" />
          </div>

          <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">
            {files.map((f) => {
              const id = fileId(f)
              return (
                <li key={id} className="flex items-center gap-3 px-3.5 py-2.5">
                  <FileText size={15} className="shrink-0 text-muted" />
                  <span className="min-w-0 flex-1 truncate text-[0.8125rem] text-ink" title={f.name}>
                    {f.name}
                  </span>
                  <span className="label-micro shrink-0 tabular-nums">{formatSize(f.size)}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(id)}
                    aria-label={`Remove ${f.name}`}
                    className="shrink-0 rounded-md p-1 text-faint transition-colors hover:bg-raised hover:text-ink"
                  >
                    <X size={14} />
                  </button>
                </li>
              )
            })}
          </ul>

          {files.length > 1 && (
            <p className="text-[0.75rem] leading-relaxed text-muted">
              Asigurați-vă că toate documentele aparțin aceluiași transport.
            </p>
          )}

          <button
            type="button"
            onClick={() => onExtract(files)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-accent bg-accent px-4 py-2.5 text-sm font-medium text-accent-ink transition-colors hover:bg-accent/90 sm:w-auto"
          >
            <Sparkles size={15} />
            Extract &amp; merge {files.length} {files.length === 1 ? 'document' : 'documents'}
          </button>
        </div>
      )}
    </div>
  )
}

export default UploadZone
