import { useState } from 'react'
import { useBrand } from '../hooks/useBrand'
import { useToast } from '../hooks/useToast'
import { ToastContainer } from '../components/ui/Toast'
import { PILLAR_COLORS, type PillarKey } from '../types'
import { ChevronDown, ChevronRight, Save } from 'lucide-react'

function Section({ title, children, defaultOpen = false }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-lg overflow-hidden" style={{ border: '1px solid #1a1a1a' }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 transition-colors"
        style={{ background: '#0d0d0d' }}
        onMouseEnter={e => e.currentTarget.style.background = '#111'}
        onMouseLeave={e => e.currentTarget.style.background = '#0d0d0d'}
      >
        <span className="font-mono text-xs font-semibold" style={{ color: '#8a8478' }}>{title}</span>
        {open ? <ChevronDown size={14} style={{ color: '#4a4640' }} /> : <ChevronRight size={14} style={{ color: '#4a4640' }} />}
      </button>
      {open && (
        <div className="px-5 py-5 space-y-4" style={{ background: '#111', borderTop: '1px solid #1a1a1a' }}>
          {children}
        </div>
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="font-mono text-xs" style={{ color: '#4a4640' }}>{label}</div>
      {children}
    </div>
  )
}

function Input({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full font-mono text-xs px-3 py-2 rounded"
      style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#f0ece0', outline: 'none' }}
    />
  )
}

function Textarea({ value, onChange, rows = 3 }: { value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      rows={rows}
      className="w-full font-mono text-xs px-3 py-2 rounded resize-none"
      style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#f0ece0', outline: 'none' }}
    />
  )
}

const PILLAR_KEYS: PillarKey[] = ['VOLTAGEM', 'MATERIA', 'METODO', 'SINAL']
const PILLAR_OBJECTIVES: Record<PillarKey, string> = {
  VOLTAGEM: 'Alcance / Viralização',
  MATERIA: 'Autoridade / Profundidade',
  METODO: 'Educação / Framework',
  SINAL: 'Conversão / Venda',
}

export function Marca() {
  const { brand, updateBrand } = useBrand()
  const { toasts, addToast, removeToast } = useToast()
  const [local, setLocal] = useState(brand)

  function update<K extends keyof typeof local>(key: K, value: typeof local[K]) {
    setLocal(prev => ({ ...prev, [key]: value }))
  }

  async function save() {
    await updateBrand(local)
    addToast('DNA da marca salvo')
  }

  function updateFrase(tipo: 'frases_permitidas' | 'frases_proibidas', i: number, val: string) {
    const arr = [...(local[tipo] || [])]
    arr[i] = val
    update(tipo, arr)
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl" style={{ color: '#f0ece0' }}>DNA da Marca</h1>
          <p className="font-mono text-xs mt-0.5" style={{ color: '#4a4640' }}>
            {brand.handle} — {brand.arquetipo}
          </p>
        </div>
        <button onClick={save}
          className="font-mono text-sm font-semibold px-5 py-2.5 rounded flex items-center gap-2"
          style={{ background: '#c9a84c', color: '#0a0a0a' }}>
          <Save size={14} /> Salvar
        </button>
      </div>

      <div className="space-y-3">
        {/* Identidade */}
        <Section title="1. IDENTIDADE" defaultOpen>
          <div className="grid grid-cols-2 gap-4">
            <Field label="HANDLE">
              <Input value={local.handle} onChange={v => update('handle', v)} />
            </Field>
            <Field label="ARQUÉTIPO">
              <Input value={local.arquetipo} onChange={v => update('arquetipo', v)} />
            </Field>
          </div>
          <Field label="FRASES QUE PERTENCEM À MARCA">
            {(local.frases_permitidas || []).map((f, i) => (
              <input key={i} value={f} onChange={e => updateFrase('frases_permitidas', i, e.target.value)}
                className="w-full font-mono text-xs px-3 py-2 rounded mb-1"
                style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#f0ece0', outline: 'none' }} />
            ))}
          </Field>
          <Field label="FRASES BANIDAS">
            {(local.frases_proibidas || []).map((f, i) => (
              <input key={i} value={f} onChange={e => updateFrase('frases_proibidas', i, e.target.value)}
                className="w-full font-mono text-xs px-3 py-2 rounded mb-1"
                style={{ background: '#1a1a1a', border: '1px solid #c0392b22', color: '#f0ece0', outline: 'none' }} />
            ))}
          </Field>
        </Section>

        {/* Pilares */}
        <Section title="2. PILARES EDITORIAIS">
          <div className="space-y-4">
            {PILLAR_KEYS.map(key => {
              const color = PILLAR_COLORS[key]
              const objetivo = PILLAR_OBJECTIVES[key]
              return (
                <div key={key} className="rounded-lg p-4 space-y-2" style={{ background: '#0d0d0d', border: `1px solid ${color}22` }}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                    <span className="font-mono text-xs font-bold" style={{ color }}>{key}</span>
                    <span className="font-mono text-xs" style={{ color: '#4a4640' }}>{objetivo}</span>
                  </div>
                  <textarea
                    placeholder="Descrição do pilar..."
                    rows={2}
                    className="w-full font-mono text-xs px-3 py-2 rounded resize-none"
                    style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#f0ece0', outline: 'none' }}
                  />
                </div>
              )
            })}
          </div>
        </Section>

        {/* Público */}
        <Section title="3. PÚBLICO-ALVO">
          <Field label="DESCRIÇÃO">
            <Textarea value={local.publico_alvo} onChange={v => update('publico_alvo', v)} rows={4} />
          </Field>
        </Section>

        {/* Voz */}
        <Section title="4. VOZ DA MARCA">
          <Field label="TOM DESCRITIVO">
            <Textarea value={local.voz_marca} onChange={v => update('voz_marca', v)} rows={3} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="EMOJIS PERMITIDOS">
              <Input value={(local.emojis_permitidos || []).join(' ')} onChange={v => update('emojis_permitidos', v.split(' ').filter(Boolean))} />
            </Field>
            <Field label="EMOJIS PROIBIDOS">
              <Input value={(local.emojis_proibidos || []).join(' ')} onChange={v => update('emojis_proibidos', v.split(' ').filter(Boolean))} />
            </Field>
          </div>
          <Field label="HASHTAGS CORE">
            <Input value={(local.hashtags_core || []).join(' ')} onChange={v => update('hashtags_core', v.split(' ').filter(Boolean))} />
          </Field>
        </Section>

        {/* Proposta de Valor */}
        <Section title="5. PROPOSTA DE VALOR">
          <Field label="PROPOSTA">
            <Textarea value={local.proposta_valor} onChange={v => update('proposta_valor', v)} rows={3} />
          </Field>
        </Section>

        {/* Produtos */}
        <Section title="6. PRODUTOS">
          {(local.produtos || []).map((p, i) => (
            <div key={i} className="rounded-lg p-4 space-y-2" style={{ background: '#0d0d0d', border: '1px solid #1a1a1a' }}>
              <div className="grid grid-cols-2 gap-3">
                <Field label="NOME"><Input value={p.nome} onChange={v => {
                  const arr = [...local.produtos]; arr[i] = { ...arr[i], nome: v }; update('produtos', arr)
                }} /></Field>
                <Field label="PREÇO"><Input value={p.preco} onChange={v => {
                  const arr = [...local.produtos]; arr[i] = { ...arr[i], preco: v }; update('produtos', arr)
                }} /></Field>
              </div>
              <Field label="DESCRIÇÃO">
                <Textarea value={p.descricao} onChange={v => {
                  const arr = [...local.produtos]; arr[i] = { ...arr[i], descricao: v }; update('produtos', arr)
                }} rows={2} />
              </Field>
              <Field label="LINK KIWIFY"><Input value={p.link_kiwify} onChange={v => {
                const arr = [...local.produtos]; arr[i] = { ...arr[i], link_kiwify: v }; update('produtos', arr)
              }} placeholder="https://kiwify.com.br/..." /></Field>
            </div>
          ))}
        </Section>

        {/* Score */}
        <Section title="7. SCORE & METAS">
          <div className="grid grid-cols-2 gap-4">
            <Field label={`SCORE ATUAL: ${local.score_atual}`}>
              <input type="range" min={0} max={10} step={0.1} value={local.score_atual}
                onChange={e => update('score_atual', parseFloat(e.target.value))}
                className="w-full" style={{ accentColor: '#c9a84c' }} />
            </Field>
            <Field label={`META 90 DIAS: ${local.meta_90d}`}>
              <input type="range" min={0} max={10} step={0.1} value={local.meta_90d}
                onChange={e => update('meta_90d', parseFloat(e.target.value))}
                className="w-full" style={{ accentColor: '#c9a84c' }} />
            </Field>
          </div>
        </Section>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
