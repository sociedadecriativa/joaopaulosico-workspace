interface ToastItem {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

const TYPE_COLORS = {
  success: '#3d9970',
  error: '#c0392b',
  info: '#c9a84c',
}

interface Props {
  toasts: ToastItem[]
  onRemove: (id: string) => void
}

export function ToastContainer({ toasts, onRemove }: Props) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map(t => (
        <div
          key={t.id}
          className="toast cursor-pointer"
          style={{ color: TYPE_COLORS[t.type] }}
          onClick={() => onRemove(t.id)}
        >
          {t.message}
        </div>
      ))}
    </div>
  )
}
