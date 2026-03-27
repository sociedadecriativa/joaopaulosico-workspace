import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useBrand } from '../hooks/useBrand'
import { useToast } from '../hooks/useToast'
import { ToastContainer } from '../components/ui/Toast'
import { buildSystemPrompt } from '../lib/brandPrompt'
import { callClaude } from '../lib/anthropic'
import { auditContent } from '../lib/qualityAudit'
import { AuditPanel } from '../components/ui/AuditPanel'
import { LoadingOutput } from '../components/ui/LoadingOutput'
import type { AuditResult, PillarKey } from '../types'
import { PILLAR_COLORS } from '../types'
import { Copy, Star, Save, RefreshCw, Video, AlignLeft, Layers, Zap, Target, MessageSquare } from 'lucide-react'

type Tab = 'roteiro' | 'legenda' | 'carrossel' | 'hook' | 'oferta' | 'dm'

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ size: number }> }[] = [
  { id: 'roteiro', label: 'Roteiro', icon: Video },
  { id: 'legenda', label: 'Legenda', icon: AlignLeft },
  { id: 'carrossel', label: 'Carrossel', icon: Layers },
  { id: 'hook', label: 'Hook', icon: Zap },
  { id: 'oferta', label: 'Copy Oferta', icon: Target },
  { id: 'dm', label: 'Template DM', icon: MessageSquare },
]

const PILLARS: PillarKey[] = ['VOLTAGEM', 'MATERIA', 'METODO', 'SINAL']
const PILLAR_DISPLAY: Record<PillarKey, string> = {
  VOLTAGEM: 'VOLTAGEM', MATERIA: 'MATÉRIA', METODO: 'MÉTODO', SINAL: 'SINAL'
}

// Shared select/button components
function Select({ value, onChange, options }: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full font-mono text-xs px-3 py-2 rounded"
      style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#f0ece0' }}
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="font-mono text-xs mb-1.5" style={{ color: '#4a4640' }}>{children}</div>
}

function Textarea({ value, onChange, placeholder, rows = 3 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number
}) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full font-mono text-xs px-3 py-2 rounded resize-none"
      style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#f0ece0', outline: 'none' }}
    />
  )
}

function PillarToggle({ value, onChange }: { value: PillarKey; onChange: (v: PillarKey) => void }) {
  return (
    <div className="flex gap-1 flex-wrap">
      {PILLARS.map(p => {
        const active = value === p
        const color = PILLAR_COLORS[p]
        return (
          <button
            key={p}
            onClick={() => onChange(p)}
            className="font-mono text-xs px-3 py-1.5 rounded transition-all"
            style={{
              background: active ? `${color}22` : '#1a1a1a',
              border: `1px solid ${active ? color : '#2a2a2a'}`,
              color: active ? color : '#4a4640',
            }}
          >
            {PILLAR_DISPLAY[p]}
          </button>
        )
      })}
    </div>
  )
}

function GenerateButton({ onClick, loading, label = 'Gerar' }: {
  onClick: () => void; loading: boolean; label?: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full font-mono text-sm font-semibold py-3 rounded transition-opacity flex items-center justify-center gap-2"
      style={{ background: '#c9a84c', color: '#0a0a0a', opacity: loading ? 0.7 : 1 }}
    >
      {loading ? <RefreshCw size={14} className="animate-spin" /> : null}
      {loading ? 'gerando...' : label}
    </button>
  )
}

function OutputActions({ content, onSave, onCopy }: {
  content: string; onSave: () => void; onCopy: () => void
}) {
  return (
    <div className="flex gap-2">
      <button onClick={onCopy} className="font-mono text-xs px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors"
        style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#8a8478' }}>
        <Copy size={11} /> Copiar
      </button>
      <button onClick={onSave} className="font-mono text-xs px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors"
        style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#c9a84c' }}>
        <Save size={11} /> Salvar
      </button>
    </div>
  )
}

