import { useState } from 'react'
import { PillarBadge } from '../components/ui/PillarBadge'
import { ScoreBadge } from '../components/ui/ScoreBadge'
import type { PillarKey } from '../types'
import { Library, Star, Copy, Archive } from 'lucide-react'

type ContentType = 'roteiro' | 'legenda' | 'carrossel' | 'hook' | 'copy_oferta' | 'dm_template'

interface LibItem {
  id: string
  tipo: ContentType
  titulo: string
  preview: string
  pilar?: PillarKey
  quality_score?: number
  starred: boolean
  created_at: string
}

const TYPE_LABELS: Record<ContentType, string> = {
  roteiro: 'Roteiro', legenda: 'Legenda', carrossel: 'Carrossel',
  hook: 'Hook', copy_oferta: 'Copy Oferta', dm_template: 'Template DM',
}

const MOCK_ITEMS: LibItem[] = []

export function Biblioteca() {
  const [items] = useState<LibItem[]>(MOCK_ITEMS)
  const [filterTipo, setFilterTipo] = useState<ContentType | 'todos'>('todos')
  const [filterPilar, setFilterPilar] = useState<PillarKey | 'todos'>('todos')
  const [filterScore, setFilterScore] = useState(0)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'conteudo' | 'hooks' | 'templates'>('conteudo')

  const filtered = items.filter(item => {
    if (filterTipo !== 'todos' && item.tipo !== filterTipo) return false
    if (filterPilar !== 'todos' && item.pilar !== filterPilar) return false
    if (filterScore > 0 && (item.quality_score || 0) < filterScore) return false
    if (search && !item.titulo.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const TABS = ['conteudo', 'hooks', 'templates'] as const

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl" style={{ color: '#f0ece0' }}>Biblioteca</h1>
        <p className="font-mono text-xs mt-0.5" style={{ color: '#4a4640' }}>{items.length} itens salvos</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b" style={{ borderColor: '#1a1a1a' }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className="font-mono text-xs px-4 py-2.5 capitalize transition-all"
            style={{
              color: activeTab === tab ? '#c9a84c' : '#4a4640',
              borderBottom: activeTab === tab ? '2px solid #c9a84c' : '2px solid transparent',
              background: 'transparent', marginBottom: -1,
            }}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'conteudo' && (
        <>
          {/* Filters */}
          <div className="flex gap-3 mb-5 flex-wrap">
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="buscar..."
              className="font-mono text-xs px-3 py-2 rounded w-48"
              style={{ background: '#111', border: '1px solid #2a2a2a', color: '#f0ece0', outline: 'none' }} />

            <select value={filterTipo} onChange={e => setFilterTipo(e.target.value as ContentType | 'todos')}
              className="font-mono text-xs px-3 py-2 rounded"
              style={{ background: '#111', border: '1px solid #2a2a2a', color: '#f0ece0' }}>
              <option value="todos">Todos os tipos</option>
              {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>

            <select value={filterPilar} onChange={e => setFilterPilar(e.target.value as PillarKey | 'todos')}
              className="font-mono text-xs px-3 py-2 rounded"
              style={{ background: '#111', border: '1px solid #2a2a2a', color: '#f0ece0' }}>
              <option value="todos">Todos os pilares</option>
              {(['VOLTAGEM','MATERIA','METODO','SINAL'] as PillarKey[]).map(p => <option key={p} value={p}>{p}</option>)}
            </select>

            <div className="flex items-center gap-2">
              <span className="font-mono text-xs" style={{ color: '#4a4640' }}>Score ≥</span>
              <input type="range" min={0} max={100} step={10} value={filterScore}
                onChange={e => setFilterScore(+e.target.value)}
                className="w-24" style={{ accentColor: '#c9a84c' }} />
              <span className="font-mono text-xs" style={{ color: '#c9a84c' }}>{filterScore}</span>
            </div>
          </div>

          {/* Grid */}
          {filtered.length === 0 ? (
            <div className="rounded-lg flex items-center justify-center" style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', minHeight: 300 }}>
              <div className="text-center space-y-2">
                <Library size={28} style={{ color: '#1a1a1a', margin: '0 auto' }} />
                <p className="font-display text-lg" style={{ color: '#2a2a2a' }}>biblioteca vazia</p>
                <p className="font-mono text-xs" style={{ color: '#1a1a1a' }}>
                  conteúdo gerado e salvo aparece aqui
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {filtered.map(item => (
                <div key={item.id} className="card-hover rounded-lg p-4 space-y-3" style={{ background: '#111' }}>
                  <div className="flex items-start justify-between">
                    <span className="font-mono text-xs" style={{ color: '#4a4640' }}>{TYPE_LABELS[item.tipo]}</span>
                    <div className="flex gap-1.5">
                      {item.quality_score && <ScoreBadge score={item.quality_score} />}
                      {item.starred && <Star size={12} style={{ color: '#c9a84c' }} fill="#c9a84c" />}
                    </div>
                  </div>
                  <div className="font-body text-sm font-medium" style={{ color: '#f0ece0' }}>{item.titulo}</div>
                  <div className="font-mono text-xs" style={{ color: '#4a4640', whiteSpace: 'pre-wrap' }}>{item.preview}</div>
                  {item.pilar && <PillarBadge pillar={item.pilar} />}
                  <div className="flex gap-2 pt-1">
                    <button className="font-mono text-xs flex items-center gap-1" style={{ color: '#4a4640' }}>
                      <Copy size={10} /> copiar
                    </button>
                    <button className="font-mono text-xs flex items-center gap-1" style={{ color: '#4a4640' }}>
                      <Archive size={10} /> arquivar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'hooks' && (
        <div className="rounded-lg flex items-center justify-center" style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', minHeight: 300 }}>
          <div className="text-center space-y-2">
            <p className="font-display text-lg" style={{ color: '#2a2a2a' }}>sem hooks salvos</p>
            <p className="font-mono text-xs" style={{ color: '#1a1a1a' }}>favorite hooks no módulo de criação</p>
          </div>
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { nome: "Roteiro 'Se Eu Fosse Criar'", tipo: 'Roteiro', serie: 'Se Eu Fosse Criar' },
            { nome: "Roteiro Método/Referência", tipo: 'Roteiro', serie: 'Método / Referência' },
            { nome: "Legenda 7 blocos (padrão)", tipo: 'Legenda', serie: null },
            { nome: "DM — Qualificação de lead", tipo: 'DM Template', serie: null },
            { nome: "DM — Objeção de preço", tipo: 'DM Template', serie: null },
          ].map(t => (
            <div key={t.nome} className="card-hover rounded-lg p-4 space-y-2" style={{ background: '#111' }}>
              <div className="font-mono text-xs" style={{ color: '#4a4640' }}>{t.tipo.toUpperCase()}</div>
              <div className="font-body text-sm font-medium" style={{ color: '#f0ece0' }}>{t.nome}</div>
              {t.serie && <div className="font-mono text-xs" style={{ color: '#c9a84c' }}>↗ {t.serie}</div>}
              <button className="font-mono text-xs px-3 py-1.5 rounded"
                style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#8a8478' }}>
                usar template
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
