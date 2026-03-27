import type { AuditResult } from '../../types'
import { ScoreBar } from './ScoreBadge'
import { scoreColor, scoreLabel } from '../../lib/qualityAudit'
import { AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react'

interface Props {
  audit: AuditResult
  onRewrite?: () => void
  isRewriting?: boolean
}

export function AuditPanel({ audit, onRewrite, isRewriting }: Props) {
  const color = scoreColor(audit.score)

  return (
    <div className="rounded-lg border p-4 space-y-3" style={{ borderColor: '#2a2a2a', background: '#0d0d0d' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {audit.aprovado
            ? <CheckCircle size={14} style={{ color: '#3d9970' }} />
            : <AlertTriangle size={14} style={{ color: '#e8a838' }} />
          }
          <span className="font-mono text-xs" style={{ color }}>
            Quality Score: {audit.score} — {scoreLabel(audit.score)}
          </span>
        </div>
        {onRewrite && !audit.aprovado && (
          <button
            onClick={onRewrite}
            disabled={isRewriting}
            className="font-mono text-xs px-3 py-1 rounded flex items-center gap-1.5 transition-colors"
            style={{
              background: '#1e1e1e',
              border: '1px solid #2a2a2a',
              color: '#c9a84c',
            }}
          >
            <RefreshCw size={10} className={isRewriting ? 'animate-spin' : ''} />
            Corrigir automaticamente
          </button>
        )}
      </div>

      <ScoreBar score={audit.score} />

      {audit.flags.length > 0 && (
        <div className="space-y-2">
          {audit.flags.map((flag, i) => (
            <div key={i} className="rounded p-3 text-xs space-y-1" style={{ background: '#161616', border: '1px solid #2a2a2a' }}>
              <div className="font-mono font-semibold" style={{ color: '#e8a838' }}>{flag.tipo}</div>
              <div style={{ color: '#8a8478' }}>{flag.descricao}</div>
              {flag.trecho && (
                <div className="px-2 py-1 rounded font-mono" style={{ background: '#1a1a1a', color: '#f0ece0', borderLeft: '2px solid #c0392b' }}>
                  "{flag.trecho}"
                </div>
              )}
              <div style={{ color: '#3d9970' }}>→ {flag.sugestao}</div>
            </div>
          ))}
        </div>
      )}

      {audit.flags.length === 0 && audit.aprovado && (
        <p className="font-mono text-xs" style={{ color: '#3d9970' }}>
          Nenhum problema detectado.
        </p>
      )}
    </div>
  )
}
