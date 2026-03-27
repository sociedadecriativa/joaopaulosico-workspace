import type { PillarKey } from '../../types'
import { PILLAR_COLORS, PILLAR_LABELS } from '../../types'

interface Props {
  pillar: PillarKey
  size?: 'sm' | 'md'
}

export function PillarBadge({ pillar, size = 'sm' }: Props) {
  const color = PILLAR_COLORS[pillar]
  return (
    <span
      className="pillar-badge"
      style={{
        color,
        border: `1px solid ${color}22`,
        background: `${color}15`,
        fontSize: size === 'sm' ? '0.6rem' : '0.7rem',
      }}
    >
      {PILLAR_LABELS[pillar]}
    </span>
  )
}
