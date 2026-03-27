export function LoadingOutput() {
  return (
    <div className="output-area">
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs" style={{ color: '#c9a84c' }}>gerando</span>
        <span className="flex gap-0.5">
          <span className="typing-dot w-1 h-1 rounded-full bg-gold-primary inline-block" style={{ background: '#c9a84c' }} />
          <span className="typing-dot w-1 h-1 rounded-full inline-block" style={{ background: '#c9a84c' }} />
          <span className="typing-dot w-1 h-1 rounded-full inline-block" style={{ background: '#c9a84c' }} />
        </span>
      </div>
      <div className="mt-4 space-y-2">
        {[100, 80, 90, 60, 75].map((w, i) => (
          <div
            key={i}
            className="h-3 rounded gold-pulse"
            style={{ width: `${w}%`, background: '#2a2a2a' }}
          />
        ))}
      </div>
    </div>
  )
}
