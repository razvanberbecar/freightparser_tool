// ExtractedFields — editable form of the extracted data (react-hook-form).

import { useFormContext } from 'react-hook-form'

const humanize = (key) =>
  key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

// Fields likely to hold long / multi-line values get a textarea.
const MULTILINE = /address|description|instructions|goods|agreements|marks|shipper|consignee|carrier|accounting|handling|info|notify|third_party/

const isMultiline = (key, value) =>
  MULTILINE.test(key) || (typeof value === 'string' && value.length > 45)

const CONFIDENCE_STYLE = {
  high: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300',
  medium: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
  low: 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300',
}

function ExtractedFields({ fields, confidence, onReset }) {
  const { register } = useFormContext()
  const keys = Object.keys(fields)

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          3. Review &amp; edit fields
        </h2>
        <div className="flex items-center gap-3">
          {confidence && (
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                CONFIDENCE_STYLE[confidence] || 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
              }`}
            >
              confidence: {confidence}
            </span>
          )}
          <button
            type="button"
            onClick={onReset}
            className="text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          >
            Start over
          </button>
        </div>
      </div>

      {confidence === 'medium' && (
        <p className="mb-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
          Some fields may be uncertain — please review carefully before exporting.
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {keys.map((key) => (
          <div key={key} className="flex flex-col">
            <label htmlFor={key} className="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">
              {humanize(key)}
            </label>
            {isMultiline(key, fields[key]) ? (
              <textarea
                id={key}
                rows={2}
                {...register(key)}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-emerald-500"
              />
            ) : (
              <input
                id={key}
                type="text"
                {...register(key)}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-emerald-500"
              />
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

export default ExtractedFields
