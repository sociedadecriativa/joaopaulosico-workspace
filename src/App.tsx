import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import type { User } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import { Layout } from './components/Layout'
import { Auth } from './pages/Auth'
import { Dashboard } from './pages/Dashboard'
import { Criar } from './pages/Criar'
import { Pautas } from './pages/Pautas'
import { Biblioteca } from './pages/Biblioteca'
import { Calendario } from './pages/Calendario'
import { Metricas } from './pages/Metricas'
import { Auditoria } from './pages/Auditoria'
import { Marca } from './pages/Marca'

function ProtectedRoute({ children, user }: { children: React.ReactNode; user: User | null }) {
  if (!user) return <Navigate to="/auth" replace />
  return <>{children}</>
}

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Command palette Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        // Future: open command palette
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0a' }}>
        <div className="font-mono text-xs gold-pulse" style={{ color: '#c9a84c' }}>
          carregando workspace...
        </div>
      </div>
    )
  }

  // If no Supabase configured, skip auth (dev mode)
  const skipAuth = !import.meta.env.VITE_SUPABASE_URL

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={
          user || skipAuth ? <Navigate to="/" replace /> : <Auth />
        } />
        <Route path="/" element={
          <ProtectedRoute user={skipAuth ? ({ id: 'dev' } as User) : user}>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="criar" element={<Criar />} />
          <Route path="pautas" element={<Pautas />} />
          <Route path="biblioteca" element={<Biblioteca />} />
          <Route path="calendario" element={<Calendario />} />
          <Route path="metricas" element={<Metricas />} />
          <Route path="auditoria" element={<Auditoria />} />
          <Route path="marca" element={<Marca />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