// ---- ROTEIRO ----
function RoteiroModule({ brand, systemPrompt }: { brand: ReturnType<typeof useBrand>['brand']; systemPrompt: string }) {
  const [pauta, setPauta] = useState('')
  const [pilar, setPilar] = useState<PillarKey>('MATERIA')
  const [duracao, setDuracao] = useState('60s')
  const [formato, setFormato] = useState('Talking Head')
  const [modeloHook, setModeloHook] = useState('Caso + Virada')
  const [objetivo, setObjetivo] = useState('Autoridade')
  const [cta, setCta] = useState('Comentar palavra')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [audit, setAudit] = useState<AuditResult | null>(null)
  const { addToast } = useToast()

  async function generate() {
    if (!pauta.trim()) return addToast('Preencha a pauta', 'error')
    setLoading(true); setOutput(''); setAudit(null)
    try {
      const prompt = `Gere um roteiro completo de Reel para ${duracao} segundos.

ESTRUTURA OBRIGATÓRIA (com timecodes):

[0–3s] HOOK
- FALA: (use o modelo ${modeloHook} — obrigatoriamente)
- TEXTO NA TELA: (max 4 palavras, maiúsculas)
- NOTA DE GRAVAÇÃO:

[3–5s] CONTEXTO
- FALA:
- TEXTO NA TELA:

[5–Xs] DESENVOLVIMENTO
- FALA: (argumento central, específico, com dado ou caso)
- TEXTO NA TELA:

[X–Ys] RE-HOOK (obrigatório — 40-60% do vídeo)
- FALA: (frase que resume tudo)
- TEXTO NA TELA:
- NOTA DE GRAVAÇÃO: (pausa visual)

[Y–Zs] AÇÃO IMEDIATA
- FALA: (instrução específica)
- TEXTO NA TELA:

[Z–fim] CTA
- FALA: (${cta} — casual)
- TEXTO NA TELA:

---
NOTAS DE EDIÇÃO:
- Fundo sugerido:
- Cortes:
- Áudio:

---
POR QUE FUNCIONA: (2-3 linhas)

Pauta: ${pauta}
Pilar: ${pilar}
Objetivo: ${objetivo}
Formato: ${formato}`

      const result = await callClaude({
        systemPrompt,
        userPrompt: prompt,
        maxTokens: 1500,
        onStream: chunk => setOutput(prev => prev + chunk),
      })
      const a = await auditContent(result)
      setAudit(a)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erro desconhecido'
      addToast(`Erro: ${msg}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-5 gap-6 h-full">
      {/* Inputs */}
      <div className="col-span-2 space-y-4">
        <div><Label>PAUTA / TEMA</Label>
          <Textarea value={pauta} onChange={setPauta} placeholder="Ex: Por que fotógrafo que cobra pouco perde cliente bom" rows={3} />
        </div>
        <div><Label>PILAR</Label><PillarToggle value={pilar} onChange={setPilar} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>DURAÇÃO</Label>
            <Select value={duracao} onChange={setDuracao} options={['30s','45s','60s','90s'].map(v => ({ value: v, label: v }))} />
          </div>
          <div><Label>FORMATO</Label>
            <Select value={formato} onChange={setFormato} options={['Talking Head','Lo-fi/Câmera na mão','Com B-roll'].map(v => ({ value: v, label: v }))} />
          </div>
        </div>
        <div><Label>MODELO DE HOOK</Label>
          <Select value={modeloHook} onChange={setModeloHook} options={['Caso + Virada','Contraintuitivo','Diagnóstico Visceral','Dado + Narrativa'].map(v => ({ value: v, label: v }))} />
        </div>
        <div><Label>OBJETIVO</Label>
          <Select value={objetivo} onChange={setObjetivo} options={['Alcance/Viralização','Geração de leads','Conversão direta','Autoridade'].map(v => ({ value: v, label: v }))} />
        </div>
        <div><Label>CTA FINAL</Label>
          <Select value={cta} onChange={setCta} options={['Comentar palavra','Link na bio','DM','Salvar','Seguir'].map(v => ({ value: v, label: v }))} />
        </div>
        <GenerateButton onClick={generate} loading={loading} label="Gerar Roteiro  ⌘↵" />
      </div>

      {/* Output */}
      <div className="col-span-3 space-y-4">
        {loading && !output && <LoadingOutput />}
        {output && (
          <>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs" style={{ color: '#4a4640' }}>ROTEIRO GERADO</span>
              <OutputActions
                content={output}
                onCopy={() => { navigator.clipboard.writeText(output); addToast('Copiado!') }}
                onSave={() => addToast('Salvo na biblioteca')}
              />
            </div>
            <div className={`output-area ${output ? 'active' : ''}`} style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {output}
            </div>
            {audit && <AuditPanel audit={audit} />}
          </>
        )}
        {!loading && !output && (
          <div className="output-area flex items-center justify-center" style={{ minHeight: 300 }}>
            <p className="font-mono text-xs" style={{ color: '#2a2a2a' }}>output aparece aqui</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ---- LEGENDA ----
function LegendaModule({ systemPrompt }: { systemPrompt: string }) {
  const [tema, setTema] = useState('')
  const [pilar, setPilar] = useState<PillarKey>('MATERIA')
  const [cta, setCta] = useState('Engajamento/comentário')
  const [tom, setTom] = useState('Provocador')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [audit, setAudit] = useState<AuditResult | null>(null)
  const { addToast } = useToast()

  async function generate() {
    if (!tema.trim()) return addToast('Preencha o tema', 'error')
    setLoading(true); setOutput(''); setAudit(null)
    try {
      const prompt = `Gere uma legenda completa para Instagram com estrutura de 7 blocos:

BLOCO 1 — CAPA (1 linha visceral, para o scroll)
BLOCO 2 — DESENVOLVIMENTO (parágrafos curtos, 1 ideia cada)
BLOCO 3 — DESPERTAR (gatilho emocional: identificação, urgência ou provocação)
BLOCO 4 — SOLUÇÃO (o que a pessoa ganha — específico)
BLOCO 5 — PERGUNTA (1 pergunta específica que gera comentário real)
BLOCO 6 — APROXIMAÇÃO (tom 1:1, máximo 2 linhas)
BLOCO 7 — CTA (único, claro: ${cta})

HASHTAGS: máximo 5, incluindo hashtags core da marca.

Tema: ${tema}
Tom: ${tom}
Pilar: ${pilar}`

      const result = await callClaude({
        systemPrompt,
        userPrompt: prompt,
        maxTokens: 1200,
        onStream: chunk => setOutput(prev => prev + chunk),
      })
      setAudit(await auditContent(result))
    } catch (e: unknown) {
      addToast(e instanceof Error ? e.message : 'Erro', 'error')
    } finally { setLoading(false) }
  }

  return (
    <div className="grid grid-cols-5 gap-6">
      <div className="col-span-2 space-y-4">
        <div><Label>TEMA</Label><Textarea value={tema} onChange={setTema} placeholder="Ex: Por que cobrar pouco afasta cliente bom" /></div>
        <div><Label>PILAR</Label><PillarToggle value={pilar} onChange={setPilar} /></div>
        <div><Label>CTA</Label>
          <Select value={cta} onChange={setCta} options={['Engajamento/comentário','DM com lead magnet','Link bio/Kiwify','Salvar','Compartilhar'].map(v => ({ value: v, label: v }))} />
        </div>
        <div><Label>TOM</Label>
          <Select value={tom} onChange={setTom} options={['Provocador','Educativo','Bastidor','Case/Prova Social','Paralipse/Irônico'].map(v => ({ value: v, label: v }))} />
        </div>
        <GenerateButton onClick={generate} loading={loading} label="Gerar Legenda" />
      </div>
      <div className="col-span-3 space-y-4">
        {loading && !output && <LoadingOutput />}
        {output ? (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#4a4640' }}>LEGENDA</span>
                <span className="font-mono text-xs" style={{ color: output.length > 2200 ? '#c0392b' : '#4a4640' }}>{output.length} chars</span>
              </div>
              <OutputActions content={output} onCopy={() => { navigator.clipboard.writeText(output); addToast('Copiado!') }} onSave={() => addToast('Salvo')} />
            </div>
            <div className="output-area active" style={{ maxHeight: '55vh', overflowY: 'auto' }}>{output}</div>
            {audit && <AuditPanel audit={audit} />}
          </>
        ) : !loading && (
          <div className="output-area flex items-center justify-center" style={{ minHeight: 280 }}>
            <p className="font-mono text-xs" style={{ color: '#2a2a2a' }}>output aparece aqui</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ---- HOOK ----
function HookModule({ systemPrompt }: { systemPrompt: string }) {
  const [tema, setTema] = useState('')
  const [modelo, setModelo] = useState('Caso + Virada')
  const [intencao, setIntencao] = useState('Atração/Alcance')
  const [output, setOutput] = useState<Array<{ numero: number; texto_tela: string; texto_falado: string; nota_gravacao: string }>>([])
  const [rawOutput, setRawOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const { addToast } = useToast()

  async function generate() {
    if (!tema.trim()) return addToast('Preencha o tema', 'error')
    setLoading(true); setOutput([]); setRawOutput('')
    try {
      const prompt = `Gere 5 hooks para o tema: ${tema}

Regras obrigatórias:
- Texto de tela: máx 4 palavras, MAIÚSCULAS
- Texto falado: máx 2 frases (0-3s)
- Nunca condicional ("quando você sentir...")
- Use exclusivamente o modelo: ${modelo}

Retorne APENAS array JSON, sem markdown:
[{"numero":1,"texto_tela":"","texto_falado":"","nota_gravacao":""},...]

Modelo: ${modelo}
Intenção: ${intencao}`

      const raw = await callClaude({ systemPrompt, userPrompt: prompt, maxTokens: 800 })
      setRawOutput(raw)
      const match = raw.match(/\[[\s\S]*\]/)
      if (match) setOutput(JSON.parse(match[0]))
    } catch (e: unknown) {
      addToast(e instanceof Error ? e.message : 'Erro', 'error')
    } finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div><Label>TEMA</Label><Textarea value={tema} onChange={setTema} placeholder="Ex: precificação no mercado criativo" rows={2} /></div>
        <div><Label>MODELO DE HOOK</Label>
          <Select value={modelo} onChange={setModelo} options={['Caso + Virada','Contraintuitivo','Diagnóstico Visceral','Dado + Narrativa'].map(v => ({ value: v, label: v }))} />
        </div>
        <div><Label>INTENÇÃO</Label>
          <Select value={intencao} onChange={setIntencao} options={['Atração/Alcance','Autoridade','Conexão','Venda/Conversão'].map(v => ({ value: v, label: v }))} />
        </div>
      </div>
      <GenerateButton onClick={generate} loading={loading} label="Gerar 5 Hooks" />

      {loading && <LoadingOutput />}
      {output.length > 0 && (
        <div className="grid grid-cols-5 gap-3">
          {output.map(hook => (
            <div key={hook.numero} className="card-hover rounded-lg p-4 space-y-3 cursor-pointer" style={{ background: '#111' }}>
              <div className="font-mono text-xs" style={{ color: '#4a4640' }}>HOOK {hook.numero}</div>
              <div className="font-display text-lg leading-tight" style={{ color: '#c9a84c' }}>
                {hook.texto_tela}
              </div>
              <div className="font-body text-xs" style={{ color: '#8a8478' }}>{hook.texto_falado}</div>
              {hook.nota_gravacao && (
                <div className="font-mono text-xs italic" style={{ color: '#4a4640' }}>↳ {hook.nota_gravacao}</div>
              )}
              <button
                onClick={() => { navigator.clipboard.writeText(`${hook.texto_tela}\n\n${hook.texto_falado}`); addToast('Hook copiado!') }}
                className="flex items-center gap-1 font-mono text-xs"
                style={{ color: '#c9a84c' }}
              >
                <Star size={10} /> usar este
              </button>
            </div>
          ))}
        </div>
      )}
      {!loading && output.length === 0 && rawOutput && (
        <div className="output-area active">{rawOutput}</div>
      )}
    </div>
  )
}

// ---- CARROSSEL ----
function CarrosselModule({ systemPrompt }: { systemPrompt: string }) {
  const [tema, setTema] = useState('')
  const [nSlides, setNSlides] = useState(7)
  const [tipo, setTipo] = useState('Educativo/Framework')
  const [pilar, setPilar] = useState<PillarKey>('METODO')
  const [cta, setCta] = useState('Comentar palavra')
  const [slides, setSlides] = useState<Array<{ numero: number; tipo: string; titulo: string; corpo?: string }>>([])
  const [legenda, setLegenda] = useState('')
  const [loading, setLoading] = useState(false)
  const { addToast } = useToast()

  async function generate() {
    if (!tema.trim()) return addToast('Preencha o tema', 'error')
    setLoading(true); setSlides([]); setLegenda('')
    try {
      const prompt = `Gere um carrossel de ${nSlides} slides. Retorne APENAS JSON válido:

{"slides":[
{"numero":1,"tipo":"capa","titulo":"max 6 palavras","subtitulo":"1 linha","corpo":"","visual_sugerido":""},
{"numero":2,"tipo":"conteudo","titulo":"max 5 palavras","corpo":"2-4 linhas","visual_sugerido":""}
],"legenda_pronta":"legenda completa 7 blocos"}

Tema: ${tema}
Tipo: ${tipo}
Pilar: ${pilar}
CTA: ${cta}`

      const raw = await callClaude({ systemPrompt, userPrompt: prompt, maxTokens: 2000 })
      const match = raw.match(/\{[\s\S]*\}/)
      if (match) {
        const parsed = JSON.parse(match[0])
        setSlides(parsed.slides || [])
        setLegenda(parsed.legenda_pronta || '')
      }
    } catch (e: unknown) {
      addToast(e instanceof Error ? e.message : 'Erro', 'error')
    } finally { setLoading(false) }
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-2"><Label>TEMA</Label><Textarea value={tema} onChange={setTema} placeholder="Ex: Por que designer que compete em preço sempre perde" rows={2} /></div>
        <div>
          <Label>TIPO</Label>
          <Select value={tipo} onChange={setTipo} options={['Educativo/Framework','Lista Provocativa','Antes/Depois','Mini-Case','Dica Prática','Se Eu Fosse Criar'].map(v => ({ value: v, label: v }))} />
        </div>
        <div>
          <Label>SLIDES ({nSlides})</Label>
          <input type="range" min={5} max={12} value={nSlides} onChange={e => setNSlides(+e.target.value)}
            className="w-full mt-1" style={{ accentColor: '#c9a84c' }} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>PILAR</Label><PillarToggle value={pilar} onChange={setPilar} /></div>
        <div><Label>CTA ÚLTIMO SLIDE</Label>
          <Select value={cta} onChange={setCta} options={['Comentar palavra','Link na bio','DM','Salvar'].map(v => ({ value: v, label: v }))} />
        </div>
      </div>
      <GenerateButton onClick={generate} loading={loading} label="Gerar Carrossel" />

      {loading && <LoadingOutput />}
      {slides.length > 0 && (
        <div className="space-y-4">
          <div className="flex gap-0 overflow-x-auto pb-2">
            {slides.map(slide => {
              const isCapa = slide.tipo === 'capa'
              const isCTA = slide.tipo === 'cta'
              return (
                <div
                  key={slide.numero}
                  className="flex-shrink-0 rounded-lg p-4 mr-3 space-y-2"
                  style={{
                    width: 180,
                    minHeight: 220,
                    background: isCapa ? '#1a1410' : isCTA ? '#101810' : '#111',
                    border: `1px solid ${isCapa ? '#c9a84c44' : isCTA ? '#3d997044' : '#2a2a2a'}`,
                  }}
                >
                  <div className="font-mono text-xs" style={{ color: '#4a4640' }}>
                    {isCapa ? 'CAPA' : isCTA ? 'CTA' : `SLIDE ${slide.numero}`}
                  </div>
                  <div className="font-display text-sm leading-snug" style={{ color: isCapa ? '#c9a84c' : '#f0ece0' }}>
                    {slide.titulo}
                  </div>
                  {slide.corpo && <div className="font-body text-xs" style={{ color: '#8a8478' }}>{slide.corpo}</div>}
                </div>
              )
            })}
          </div>
          {legenda && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs" style={{ color: '#4a4640' }}>LEGENDA DO CARROSSEL</span>
                <button onClick={() => { navigator.clipboard.writeText(legenda); addToast('Legenda copiada!') }}
                  className="font-mono text-xs px-2 py-1 rounded flex items-center gap-1"
                  style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#c9a84c' }}>
                  <Copy size={10} /> copiar
                </button>
              </div>
              <div className="output-area active" style={{ maxHeight: '30vh', overflowY: 'auto' }}>{legenda}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ---- OFERTA ----
function OfertaModule({ brand, systemPrompt }: { brand: ReturnType<typeof useBrand>['brand']; systemPrompt: string }) {
  const [produto, setProduto] = useState(0)
  const [canal, setCanal] = useState('Reel CTA')
  const [vagas, setVagas] = useState('5')
  const [urgencia, setUrgencia] = useState('Média')
  const [prova, setProva] = useState('')
  const [output, setOutput] = useState<{ versao_curta?: string; versao_longa?: string; cta_recomendado?: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const { addToast } = useToast()

  async function generate() {
    setLoading(true); setOutput(null)
    const p = brand.produtos[produto]
    if (!p) return
    try {
      const prompt = `Gere copy de oferta para ${p.nome} (${p.preco}) — canal: ${canal}.

Produto: ${p.descricao}
Vagas: ${vagas}
Urgência: ${urgencia}
Prova social: ${prova || 'não fornecida'}

REGRAS:
- Linguagem de transformação específica, nunca promessa vaga
- Incluir o que o cliente RECEBE (ex: "30+ páginas", "48h de entrega")
- CTA único e direto
- Tom: estrategista, não coach
- Proibido: "transformação", "jornada", "mudar de patamar"

Retorne JSON exato:
{"versao_curta":"","versao_longa":"","cta_recomendado":"","elemento_escassez":""}`

      const raw = await callClaude({ systemPrompt, userPrompt: prompt, maxTokens: 1000 })
      const match = raw.match(/\{[\s\S]*\}/)
      if (match) setOutput(JSON.parse(match[0]))
    } catch (e: unknown) { addToast(e instanceof Error ? e.message : 'Erro', 'error') }
    finally { setLoading(false) }
  }

  return (
    <div className="grid grid-cols-5 gap-6">
      <div className="col-span-2 space-y-4">
        <div><Label>PRODUTO</Label>
          <Select value={String(produto)} onChange={v => setProduto(+v)}
            options={brand.produtos.map((p, i) => ({ value: String(i), label: p.nome }))} />
        </div>
        <div><Label>CANAL</Label>
          <Select value={canal} onChange={setCanal} options={['Reel CTA','Story','DM','Bio','Landing Page','WhatsApp'].map(v => ({ value: v, label: v }))} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>VAGAS</Label>
            <input value={vagas} onChange={e => setVagas(e.target.value)} type="number" className="w-full font-mono text-xs px-3 py-2 rounded"
              style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#f0ece0' }} />
          </div>
          <div><Label>URGÊNCIA</Label>
            <Select value={urgencia} onChange={setUrgencia} options={['Alta — fecha hoje','Média — essa semana','Baixa — aberta'].map(v => ({ value: v, label: v }))} />
          </div>
        </div>
        <div><Label>PROVA SOCIAL (opcional)</Label><Textarea value={prova} onChange={setProva} placeholder="Ex: cliente saiu com portfólio e fechou 3 contratos em 2 semanas" rows={2} /></div>
        <GenerateButton onClick={generate} loading={loading} label="Gerar Copy de Oferta" />
      </div>
      <div className="col-span-3 space-y-4">
        {loading && <LoadingOutput />}
        {output && (
          <div className="space-y-4">
            {output.versao_curta && (
              <div className="space-y-2">
                <div className="font-mono text-xs" style={{ color: '#4a4640' }}>VERSÃO CURTA (story/DM)</div>
                <div className="output-area active">{output.versao_curta}</div>
                <button onClick={() => { navigator.clipboard.writeText(output.versao_curta || ''); addToast('Copiado!') }}
                  className="font-mono text-xs px-3 py-1.5 rounded flex items-center gap-1.5"
                  style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#c9a84c' }}>
                  <Copy size={10} /> Copiar
                </button>
              </div>
            )}
            {output.versao_longa && (
              <div className="space-y-2">
                <div className="font-mono text-xs" style={{ color: '#4a4640' }}>VERSÃO LONGA (reel/landing)</div>
                <div className="output-area active" style={{ maxHeight: '40vh', overflowY: 'auto' }}>{output.versao_longa}</div>
                <button onClick={() => { navigator.clipboard.writeText(output.versao_longa || ''); addToast('Copiado!') }}
                  className="font-mono text-xs px-3 py-1.5 rounded flex items-center gap-1.5"
                  style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#c9a84c' }}>
                  <Copy size={10} /> Copiar
                </button>
              </div>
            )}
          </div>
        )}
        {!loading && !output && (
          <div className="output-area flex items-center justify-center" style={{ minHeight: 240 }}>
            <p className="font-mono text-xs" style={{ color: '#2a2a2a' }}>output aparece aqui</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ---- DM ----
function DMModule({ systemPrompt }: { systemPrompt: string }) {
  const [origem, setOrigem] = useState('Comentou no reel')
  const [fase, setFase] = useState('Qualificação')
  const [disse, setDisse] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const { addToast } = useToast()

  async function generate() {
    setLoading(true); setOutput('')
    try {
      const prompt = `Gere um template de DM para Instagram.

Origem do lead: ${origem}
O que a pessoa fez/disse: ${disse || 'não informado'}
Fase: ${fase}

Regras:
- Tom calibrado para a fase: ${fase}
- Variáveis em destaque: [Nome], [o que comentou], [produto]
- Casual, não robótico
- Máximo 5 linhas
- Se fase for Objeção de preço: incluir âncora de valor específica`

      const result = await callClaude({ systemPrompt, userPrompt: prompt, maxTokens: 600, onStream: chunk => setOutput(prev => prev + chunk) })
      void result
    } catch (e: unknown) { addToast(e instanceof Error ? e.message : 'Erro', 'error') }
    finally { setLoading(false) }
  }

  return (
    <div className="grid grid-cols-5 gap-6">
      <div className="col-span-2 space-y-4">
        <div><Label>ORIGEM DO LEAD</Label>
          <Select value={origem} onChange={setOrigem} options={['Comentou no reel','Respondeu story','Mandou DM direto','Clicou na bio'].map(v => ({ value: v, label: v }))} />
        </div>
        <div><Label>FASE</Label>
          <Select value={fase} onChange={setFase} options={['Qualificação','Apresentação','Objeção de preço','Fechamento'].map(v => ({ value: v, label: v }))} />
        </div>
        <div><Label>O QUE A PESSOA FEZ/DISSE (opcional)</Label>
          <Textarea value={disse} onChange={setDisse} placeholder='Ex: "preciso disso!" no comentário do reel de posicionamento' rows={2} />
        </div>
        <GenerateButton onClick={generate} loading={loading} label="Gerar Template DM" />
      </div>
      <div className="col-span-3 space-y-4">
        {loading && !output && <LoadingOutput />}
        {output ? (
          <>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs" style={{ color: '#4a4640' }}>TEMPLATE DM — {fase.toUpperCase()}</span>
              <button onClick={() => { navigator.clipboard.writeText(output); addToast('Copiado!') }}
                className="font-mono text-xs px-3 py-1.5 rounded flex items-center gap-1.5"
                style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#c9a84c' }}>
                <Copy size={10} /> Copiar
              </button>
            </div>
            <div className="output-area active">{output}</div>
          </>
        ) : !loading && (
          <div className="output-area flex items-center justify-center" style={{ minHeight: 200 }}>
            <p className="font-mono text-xs" style={{ color: '#2a2a2a' }}>output aparece aqui</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ---- MAIN ----
export function Criar() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState<Tab>((searchParams.get('tab') as Tab) || 'roteiro')
  const { brand } = useBrand()
  const { toasts, addToast, removeToast } = useToast()
  const systemPrompt = buildSystemPrompt(brand)

  useEffect(() => {
    const tab = searchParams.get('tab') as Tab
    if (tab) setActiveTab(tab)
  }, [searchParams])

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab)
    setSearchParams({ tab })
  }

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        const btn = document.querySelector<HTMLButtonElement>('[data-generate]')
        btn?.click()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <div className="p-8 max-w-7xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl" style={{ color: '#f0ece0' }}>Hub de Criação</h1>
        <p className="font-mono text-xs mt-0.5" style={{ color: '#4a4640' }}>⌘↵ para gerar</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b pb-0" style={{ borderColor: '#1a1a1a' }}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => handleTabChange(id)}
            className="flex items-center gap-2 font-mono text-xs px-4 py-2.5 transition-all"
            style={{
              color: activeTab === id ? '#c9a84c' : '#4a4640',
              borderBottom: activeTab === id ? '2px solid #c9a84c' : '2px solid transparent',
              background: 'transparent',
              marginBottom: -1,
            }}
          >
            <Icon size={12} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'roteiro' && <RoteiroModule brand={brand} systemPrompt={systemPrompt} />}
        {activeTab === 'legenda' && <LegendaModule systemPrompt={systemPrompt} />}
        {activeTab === 'carrossel' && <CarrosselModule systemPrompt={systemPrompt} />}
        {activeTab === 'hook' && <HookModule systemPrompt={systemPrompt} />}
        {activeTab === 'oferta' && <OfertaModule brand={brand} systemPrompt={systemPrompt} />}
        {activeTab === 'dm' && <DMModule systemPrompt={systemPrompt} />}
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
