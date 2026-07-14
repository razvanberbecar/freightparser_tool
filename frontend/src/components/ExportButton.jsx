// ExportButton — triggers export of the (edited) fields and downloads the .xlsx.

function ExportButton({ exporting, onExport }) {
  return (
    <div className="flex justify-end">
      <button
        type="button"
        onClick={onExport}
        disabled={exporting}
        className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {exporting ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            Generating…
          </>
        ) : (
          'Export to Excel'
        )}
      </button>
    </div>
  )
}

export default ExportButton
