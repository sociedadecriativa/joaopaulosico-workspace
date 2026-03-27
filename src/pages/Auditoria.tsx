import { useState } from 'react'
import { auditContent } from '../lib/qualityAudit'
import { callClaude } from '../lib/anthropic'
import { buildSystemPrompt } from '../lib/brandPrompt'
import { useBrand } from '../hooks/useBrand'
import { useToast } from '../hooks/useToast'
import { ToastContainer } from '../components/ui/Toast'
import { AuditPanel } from '../components/ui/AuditPanel'
import { ScoreBar } from '../components/ui/ScoreBadge'
import { LoadingOutput } from '../components/ui/LoadingOutput'
import type { AuditResult } from '../types'
import { ShieldCheck } from 'lucide-react'

export function Auditoria() {
  const [input, setInput] = useState('')
  const [audit, setAudit] = useState<AuditResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [rewriting, setRewriting] = useState(false)
  const [rewritten, setRewritten] = useState('')
  const { brand } = useBrand()
  const { toasts, addToast, removeToast } = useToast()
  const systemPrompt = buildSystemPrompt(brand)

  async function runAudit() {
    if (!input.trim()) return addToast('Cole um conteúdo para auditar', 'error')
    setLoading(true); setAudit(null); setRewritten('')
    try {
      const result = await auditContent(input)
      setAudit(result)
    } catch (e: unknown) { addToast(e instanceof Error ? e.message : 'Erro', 'error') }
    finally { setLoading(false) }
  }

  async function rewrite() {
    if (!audit) return
    setRewriting(true); setRewritten('')
    const flags = audit.flags.map(f => `- ${f.tipo}: ${f.sugestao}`).join('\n')
    try {
      const result = await callClaude({
        systemPrompt,
        userPrompt: `Reescreva o conteúdo abaixo corrigindo os problemas listados. Mantenha o argumento central. Gere APENAS o conteúdo corrigido.

PROBLEMAS A CORRIGIR:
${flags}

CONTEÚDO ORIGINAL:
${input}`,
        maxTokens: 1200,
        onStream: chunk => setRewritten(prev => prev + chunk),
      })
      void result
      addToast('Conteúdo corrigido')
    } catch (e: unknown) { addToast(e instanceof Error ? e.message : 'Erro', 'error') }
    finally { setRewriting(false) }
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl" style={{ color: '#f0ece0' }}>Auditor de Conteúdo</h1>
        <p className="font-mono text-xs mt-0.5" style={{ color: '#4a4640' }}>
          cole qualquer roteiro, legenda ou copy para avaliar
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <div className="font-mono text-xs mb-1.5" style={{ color: '#4a4640' }}>CONTEÚDO PARA AUDITAR</div>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Cole aqui o roteiro, legenda ou copy..."
              rows={16}
              className="w-full font-mono text-xs px-4 py-3 rounded resize-none"
              style={{ background: '#111', border: '1px solid #2a2a2a', color: '#f0ece0', outline: 'none' }}
            />
          </div>
          <button
            onClick={runAudit}
            disabled={loading}
            className="w-full font-mono text-sm font-semibold py-3 rounded flex items-center justify-center gap-2"
            style={{ background: '#c9a84c', color: '#0a0a0a', opacity: loading ? 0.7 : 1 }}
          >
            <ShieldCheck size={14} />
            {loading ? 'analisando...' : 'Auditar Conteúdo'}
          </button>
        </div>

        <div className="space-y-4">
          {loading && <LoadingOutput />}

          {audit && (
            <>
              <AuditPanel audit={audit} onRewrite={rewrite} isRewriting={rewriting} />

              <div className="rounded-lg p-4 space-y-2" style={{ background: '#0d0d0d', border: '1px solid #1a1a1a' }}>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs" style={{ color: '#4a4640' }}>SCORE DETALHADO</span>
                  <span className="font-display text-2xl" style={{ color: audit.score >= 70 ? '#3d9970' : audit.score >= 50 ? '#e8a838' : '#c0392b' }}>
                    {audit.score}
                  </span>
                </div>
                <ScoreBar score={audit.score} />
                <div className="font-mono text-xs" style={{ color: '#4a4640' }}>
                  {audit.flags.length} problema{audit.flags.length !== 1 ? 's' : ''} detectado{audit.flags.length !== 1 ? 's' : ''}
                </div>
              </div>
            </>
          )}

          {rewriting && !rewritten && <LoadingOutput />}
          {rewritten && (
            <div className="space-y-2">
              <div className="font-mono text-xs" style={{ color: '#3d9970' }}>VERSÃO CORRIGIDA</div>
              <div className="output-area active" style={{ maxHeight: '40vh', overflowY: 'auto' }}>{rewritten}</div>
              <button
                onClick={() => { navigator.clipboard.writeText(rewritten); addToast('Copiado!') }}
                className="font-mono text-xs px-3 py-1.5 rounded"
                style={{ background: '#1a1a1a', border: '1px solid #3d9970', color: '#3d9970' }}
              >
                Copiar versão corrigida
              </button>
            </div>
          )}

          {!loading && !audit && (
            <div className="rounded-lg flex items-center justify-center" style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', minHeight: 280 }}>
              <div className="text-center space-y-2">
                <ShieldCheck size={24} style={{ color: '#1a1a1a', margin: '0 auto' }} />
                <p className="font-mono text-xs" style={{ color: '#2a2a2a' }}>resultado da auditoria aparece aqui</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
