// ExtractedFields — the extracted data as a grouped property inspector.

import { AlertTriangle } from 'lucide-react'

import FieldRow from './FieldRow'
import { groupFields } from '../lib/fieldGroups'

function ExtractedFields({ docType, fields, confidence }) {
  const groups = groupFields(docType, fields)

  return (
    <div className="space-y-7">
      {confidence === 'medium' && (
        <div className="flex items-start gap-2.5 rounded-lg border border-warn/30 bg-warn/[0.07] px-3.5 py-2.5">
          <AlertTriangle size={15} className="mt-px shrink-0 text-warn" />
          <p className="text-[0.8125rem] leading-relaxed text-ink">
            Some values are uncertain. Review each field against the source document
            before exporting.
          </p>
        </div>
      )}

      {groups.map((group) => (
        <section key={group.id} className="animate-fade-up">
          <header className="mb-2 flex items-center gap-3">
            <h3 className="label-micro text-accent">{group.title}</h3>
            <span className="h-px flex-1 bg-line" aria-hidden="true" />
            <span className="label-micro tabular-nums">
              {group.keys.length.toString().padStart(2, '0')}
            </span>
          </header>

          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-line bg-surface py-1 sm:grid-cols-2">
            {group.keys.map((key) => (
              <FieldRow key={key} fieldKey={key} value={fields[key]} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

export default ExtractedFields
