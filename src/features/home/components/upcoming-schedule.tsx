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
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <svg width="16" height="16" viewBox="0 0 20 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M2.87862 6.89133H16.3216M3.46354 0.63855V3.85434M7.24126 0.63855V3.85434M11.9615 0.63855V3.85434M15.7392 0.63855V3.85434M1.36906 2.49037H17.8337C18.0274 2.49037 18.2132 2.56734 18.3502 2.70434C18.4872 2.84133 18.5642 3.02714 18.5642 3.22089V14.9908C18.5642 15.3878 18.4065 15.7685 18.1258 16.0492C17.8451 16.3299 17.4644 16.4876 17.0674 16.4876H2.13533C1.73836 16.4876 1.35765 16.3299 1.07695 16.0492C0.796246 15.7685 0.63855 15.3878 0.63855 14.9908V3.22089C0.63855 3.02714 0.715514 2.84133 0.852512 2.70434C0.98951 2.56734 1.17532 2.49037 1.36906 2.49037Z" stroke="currentColor" strokeWidth="1.27712" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="text-foreground text-lg font-bold">Agenda</h2>
        </div>
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
            <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl bg-surface px-4 py-3 transition-all hover:bg-surface/80">
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