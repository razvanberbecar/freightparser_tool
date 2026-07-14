// DocTypeSelector — pick the output document type (CMR or AWB).

const TYPES = [
  { id: 'cmr', label: 'CMR', desc: 'Road freight — Scrisoare de trasură' },
  { id: 'awb', label: 'AWB', desc: 'Air Waybill' },
]

function DocTypeSelector({ value, onChange }) {
  return (
    <section>
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        1. Choose output document
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {TYPES.map((type) => {
          const selected = value === type.id
          return (
            <button
              key={type.id}
              type="button"
              onClick={() => onChange(type.id)}
              className={[
                'rounded-lg border p-4 text-left transition',
                selected
                  ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500 dark:border-emerald-500 dark:bg-emerald-500/10'
                  : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-500',
              ].join(' ')}
            >
              <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{type.label}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">{type.desc}</div>
            </button>
          )
        })}
      </div>
    </section>
  )
}

export default DocTypeSelector
