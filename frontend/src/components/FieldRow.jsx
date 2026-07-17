// FieldRow — one label/value row in the inspector. Borderless until hovered or
// focused, so a dense grid of these reads as a document rather than a form.

import { useFormContext } from 'react-hook-form'

import { humanize, isMultiline, isNumeric } from '../lib/fieldGroups'

const INPUT_BASE =
  'w-full rounded-md border border-transparent bg-transparent px-2 py-1.5 text-sm text-ink transition-colors placeholder:text-faint hover:border-line hover:bg-canvas focus:border-accent focus:bg-canvas focus:outline-none focus:ring-1 focus:ring-accent'

function FieldRow({ fieldKey, value }) {
  const { register } = useFormContext()
  const multiline = isMultiline(fieldKey, value)
  const empty = value === null || value === undefined || value === ''

  return (
    <div
      className={[
        'group grid items-start gap-2 px-3 py-1.5 transition-colors hover:bg-raised/50 sm:grid-cols-[10.5rem_minmax(0,1fr)] sm:gap-3',
        multiline ? 'sm:col-span-2' : '',
      ].join(' ')}
    >
      <label
        htmlFor={fieldKey}
        className="label-micro flex items-center gap-1.5 pt-2 leading-none"
      >
        <span className="truncate">{humanize(fieldKey)}</span>
        {empty && (
          <span
            className="h-1 w-1 shrink-0 rounded-full bg-line-strong"
            title="Not found in the document"
            aria-label="Not found in the document"
          />
        )}
      </label>

      {multiline ? (
        <textarea
          id={fieldKey}
          rows={2}
          placeholder="—"
          {...register(fieldKey)}
          className={`${INPUT_BASE} resize-y leading-relaxed`}
        />
      ) : (
        <input
          id={fieldKey}
          type="text"
          placeholder="—"
          {...register(fieldKey)}
          className={`${INPUT_BASE} ${isNumeric(fieldKey) ? 'font-mono text-[0.8125rem]' : ''}`}
        />
      )}
    </div>
  )
}

export default FieldRow
