// UploadZone — drag-and-drop / click upload (react-dropzone).

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'

const MAX_SIZE = 10 * 1024 * 1024 // 10 MB (matches backend MAX_FILE_SIZE_MB)

const ACCEPT = {
  'application/pdf': ['.pdf'],
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/tiff': ['.tif', '.tiff'],
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
    <section>
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        2. Upload a document
      </h2>
      <div
        {...getRootProps()}
        className={[
          'flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-10 text-center transition',
          disabled
            ? 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-500'
            : isDragActive
              ? 'cursor-pointer border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-300'
              : 'cursor-pointer border-slate-300 bg-white text-slate-600 hover:border-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-500',
        ].join(' ')}
      >
        <input {...getInputProps()} />
        {disabled ? (
          <p className="font-medium">Select CMR or AWB above first.</p>
        ) : isDragActive ? (
          <p className="font-medium">Drop the file to extract…</p>
        ) : (
          <>
            <p className="font-medium">Drag &amp; drop a document here, or click to browse</p>
            <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">PDF, PNG, JPG, or TIFF · max 10 MB</p>
          </>
        )}
      </div>
    </section>
  )
}

export default UploadZone
