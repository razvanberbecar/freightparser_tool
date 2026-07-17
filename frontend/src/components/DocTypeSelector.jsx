// DocTypeSelector — segmented control for the output document type.

const TYPES = [
  { id: 'cmr', label: 'CMR', desc: 'Road freight — Scrisoare de trăsură' },
  { id: 'awb', label: 'AWB', desc: 'Air Waybill' },
]

function DocTypeSelector({ value, onChange }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="label-micro hidden sm:inline">Output</span>
      <div
        role="radiogroup"
        aria-label="Output document type"
        className={[
          'inline-flex rounded-lg border bg-raised p-0.5 transition-colors',
          value ? 'border-line' : 'border-accent/50',
        ].join(' ')}
      >
        {TYPES.map((type) => {
          const selected = value === type.id
          return (
            <button
              key={type.id}
              type="button"
              role="radio"
              aria-checked={selected}
              title={type.desc}
              onClick={() => onChange(type.id)}
              className={[
                'rounded-md px-3 py-1 font-mono text-xs font-medium tracking-wide transition-all',
                selected
                  ? 'bg-accent text-accent-ink shadow-sm'
                  : 'text-muted hover:text-ink',
              ].join(' ')}
            >
              {type.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default DocTypeSelector
