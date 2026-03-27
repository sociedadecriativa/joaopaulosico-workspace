import { useState } from 'react'
import { useBrand } from '../hooks/useBrand'
import { useToast } from '../hooks/useToast'
import { ToastContainer } from '../components/ui/Toast'
import { buildSystemPrompt } from '../lib/brandPrompt'
import { callClaude } from '../lib/anthropic'
import { PillarBadge } from '../components/ui/PillarBadge'
import { LoadingOutput } from '../components/ui/LoadingOutput'
import type { PillarKey } from '../types'
import { PILLAR_COLORS } from '../types'
import { Plus, Wand2, MoreHorizontal } from 'lucide-react'

type Status = 'backlog' | 'em_producao' | 'gravado' | 'publicado'

interface Idea {
  id: string
  titulo: string
  angulo?: string
  formato: string
  pilar: PillarKey
  serie?: string
  modelo_hook?: string
  hook_principal?: string
  prioridade: number
  status: Status
  data_sugerida?: string
}

const SEED_IDEAS: Idea[] = [
  { id: '1', titulo: 'Por que fotógrafo que cobra pouco perde cliente bom', angulo: 'Efeito Veblen aplicado à precificação', formato: 'reel', pilar: 'METODO', serie: 'Método / Referência', modelo_hook: 'contrintuitivo', hook_principal: 'Cobrar pouco não é humildade.', prioridade: 5, status: 'backlog' },
  { id: '2', titulo: 'Se eu fosse criar um estúdio de vídeo', angulo: 'Série Se Eu Fosse Criar — videomaker', formato: 'reel', pilar: 'MATERIA', serie: 'Se Eu Fosse Criar', modelo_hook: 'caso_virada', prioridade: 4, status: 'backlog' },
  { id: '3', titulo: 'O social media que para de vender posts', angulo: 'StoryBrand aplicado ao repositório de social media', formato: 'reel', pilar: 'METODO', modelo_hook: 'diagnostico', hook_principal: 'O seu cliente não acorda pensando em posts.', prioridade: 5, status: 'backlog' },
  { id: '4', titulo: 'Designer que compete em preço sempre perde', angulo: 'Blue Ocean aplicado ao mercado de design', formato: 'reel', pilar: 'METODO', modelo_hook: 'contrintuitivo', prioridade: 4, status: 'em_producao' },
  { id: '5', titulo: 'Manifesto: por que eu trabalho com empreendedores criativos', angulo: 'Origem pessoal — 10 milhões de criativos', formato: 'reel', pilar: 'VOLTAGEM', serie: 'Manifesto / Solo', modelo_hook: 'dado_narrativa', prioridade: 5, status: 'backlog' },
  { id: '6', titulo: 'Paralipse: o serviço que não vou recomendar', angulo: 'Copy de venda usando paralipse', formato: 'reel', pilar: 'SINAL', serie: 'Paralipse', modelo_hook: 'diagnostico', prioridade: 5, status: 'backlog' },
  { id: '7', titulo: 'O que Taylor Swift fez que nenhum criativo tem coragem', angulo: 'Estratégia de diferenciação — escassez deliberada', formato: 'reel', pilar: 'VOLTAGEM', modelo_hook: 'caso_virada', hook_principal: 'Em 2014, Taylor Swift tirou o catálogo inteiro do Spotify.', prioridade: 4, status: 'gravado' },
]

const COLUMNS: { id: Status; label: string }[] = [
  { id: 'backlog', label: 'Backlog' },
  { id: 'em_producao', label: 'Em Produção' },
  { id: 'gravado', label: 'Gravado' },
  { id: 'publicado', label: 'Publicado' },
]

