// LoadingSpinner — the scanning state shown while Claude extracts the document.

import { FileText } from 'lucide-react'

function LoadingSpinner({ label = 'Extracting fields' }) {
  return (
    <div className="flex min-h-[22rem] flex-col items-center justify-center rounded-xl border border-line bg-surface">
      {/* Document glyph with an accent scan line sweeping across it. */}
      <div className="relative mb-5 flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border border-line-strong bg-raised text-muted">
        <FileText size={18} />
        <span
          className="absolute inset-x-0 top-0 h-6 animate-sweep bg-gradient-to-b from-transparent via-accent/70 to-transparent"
          aria-hidden="true"
        />
      </div>

      <p className="text-[0.9375rem] font-medium text-ink" role="status" aria-live="polite">
        {label}
      </p>
      <p className="label-micro mt-2">Reading the document · this takes a few seconds</p>
    </div>
  )
}

export default LoadingSpinner
