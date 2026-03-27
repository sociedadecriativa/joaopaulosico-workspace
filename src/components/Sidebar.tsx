import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Wand2, Lightbulb, Library,
  CalendarDays, BarChart2, ShieldCheck, Dna, LogOut
} from 'lucide-react'
import { supabase } from '../lib/supabase'

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/criar', icon: Wand2, label: 'Criar' },
  { to: '/pautas', icon: Lightbulb, label: 'Pautas' },
  { to: '/biblioteca', icon: Library, label: 'Biblioteca' },
  { to: '/calendario', icon: CalendarDays, label: 'Calendário' },
  { to: '/metricas', icon: BarChart2, label: 'Métricas' },
  { to: '/auditoria', icon: ShieldCheck, label: 'Auditor' },
  { to: '/marca', icon: Dna, label: 'DNA da Marca' },
]

export function Sidebar() {
  return (
    <aside
      className="w-56 h-screen flex flex-col fixed left-0 top-0 z-40"
      style={{ background: '#0d0d0d', borderRight: '1px solid #1a1a1a' }}
    >
      {/* Logo */}
      <div className="px-5 py-6 border-b" style={{ borderColor: '#1a1a1a' }}>
        <div className="font-display text-lg leading-tight" style={{ color: '#f0ece0' }}>
          @joaopaulosico
        </div>
        <div className="font-mono text-xs mt-0.5" style={{ color: '#4a4640' }}>
          workspace v1.0
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-5 py-2.5 font-mono text-xs transition-colors ${
                isActive
                  ? 'text-gold-primary'
                  : 'hover:text-text-primary'
              }`
            }
            style={({ isActive }) => ({
              color: isActive ? '#c9a84c' : '#8a8478',
              background: isActive ? 'rgba(201,168,76,0.06)' : 'transparent',
              borderRight: isActive ? '2px solid #c9a84c' : '2px solid transparent',
            })}
          >
            <Icon size={14} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t" style={{ borderColor: '#1a1a1a' }}>
        <button
          onClick={() => supabase.auth.signOut()}
          className="flex items-center gap-2 font-mono text-xs w-full transition-colors"
          style={{ color: '#4a4640' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#c0392b')}
          onMouseLeave={e => (e.currentTarget.style.color = '#4a4640')}
        >
          <LogOut size={12} />
          Sair
        </button>
      </div>
    </aside>
  )
}
