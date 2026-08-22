import { useNavigate } from 'react-router-dom'

const agendamentos = [
  { id: '7', nome: 'Pedro Almeida', horario: '14:30', tipo: 'Avaliação Cooper' },
  { id: '8', nome: 'Larissa Mendes', horario: '15:45', tipo: 'Teste Rockport' },
  { id: '9', nome: 'Thiago Rocha', horario: '17:00', tipo: 'Reavaliação' },
]

export function UpcomingSchedule() {
  const navigate = useNavigate()

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-foreground text-lg font-bold">Agenda</h2>
        <button
          onClick={() => navigate('/agenda')}
          className="text-link text-sm font-semibold"
        >
          Ver tudo
        </button>
      </div>
      <div className="relative pl-6">
        <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-link/20" />
        {agendamentos.map((agenda) => (
          <button
            key={agenda.id}
            type="button"
            onClick={() => navigate('/agenda')}
            className="group relative mb-4 flex items-center gap-4 last:mb-0"
          >
            <div className="absolute -left-[19px] flex size-4 items-center justify-center">
              <div className="size-2 rounded-full bg-link ring-4 ring-background" />
            </div>
            <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl bg-muted/50 px-4 py-3 transition-colors hover:bg-muted/80">
              <div className="flex flex-col items-center">
                <span className="text-foreground text-sm font-bold leading-none">{agenda.horario.split(':')[0]}</span>
                <span className="text-muted-foreground text-[10px] font-medium">{agenda.horario.split(':')[1]}</span>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-foreground text-sm font-medium truncate">{agenda.nome}</span>
                <span className="text-muted-foreground text-xs">{agenda.tipo}</span>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-muted-foreground shrink-0">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}