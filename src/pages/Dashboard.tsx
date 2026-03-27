import { useNavigate } from 'react-router-dom'
import { useBrand } from '../hooks/useBrand'
import { PILLAR_COLORS, PILLAR_LABELS, type PillarKey } from '../types'
import { Wand2, Lightbulb, Library, Target, Zap, Brain, Flame, Video } from 'lucide-react'

const PILLARS: { key: PillarKey; objetivo: string; metaPost: number }[] = [
  { key: 'VOLTAGEM', objetivo: 'Alcance', metaPost: 1 },
  { key: 'MATERIA', objetivo: 'Autoridade', metaPost: 2 },
  { key: 'METODO', objetivo: 'Educação', metaPost: 1 },
  { key: 'SINAL', objetivo: 'Conversão', metaPost: 1 },
]

const QUICK_ACTIONS = [
  { label: 'Roteiro', path: '/criar?tab=roteiro', icon: Video },
  { label: 'Legenda', path: '/criar?tab=legenda', icon: Wand2 },
  { label: 'Carrossel', path: '/criar?tab=carrossel', icon: Library },
  { label: 'Hook', path: '/criar?tab=hook', icon: Zap },
  { label: 'Copy Oferta', path: '/criar?tab=oferta', icon: Target },
  { label: 'Template DM', path: '/criar?tab=dm', icon: Brain },
]

export function Dashboard() {
  const { brand, loading } = useBrand()
  const navigate = useNavigate()

  if (loading) return (
    <div className="p-8">
      <div className="h-6 w-48 rounded gold-pulse" style={{ background: '#2a2a2a' }} />
    </div>
  )

  const scorePercent = (brand.score_atual / 10) * 100
  const metaPercent = (brand.meta_90d / 10) * 100

  return (
    <div className="p-8 space-y-8 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl" style={{ color: '#f0ece0' }}>
          {brand.handle}
        </h1>
        <p className="font-mono text-xs mt-1" style={{ color: '#4a4640' }}>
          sistema operacional da sua marca
        </p>
      </div>

      {/* Row 1 — Status */}
      <div className="grid grid-cols-4 gap-4">
        {/* Score card */}
        <div className="card-hover rounded-lg p-5 space-y-3 col-span-1" style={{ background: '#111' }}>
          <div className="font-mono text-xs" style={{ color: '#4a4640' }}>BRAND SCORE</div>
          <div className="flex items-end gap-2">
            <span className="font-display text-4xl" style={{ color: '#c9a84c' }}>
              {brand.score_atual}
            </span>
            <span className="font-mono text-xs pb-1.5" style={{ color: '#4a4640' }}>/10</span>
          </div>
          <div className="space-y-1">
            <div className="score-bar">
              <div className="score-bar-fill" style={{ width: `${scorePercent}%`, background: '#c9a84c' }} />
            </div>
            <div className="font-mono text-xs" style={{ color: '#4a4640' }}>
              meta 90d: {brand.meta_90d}
            </div>
            <div className="score-bar">
              <div className="score-bar-fill" style={{ width: `${metaPercent}%`, background: '#2a2a2a' }} />
            </div>
          </div>
        </div>

        {/* Stats */}
        {[
          { label: 'Esta semana', value: '0', sub: 'publicados / 5 meta' },
          { label: 'Quality médio', value: '—', sub: 'últimos 10 conteúdos' },
          { label: 'Pipeline', value: '0', sub: 'DMs ativos' },
        ].map(({ label, value, sub }) => (
          <div key={label} className="card-hover rounded-lg p-5 space-y-2" style={{ background: '#111' }}>
            <div className="font-mono text-xs" style={{ color: '#4a4640' }}>{label.toUpperCase()}</div>
            <div className="font-display text-3xl" style={{ color: '#f0ece0' }}>{value}</div>
            <div className="font-mono text-xs" style={{ color: '#4a4640' }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Row 2 — Pillars */}
      <div>
        <h2 className="font-mono text-xs mb-3" style={{ color: '#4a4640' }}>PILARES EDITORIAIS</h2>
        <div className="grid grid-cols-4 gap-4">
          {PILLARS.map(({ key, objetivo, metaPost }) => {
            const color = PILLAR_COLORS[key]
            return (
              <div
                key={key}
                className="rounded-lg p-4 space-y-2 transition-all duration-200 cursor-pointer"
                style={{ background: '#111', border: `1px solid ${color}22` }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = color
                  e.currentTarget.style.boxShadow = `0 0 20px ${color}20`
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = `${color}22`
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold" style={{ color }}>
                    {PILLAR_LABELS[key]}
                  </span>
                  <span className="font-mono text-xs" style={{ color: '#4a4640' }}>
                    {objetivo}
                  </span>
                </div>
                <div className="font-mono text-xs" style={{ color: '#4a4640' }}>
                  meta: {metaPost}x/semana
                </div>
                <div className="h-1 rounded" style={{ background: `${color}22` }}>
                  <div className="h-full rounded" style={{ width: '0%', background: color }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Row 3 — Quick Create */}
      <div>
        <h2 className="font-mono text-xs mb-3" style={{ color: '#4a4640' }}>CRIAR AGORA</h2>
        <div className="grid grid-cols-6 gap-3">
          {QUICK_ACTIONS.map(({ label, path, icon: Icon }) => (
            <button
              key={label}
              onClick={() => navigate(path)}
              className="card-hover rounded-lg p-4 flex flex-col items-center gap-2 transition-all duration-200"
              style={{ background: '#111' }}
            >
              <Icon size={20} style={{ color: '#c9a84c' }} />
              <span className="font-mono text-xs" style={{ color: '#8a8478' }}>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Row 4 — Upcoming */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-mono text-xs" style={{ color: '#4a4640' }}>PRÓXIMOS NO CALENDÁRIO</h2>
          <button
            onClick={() => navigate('/calendario')}
            className="font-mono text-xs"
            style={{ color: '#c9a84c' }}
          >
            ver calendário →
          </button>
        </div>
        <div
          className="rounded-lg p-6 flex items-center justify-center"
          style={{ background: '#111', border: '1px solid #1a1a1a', minHeight: 80 }}
        >
          <div className="text-center space-y-1">
            <Flame size={20} style={{ color: '#2a2a2a', margin: '0 auto' }} />
            <p className="font-mono text-xs" style={{ color: '#4a4640' }}>
              nenhum item agendado
            </p>
            <button
              onClick={() => navigate('/calendario')}
              className="font-mono text-xs underline"
              style={{ color: '#c9a84c' }}
            >
              adicionar ao calendário
            </button>
          </div>
        </div>
      </div>

      {/* Row 5 — Recent */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-mono text-xs" style={{ color: '#4a4640' }}>ÚLTIMAS CRIAÇÕES</h2>
          <button
            onClick={() => navigate('/biblioteca')}
            className="font-mono text-xs"
            style={{ color: '#c9a84c' }}
          >
            ver biblioteca →
          </button>
        </div>
        <div
          className="rounded-lg p-6 flex items-center justify-center"
          style={{ background: '#111', border: '1px solid #1a1a1a', minHeight: 80 }}
        >
          <div className="text-center space-y-1">
            <Library size={20} style={{ color: '#2a2a2a', margin: '0 auto' }} />
            <p className="font-mono text-xs" style={{ color: '#4a4640' }}>
              biblioteca vazia
            </p>
            <button
              onClick={() => navigate('/criar')}
              className="font-mono text-xs underline"
              style={{ color: '#c9a84c' }}
            >
              gerar primeiro conteúdo
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
