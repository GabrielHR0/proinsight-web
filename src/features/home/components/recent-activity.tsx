import { useNavigate } from 'react-router-dom'
import { Dumbbell, UserPlus, CalendarSync } from 'lucide-react'

const activities = [
  {
    icon: Dumbbell,
    color: 'bg-accent',
    title: 'Avaliação Cooper concluída',
    subtitle: 'Carlos Silva',
    time: '14:30',
    tempo: 'há 2h',
  },
  {
    icon: UserPlus,
    color: 'bg-link',
    title: 'Novo aluno cadastrado',
    subtitle: 'Mariana Torres',
    time: '11:00',
    tempo: 'há 5h',
  },
  {
    icon: CalendarSync,
    color: 'bg-secondary',
    title: 'Reagendamento realizado',
    subtitle: 'João Oliveira',
    time: '09:15',
    tempo: 'há 7h',
  },
]

export function RecentActivity() {
  const navigate = useNavigate()

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-foreground text-sm font-semibold">Atividade recente</h3>
        <button onClick={() => navigate('/historico')} className="text-link text-xs font-semibold">
          Ver todas
        </button>
      </div>

      <div className="relative flex flex-col">
        <div className="absolute left-[15px] top-4 bottom-4 w-px bg-muted-foreground/15 dark:bg-muted-foreground/25" />

        {activities.map((item) => (
          <div key={item.title} className="relative flex items-start gap-4 py-3">
            <div className={`relative z-10 flex size-[30px] shrink-0 items-center justify-center rounded-full ${item.color}`}>
              <item.icon size={14} className="text-white" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-foreground text-sm font-medium">{item.title}</p>
              <p className="text-muted-foreground text-xs">{item.subtitle}</p>
            </div>

            <div className="flex flex-col items-end shrink-0">
              <span className="text-foreground text-xs font-medium">{item.time}</span>
              <span className="text-muted-foreground text-[10px]">{item.tempo}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}