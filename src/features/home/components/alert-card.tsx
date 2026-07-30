import { useNavigate } from 'react-router-dom'
import { AlertTriangle, ChevronRight } from 'lucide-react'

const alerts = [
  { id: 2, message: '2 laudos aguardam finalização', to: '/avaliacoes' },
]

export function AlertCard() {
  const navigate = useNavigate()

  if (alerts.length === 0) return null

  return (
    <section className="flex flex-col gap-2">
      {alerts.map((alert) => (
        <button
          key={alert.id}
          type="button"
          onClick={() => navigate(alert.to)}
          className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-amber-50 to-amber-50/50 px-4 py-3 text-left transition-all hover:from-amber-100 hover:to-amber-50"
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
            <AlertTriangle size={18} className="text-amber-500" />
          </div>
          <span className="text-foreground flex-1 text-sm font-medium">{alert.message}</span>
          <ChevronRight size={16} className="text-muted-foreground shrink-0" />
        </button>
      ))}
    </section>
  )
}