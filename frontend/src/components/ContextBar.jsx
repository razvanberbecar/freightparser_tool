// ContextBar — the working context: output type, source file, and the primary
// action. Pinned under the TopBar so Export is always in reach while editing.

import { RotateCcw } from 'lucide-react'

import ConfidenceBadge from './ConfidenceBadge'
import DocTypeSelector from './DocTypeSelector'
import ExportButton from './ExportButton'

function ContextBar({
  docType,
  onDocTypeChange,
  ready,
  fileName,
  confidence,
  fieldCount,
  exporting,
  onExport,
  onReset,
}) {
  return (
    <div className="sticky top-14 z-20 border-b border-line bg-canvas/85 backdrop-blur-md">
      <div className="mx-auto flex h-12 max-w-5xl items-center gap-3 px-5">
        <DocTypeSelector value={docType} onChange={onDocTypeChange} />

        {ready && fileName && (
          <>
            <span className="hidden h-3 w-px bg-line md:block" aria-hidden="true" />
            <span
              className="hidden max-w-[16rem] truncate font-mono text-xs text-muted md:block"
              title={fileName}
            >
              {fileName}
            </span>
          </>
        )}

        <div className="flex-1" />

        {ready && (
          <div className="flex items-center gap-3">
            <span className="label-micro hidden tabular-nums sm:inline">
              {fieldCount} fields
            </span>
            <ConfidenceBadge confidence={confidence} />

            <span className="h-3 w-px bg-line" aria-hidden="true" />

            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[0.8125rem] font-medium text-muted transition-colors hover:bg-raised hover:text-ink"
            >
              <RotateCcw size={13} />
              <span className="hidden sm:inline">Start over</span>
            </button>

            <ExportButton exporting={exporting} onExport={onExport} />
          </div>
        )}
      </div>
    </div>
  )
}

export default ContextBar
