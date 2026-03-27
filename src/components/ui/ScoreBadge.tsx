import { scoreColor, scoreLabel } from '../../lib/qualityAudit'

interface Props {
  score: number
  showLabel?: boolean
}

export function ScoreBadge({ score, showLabel = false }: Props) {
  const color = scoreColor(score)
  return (
    <span
      className="font-mono text-xs font-semibold px-2 py-0.5 rounded"
      style={{ color, border: `1px solid ${color}33`, background: `${color}18` }}
    >
      {score}{showLabel ? ` — ${scoreLabel(score)}` : ''}
    </span>
  )
}

export function ScoreBar({ score }: { score: number }) {
  const color = scoreColor(score)
  return (
    <div className="score-bar w-full">
      <div
        className="score-bar-fill"
        style={{ width: `${score}%`, background: color }}
      />
    </div>
  )
}
