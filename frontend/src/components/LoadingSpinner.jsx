// LoadingSpinner — shown while Claude extracts the document.

function LoadingSpinner({ label = 'Extracting fields…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white p-10 dark:border-slate-700 dark:bg-slate-800">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500 dark:border-slate-600 dark:border-t-emerald-500" />
      <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{label}</p>
    </div>
  )
}

export default LoadingSpinner
