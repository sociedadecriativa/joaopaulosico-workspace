import { useState } from 'react'
import { signIn, signUp, signInWithMagicLink } from '../lib/supabase'

export function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'signup' | 'magic'>('login')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setMsg(''); setError('')
    try {
      if (mode === 'magic') {
        await signInWithMagicLink(email)
        setMsg('Link enviado para ' + email)
      } else if (mode === 'signup') {
        const { error: err } = await signUp(email, password)
        if (err) throw err
        setMsg('Conta criada. Verifique seu email.')
      } else {
        const { error: err } = await signIn(email, password)
        if (err) throw err
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro de autenticação')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0a' }}>
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center space-y-2">
          <h1 className="font-display text-4xl" style={{ color: '#f0ece0' }}>
            Sistema operacional<br />da sua marca
          </h1>
          <p className="font-mono text-sm" style={{ color: '#4a4640' }}>@joaopaulosico workspace</p>
        </div>

        {/* Card */}
        <div className="rounded-lg p-8 space-y-5" style={{ background: '#111', border: '1px solid #2a2a2a' }}>
          <div className="font-mono text-xs" style={{ color: '#4a4640' }}>
            {mode === 'login' ? 'ENTRAR' : mode === 'signup' ? 'CRIAR CONTA' : 'MAGIC LINK'}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="email"
                required
                className="w-full font-mono text-xs px-4 py-3 rounded"
                style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#f0ece0', outline: 'none' }}
              />
            </div>
            {mode !== 'magic' && (
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="senha"
                  required={mode !== 'magic'}
                  className="w-full font-mono text-xs px-4 py-3 rounded"
                  style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#f0ece0', outline: 'none' }}
                />
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full font-mono text-sm font-semibold py-3 rounded transition-opacity"
              style={{ background: '#c9a84c', color: '#0a0a0a', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'aguarde...' : mode === 'login' ? 'Entrar' : mode === 'signup' ? 'Criar conta' : 'Enviar link'}
            </button>
          </form>

          {error && <p className="font-mono text-xs" style={{ color: '#c0392b' }}>{error}</p>}
          {msg && <p className="font-mono text-xs" style={{ color: '#3d9970' }}>{msg}</p>}

          <div className="flex gap-4 pt-2 border-t" style={{ borderColor: '#1a1a1a' }}>
            {mode !== 'login' && (
              <button onClick={() => setMode('login')} className="font-mono text-xs" style={{ color: '#4a4640' }}>entrar</button>
            )}
            {mode !== 'signup' && (
              <button onClick={() => setMode('signup')} className="font-mono text-xs" style={{ color: '#4a4640' }}>criar conta</button>
            )}
            {mode !== 'magic' && (
              <button onClick={() => setMode('magic')} className="font-mono text-xs" style={{ color: '#4a4640' }}>magic link</button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
