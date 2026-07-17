// ConfidenceBadge — signal-strength meter for the extraction confidence.

const LEVELS = {
  high: { bars: 3, text: 'text-ok', fill: 'bg-ok' },
  medium: { bars: 2, text: 'text-warn', fill: 'bg-warn' },
  low: { bars: 1, text: 'text-danger', fill: 'bg-danger' },
}

const HEIGHTS = ['h-1.5', 'h-2.5', 'h-3.5']

function ConfidenceBadge({ confidence }) {
  const level = LEVELS[confidence]
  if (!level) return null

  return (
    <span
      className="inline-flex items-center gap-1.5"
      title={`Model confidence: ${confidence}`}
    >
      <span className="flex items-end gap-[2px]" aria-hidden="true">
        {HEIGHTS.map((height, i) => (
          <span
            key={height}
            className={`w-[3px] rounded-sm ${height} ${
              i < level.bars ? level.fill : 'bg-line-strong/50'
            }`}
          />
        ))}
      </span>
      <span className={`label-micro ${level.text}`}>{confidence}</span>
    </span>
  )
}

export default ConfidenceBadge
