// ExportButton — triggers export of the (edited) fields and downloads the .xlsx.

import { Download, Loader2 } from 'lucide-react'

function ExportButton({ exporting, onExport }) {
  return (
    <button
      type="button"
      onClick={onExport}
      disabled={exporting}
      className="inline-flex items-center gap-2 rounded-lg bg-accent px-3.5 py-1.5 text-[0.8125rem] font-semibold text-accent-ink shadow-sm transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100"
    >
      {exporting ? (
        <>
          <Loader2 size={14} className="animate-spin" />
          Generating
        </>
      ) : (
        <>
          <Download size={14} />
          Export .xlsx
        </>
      )}
    </button>
  )
}

export default ExportButton
