import { useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { PILLAR_COLORS } from '../types'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'

interface CalItem {
  id: string
  date: Date
  titulo: string
  pilar: keyof typeof PILLAR_COLORS
  plataforma: string
  status: 'planejado' | 'publicado' | 'cancelado'
}

const SAMPLE: CalItem[] = [
  { id: '1', date: new Date(2026, 2, 30), titulo: 'Reel: Efeito Veblen fotógrafo', pilar: 'METODO', plataforma: 'Instagram', status: 'planejado' },
  { id: '2', date: new Date(2026, 3, 1), titulo: 'Paralipse: Análise de Perfil', pilar: 'SINAL', plataforma: 'Instagram', status: 'planejado' },
  { id: '3', date: new Date(2026, 3, 3), titulo: 'Se Eu Fosse Criar: Estúdio', pilar: 'MATERIA', plataforma: 'Instagram', status: 'planejado' },
  { id: '4', date: new Date(2026, 3, 7), titulo: 'Taylor Swift — escassez', pilar: 'VOLTAGEM', plataforma: 'Instagram', status: 'planejado' },
]

const STATUS_COLORS = { planejado: '#2980b9', publicado: '#3d9970', cancelado: '#4a4640' }
const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const GRADE_PADRAO = [
  { dia: 'Segunda', pilar: 'MATERIA', descricao: 'Autoridade/Educação' },
  { dia: 'Terça', pilar: 'METODO', descricao: 'Framework/Referência' },
  { dia: 'Quarta', pilar: 'SINAL', descricao: 'CTA Direto Produto' },
  { dia: 'Quinta', pilar: 'METODO', descricao: 'Framework/Referência' },
  { dia: 'Sexta', pilar: 'VOLTAGEM', descricao: 'Reel de Impacto/Alcance' },
]

export function Calendario() {
  const [current, setCurrent] = useState(new Date(2026, 2, 1))
  const [selected, setSelected] = useState<Date | null>(null)

  const monthStart = startOfMonth(current)
  const monthEnd = endOfMonth(current)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const startDow = monthStart.getDay()
  const blanks = Array(startDow).fill(null)

  function itemsForDay(date: Date) {
    return SAMPLE.filter(i => isSameDay(i.date, date))
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl" style={{ color: '#f0ece0' }}>Calendário Editorial</h1>
          <p className="font-mono text-xs mt-0.5" style={{ color: '#4a4640' }}>
            regra: a cada 4 Reels, 1 com CTA direto Kiwify
          </p>
        </div>
        <button className="font-mono text-xs px-4 py-2 rounded flex items-center gap-2"
          style={{ background: '#c9a84c', color: '#0a0a0a' }}>
          <Plus size={12} /> Agendar
        </button>
      </div>

      {/* Grade padrão */}
      <div className="mb-5 rounded-lg p-4" style={{ background: '#0d0d0d', border: '1px solid #1a1a1a' }}>
        <div className="font-mono text-xs mb-3" style={{ color: '#4a4640' }}>GRADE EDITORIAL PADRÃO</div>
        <div className="flex gap-3 flex-wrap">
          {GRADE_PADRAO.map(g => {
            const color = PILLAR_COLORS[g.pilar as keyof typeof PILLAR_COLORS]
            return (
              <div key={g.dia} className="flex items-center gap-2 font-mono text-xs">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                <span style={{ color: '#8a8478' }}>{g.dia}:</span>
                <span style={{ color }}>{g.pilar}</span>
                <span style={{ color: '#4a4640' }}>— {g.descricao}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Calendar nav */}
      <div className="flex items-center gap-4 mb-4">
        <button onClick={() => setCurrent(subMonths(current, 1))} className="p-1.5 rounded transition-colors"
          style={{ color: '#8a8478' }}>
          <ChevronLeft size={16} />
        </button>
        <h2 className="font-display text-xl" style={{ color: '#f0ece0' }}>
          {format(current, 'MMMM yyyy', { locale: ptBR })}
        </h2>
        <button onClick={() => setCurrent(addMonths(current, 1))} className="p-1.5 rounded transition-colors"
          style={{ color: '#8a8478' }}>
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="rounded-lg overflow-hidden" style={{ border: '1px solid #1a1a1a' }}>
        {/* Week header */}
        <div className="grid grid-cols-7" style={{ background: '#0d0d0d', borderBottom: '1px solid #1a1a1a' }}>
          {WEEK_DAYS.map(d => (
            <div key={d} className="py-2 text-center font-mono text-xs" style={{ color: '#4a4640' }}>{d}</div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7">
          {blanks.map((_, i) => (
            <div key={`blank-${i}`} className="min-h-[80px] p-2" style={{ background: '#0a0a0a', borderRight: '1px solid #1a1a1a', borderBottom: '1px solid #1a1a1a' }} />
          ))}
          {days.map(day => {
            const dayItems = itemsForDay(day)
            const isSelected = selected && isSameDay(day, selected)
            const isToday = isSameDay(day, new Date())
            return (
              <div
                key={day.toISOString()}
                onClick={() => setSelected(day)}
                className="min-h-[80px] p-2 cursor-pointer transition-colors"
                style={{
                  background: isSelected ? '#1a1410' : '#111',
                  borderRight: '1px solid #1a1a1a',
                  borderBottom: '1px solid #1a1a1a',
                }}
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#161616' }}
                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = '#111' }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className="font-mono text-xs"
                    style={{
                      color: isToday ? '#c9a84c' : '#4a4640',
                      fontWeight: isToday ? 700 : 400,
                    }}
                  >
                    {format(day, 'd')}
                  </span>
                  {dayItems.length > 0 && (
                    <span className="font-mono text-xs" style={{ color: '#2a2a2a' }}>{dayItems.length}</span>
                  )}
                </div>
                <div className="space-y-0.5">
                  {dayItems.slice(0, 3).map(item => {
                    const color = PILLAR_COLORS[item.pilar]
                    return (
                      <div
                        key={item.id}
                        className="font-mono text-xs px-1.5 py-0.5 rounded truncate"
                        style={{ background: `${color}18`, color, fontSize: '0.6rem' }}
                      >
                        {item.titulo}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Selected day panel */}
      {selected && (
        <div className="mt-4 rounded-lg p-4" style={{ background: '#0d0d0d', border: '1px solid #c9a84c33' }}>
          <div className="font-mono text-xs mb-3" style={{ color: '#c9a84c' }}>
            {format(selected, "d 'de' MMMM", { locale: ptBR }).toUpperCase()}
          </div>
          {itemsForDay(selected).length === 0 ? (
            <div className="flex items-center gap-3">
              <p className="font-mono text-xs" style={{ color: '#4a4640' }}>nenhum item agendado</p>
              <button className="font-mono text-xs px-3 py-1.5 rounded flex items-center gap-1"
                style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#c9a84c' }}>
                <Plus size={10} /> agendar neste dia
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {itemsForDay(selected).map(item => {
                const color = PILLAR_COLORS[item.pilar]
                return (
                  <div key={item.id} className="flex items-center gap-3 font-mono text-xs">
                    <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                    <span style={{ color: '#f0ece0' }}>{item.titulo}</span>
                    <span style={{ color: '#4a4640' }}>{item.plataforma}</span>
                    <span className="px-2 py-0.5 rounded text-xs" style={{ background: `${STATUS_COLORS[item.status]}22`, color: STATUS_COLORS[item.status] }}>
                      {item.status}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