function IdeaCard({ idea, onMove }: { idea: Idea; onMove: (id: string, status: Status) => void }) {
  const color = PILLAR_COLORS[idea.pilar]
  return (
    <div className="card-hover rounded-lg p-4 space-y-2 cursor-pointer" style={{ background: '#111', marginBottom: 8 }}>
      <div className="flex items-start justify-between gap-2">
        <div className="font-body text-xs font-medium leading-snug flex-1" style={{ color: '#f0ece0' }}>
          {idea.titulo}
        </div>
        <button className="shrink-0" style={{ color: '#4a4640' }}>
          <MoreHorizontal size={12} />
        </button>
      </div>
      {idea.angulo && <div className="font-mono text-xs" style={{ color: '#4a4640' }}>{idea.angulo}</div>}
      {idea.hook_principal && (
        <div className="font-body text-xs italic px-2 py-1 rounded" style={{ background: '#1a1a1a', color: '#8a8478', borderLeft: `2px solid ${color}` }}>
          "{idea.hook_principal}"
        </div>
      )}
      <div className="flex items-center gap-2 flex-wrap">
        <PillarBadge pillar={idea.pilar} />
        {idea.serie && <span className="font-mono text-xs" style={{ color: '#4a4640' }}>{idea.serie}</span>}
        <span className="font-mono text-xs" style={{ color: '#2a2a2a' }}>{'★'.repeat(idea.prioridade)}</span>
      </div>
      <div className="flex gap-1">
        {COLUMNS.filter(c => c.id !== idea.status).slice(0, 2).map(col => (
          <button key={col.id} onClick={() => onMove(idea.id, col.id)}
            className="font-mono text-xs px-2 py-0.5 rounded"
            style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#4a4640' }}>
            → {col.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function Pautas() {
  const [ideas, setIdeas] = useState<Idea[]>(SEED_IDEAS)
  const [generating, setGenerating] = useState(false)
  const [tema, setTema] = useState('')
  const [showGenerator, setShowGenerator] = useState(false)
  const { brand } = useBrand()
  const { toasts, addToast, removeToast } = useToast()
  const systemPrompt = buildSystemPrompt(brand)

  function moveIdea(id: string, status: Status) {
    setIdeas(prev => prev.map(i => i.id === id ? { ...i, status } : i))
    addToast(`Movido para ${status}`)
  }

  async function generateIdeas() {
    if (!tema.trim()) return addToast('Informe temas em alta', 'error')
    setGenerating(true)
    try {
      const prompt = `Gere 5 pautas de conteúdo para empreendedores criativos (fotógrafos, designers, social medias, arquitetos, produtores musicais).

Temas em alta: ${tema}

Para cada pauta, distribua pelos pilares: VOLTAGEM 20% | MATÉRIA 30% | MÉTODO 30% | SINAL 20%

Retorne APENAS array JSON:
[{"titulo":"","angulo":"","formato":"reel","pilar":"MATERIA","hook_sugerido":"","modelo_hook":"contrintuitivo","prioridade":4,"serie_sugerida":null}]`

      const raw = await callClaude({ systemPrompt, userPrompt: prompt, maxTokens: 1200 })
      const match = raw.match(/\[[\s\S]*\]/)
      if (match) {
        const parsed: Array<{ titulo: string; angulo: string; formato: string; pilar: string; hook_sugerido?: string; modelo_hook?: string; prioridade: number }> = JSON.parse(match[0])
        const newIdeas: Idea[] = parsed.map((p, i) => ({
          id: `ai_${Date.now()}_${i}`,
          titulo: p.titulo,
          angulo: p.angulo,
          formato: p.formato || 'reel',
          pilar: (p.pilar as PillarKey) || 'MATERIA',
          hook_principal: p.hook_sugerido,
          modelo_hook: p.modelo_hook,
          prioridade: p.prioridade || 3,
          status: 'backlog',
        }))
        setIdeas(prev => [...prev, ...newIdeas])
        addToast(`${newIdeas.length} pautas adicionadas ao backlog`)
        setShowGenerator(false)
        setTema('')
      }
    } catch (e: unknown) { addToast(e instanceof Error ? e.message : 'Erro', 'error') }
    finally { setGenerating(false) }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl" style={{ color: '#f0ece0' }}>Banco de Pautas</h1>
          <p className="font-mono text-xs mt-0.5" style={{ color: '#4a4640' }}>{ideas.length} pautas total</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowGenerator(!showGenerator)}
            className="font-mono text-xs px-4 py-2 rounded flex items-center gap-2 transition-colors"
            style={{ background: '#161616', border: '1px solid #2a2a2a', color: '#c9a84c' }}>
            <Wand2 size={12} /> Gerar com IA
          </button>
          <button className="font-mono text-xs px-4 py-2 rounded flex items-center gap-2"
            style={{ background: '#c9a84c', color: '#0a0a0a' }}>
            <Plus size={12} /> Nova pauta
          </button>
        </div>
      </div>

      {showGenerator && (
        <div className="mb-6 p-4 rounded-lg space-y-3" style={{ background: '#111', border: '1px solid #c9a84c33' }}>
          <div className="font-mono text-xs font-semibold" style={{ color: '#c9a84c' }}>GERADOR DE PAUTAS — IA</div>
          <textarea
            value={tema}
            onChange={e => setTema(e.target.value)}
            placeholder="Cole temas em alta, tendências do nicho, assuntos do momento..."
            rows={3}
            className="w-full font-mono text-xs px-3 py-2 rounded resize-none"
            style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#f0ece0' }}
          />
          <button onClick={generateIdeas} disabled={generating}
            className="font-mono text-sm font-semibold px-6 py-2.5 rounded flex items-center gap-2"
            style={{ background: '#c9a84c', color: '#0a0a0a', opacity: generating ? 0.7 : 1 }}>
            {generating ? <><span className="animate-spin">↻</span> gerando...</> : 'Gerar 5 Pautas'}
          </button>
        </div>
      )}

      {/* Kanban */}
      <div className="grid grid-cols-4 gap-4" style={{ minHeight: '60vh' }}>
        {COLUMNS.map(col => {
          const colIdeas = ideas.filter(i => i.status === col.id)
          return (
            <div key={col.id} className="rounded-lg p-3" style={{ background: '#0d0d0d', border: '1px solid #1a1a1a' }}>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs font-semibold" style={{ color: '#8a8478' }}>{col.label.toUpperCase()}</span>
                <span className="font-mono text-xs" style={{ color: '#2a2a2a' }}>{colIdeas.length}</span>
              </div>
              <div>
                {colIdeas.map(idea => <IdeaCard key={idea.id} idea={idea} onMove={moveIdea} />)}
                {colIdeas.length === 0 && (
                  <div className="font-mono text-xs text-center py-6" style={{ color: '#2a2a2a' }}>vazio</div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
