import { useState } from 'react'
import { useBrand } from '../hooks/useBrand'
import { callClaude } from '../lib/anthropic'
import { buildSystemPrompt } from '../lib/brandPrompt'
import { useToast } from '../hooks/useToast'
import { ToastContainer } from '../components/ui/Toast'
import { LoadingOutput } from '../components/ui/LoadingOutput'
import { PILLAR_COLORS } from '../types'
import { TrendingUp, MessageSquare, ShoppingBag, Eye, Wand2 } from 'lucide-react'

interface WeekData {
  semana: string
  views: number
  engajamento: number
  dms: number
  vendas: number
}

const MOCK_DATA: WeekData[] = [
  { semana: 'S1 Mar', views: 3200, engajamento: 4.2, dms: 8, vendas: 1 },
  { semana: 'S2 Mar', views: 5100, engajamento: 3.8, dms: 12, vendas: 2 },
  { semana: 'S3 Mar', views: 4400, engajamento: 5.1, dms: 15, vendas: 3 },
  { semana: 'S4 Mar', views: 7800, engajamento: 6.3, dms: 22, vendas: 4 },
]

export function Metricas() {
  const { brand } = useBrand()
  const { toasts, addToast, removeToast } = useToast()
  const [insight, setInsight] = useState('')
  const [loadingInsight, setLoadingInsight] = useState(false)
  const systemPrompt = buildSystemPrompt(brand)

  const latest = MOCK_DATA[MOCK_DATA.length - 1]
  const prev = MOCK_DATA[MOCK_DATA.length - 2]
  const viewsDelta = latest.views - prev.views
  const dmsDelta = latest.dms - prev.dms

  async function generateInsight() {
    setLoadingInsight(true); setInsight('')
    try {
      const result = await callClaude({
        systemPrompt,
        userPrompt: `Analise os dados de performance abaixo para um estrategista criativo que cria conteúdo para empreendedores criativos.

Dados: ${JSON.stringify(MOCK_DATA, null, 2)}

Retorne:
1. O padrão mais importante (máx 3 linhas, específico)
2. Melhor e pior performance e hipótese do porquê
3. Análise de qual pilar está performando melhor
4. 3 recomendações acionáveis para a próxima semana (específicas)
5. Relação entre volume de posts e resultado`,
        maxTokens: 800,
        onStream: chunk => setInsight(prev => prev + chunk),
      })
      void result
    } catch (e: unknown) { addToast(e instanceof Error ? e.message : 'Erro', 'error') }
    finally { setLoadingInsight(false) }
  }

  const maxViews = Math.max(...MOCK_DATA.map(d => d.views))

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl" style={{ color: '#f0ece0' }}>Métricas & Performance</h1>
        <p className="font-mono text-xs mt-0.5" style={{ color: '#4a4640' }}>benchmark de engajamento: {'>'} 2% = bom para criativo</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Views semana', value: latest.views.toLocaleString(), delta: viewsDelta, icon: Eye, unit: '' },
          { label: 'Engajamento', value: `${latest.engajamento}%`, delta: latest.engajamento - prev.engajamento, icon: TrendingUp, unit: '%' },
          { label: 'DMs gerados', value: String(latest.dms), delta: dmsDelta, icon: MessageSquare, unit: '' },
          { label: 'Vendas', value: String(latest.vendas), delta: latest.vendas - prev.vendas, icon: ShoppingBag, unit: '' },
        ].map(({ label, value, delta, icon: Icon }) => (
          <div key={label} className="card-hover rounded-lg p-5 space-y-2" style={{ background: '#111' }}>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs" style={{ color: '#4a4640' }}>{label.toUpperCase()}</span>
              <Icon size={14} style={{ color: '#4a4640' }} />
            </div>
            <div className="font-display text-3xl" style={{ color: '#f0ece0' }}>{value}</div>
            <div className="font-mono text-xs" style={{ color: delta >= 0 ? '#3d9970' : '#c0392b' }}>
              {delta >= 0 ? '↑' : '↓'} {Math.abs(delta)}{typeof delta === 'number' && delta % 1 !== 0 ? '' : ''} vs semana anterior
            </div>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="rounded-lg p-5 mb-6" style={{ background: '#111', border: '1px solid #1a1a1a' }}>
        <div className="font-mono text-xs mb-4" style={{ color: '#4a4640' }}>VIEWS — ÚLTIMAS 4 SEMANAS</div>
        <div className="flex items-end gap-4 h-32">
          {MOCK_DATA.map(d => {
            const h = (d.views / maxViews) * 100
            return (
              <div key={d.semana} className="flex-1 flex flex-col items-center gap-2">
                <div className="font-mono text-xs" style={{ color: '#c9a84c' }}>{(d.views / 1000).toFixed(1)}k</div>
                <div className="w-full rounded-t transition-all" style={{ height: `${h}%`, background: '#c9a84c', minHeight: 4 }} />
                <div className="font-mono text-xs" style={{ color: '#4a4640' }}>{d.semana}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Pillar performance */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {(['VOLTAGEM', 'MATERIA', 'METODO', 'SINAL'] as const).map(p => {
          const color = PILLAR_COLORS[p]
          const fakeScore = Math.floor(Math.random() * 30) + 60
          return (
            <div key={p} className="rounded-lg p-3" style={{ background: '#111', border: `1px solid ${color}22` }}>
              <div className="font-mono text-xs font-bold mb-2" style={{ color }}>{p}</div>
              <div className="h-1.5 rounded-full" style={{ background: '#1a1a1a' }}>
                <div className="h-full rounded-full" style={{ width: `${fakeScore}%`, background: color }} />
              </div>
              <div className="font-mono text-xs mt-1" style={{ color: '#4a4640' }}>{fakeScore}% meta</div>
            </div>
          )
        })}
      </div>

      {/* AI Insight */}
      <div className="rounded-lg p-5" style={{ background: '#0d0d0d', border: '1px solid #1a1a1a' }}>
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-xs font-semibold" style={{ color: '#4a4640' }}>INSIGHT DE IA</span>
          <button onClick={generateInsight} disabled={loadingInsight}
            className="font-mono text-xs px-3 py-1.5 rounded flex items-center gap-1.5"
            style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#c9a84c', opacity: loadingInsight ? 0.7 : 1 }}>
            <Wand2 size={10} /> {loadingInsight ? 'analisando...' : 'Gerar análise'}
          </button>
        </div>
        {loadingInsight && !insight && <LoadingOutput />}
        {insight ? (
          <div className="output-area active text-sm" style={{ background: '#111' }}>{insight}</div>
        ) : !loadingInsight && (
          <p className="font-mono text-xs" style={{ color: '#2a2a2a' }}>clique em "Gerar análise" para obter insights</p>
        )}
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
