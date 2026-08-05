// ConflictReview — shown when merging several documents surfaced fields that
// disagree. The user picks the correct value for each; the choice replaces the
// field in the merged data set (and the editable form).

import { GitCompareArrows } from 'lucide-react'

import { humanize } from '../lib/fieldGroups'

const displayValue = (v) => {
  if (v === null || v === undefined || v === '') return '—'
  return String(v)
}

function ConflictReview({ conflicts, onResolve }) {
  if (!conflicts || conflicts.length === 0) return null

  return (
    <section className="animate-fade-up rounded-lg border border-warn/40 bg-warn/[0.06] p-4">
      <header className="mb-3 flex items-center gap-2.5">
        <GitCompareArrows size={16} className="shrink-0 text-warn" />
        <h3 className="text-sm font-medium text-ink">
          {conflicts.length} {conflicts.length === 1 ? 'conflict' : 'conflicts'} to resolve
        </h3>
      </header>

      <p className="mb-4 text-[0.8125rem] leading-relaxed text-muted">
        These fields had different values across your documents. Pick the correct one for each
        before exporting.
      </p>

      <div className="space-y-3">
        {conflicts.map((conflict) => (
          <fieldset
            key={conflict.field}
            className="rounded-md border border-line bg-surface p-3"
          >
            <legend className="label-micro px-1 text-accent">{humanize(conflict.field)}</legend>
            <div className="mt-1 grid gap-2 sm:grid-cols-2">
              {conflict.values.map((candidate, i) => (
                <label
                  key={`${conflict.field}-${i}`}
                  className="flex cursor-pointer items-start gap-2.5 rounded-md border border-line bg-canvas px-3 py-2 transition-colors hover:border-line-strong"
                >
                  <input
                    type="radio"
                    name={`conflict-${conflict.field}`}
                    className="mt-0.5 shrink-0 accent-accent"
                    onChange={() => onResolve(conflict.field, candidate.value)}
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-[0.8125rem] font-medium text-ink">
                      {displayValue(candidate.value)}
                    </span>
                    {candidate.source && (
                      <span className="label-micro mt-0.5 block">from {candidate.source}</span>
                    )}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
    </section>
  )
}

export default ConflictReview
