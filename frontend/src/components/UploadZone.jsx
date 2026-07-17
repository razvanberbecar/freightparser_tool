// UploadZone — drag-and-drop / click upload (react-dropzone).

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import { FileUp, Lock } from 'lucide-react'

const MAX_SIZE = 10 * 1024 * 1024 // 10 MB (matches backend MAX_FILE_SIZE_MB)

const ACCEPT = {
  'application/pdf': ['.pdf'],
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/tiff': ['.tif', '.tiff'],
}

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

function UploadZone({ docType, onFile }) {
  const disabled = !docType

  const onDrop = useCallback(
    (accepted) => {
      if (accepted[0]) onFile(accepted[0])
    },
    [onFile],
  )

  const onDropRejected = useCallback((rejections) => {
    const err = rejections[0]?.errors?.[0]
    if (err?.code === 'file-too-large') toast.error('File exceeds the 10 MB limit.')
    else if (err?.code === 'file-invalid-type')
      toast.error('Unsupported file. Use PDF, PNG, JPG, or TIFF.')
    else toast.error(err?.message || 'That file could not be accepted.')
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: ACCEPT,
    maxSize: MAX_SIZE,
    multiple: false,
    disabled,
  })

  return (
    <div
      {...getRootProps()}
      className={[
        'relative flex min-h-[22rem] flex-col items-center justify-center overflow-hidden rounded-xl border transition-colors duration-200',
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
          <p className="text-sm font-medium text-accent">Release to extract</p>
        ) : (
          <>
            <p className="text-[0.9375rem] font-medium text-ink">
              Drop a freight document here
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
              <span>Max 10 MB</span>
              <span className="h-2.5 w-px bg-line-strong" />
              <span>First 3 pages</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default UploadZone
