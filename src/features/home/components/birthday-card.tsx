import { useNavigate } from 'react-router-dom'
import { Cake } from 'lucide-react'

const aniversariantes = [
  { id: '10', nome: 'Ana Oliveira', dias: 0 },
  { id: '11', nome: 'Roberto Alves', dias: 1 },
  { id: '12', nome: 'Mariana Torres', dias: 14 },
  { id: '13', nome: 'Carlos Eduardo', dias: 28 },
]

function label(dias: number) {
  if (dias === 0) return 'Hoje!'
  if (dias === 1) return 'Amanhã'
  return `${dias} dias`
}

function barColor(dias: number) {
  if (dias === 0) return 'bg-primary dark:bg-secondary'
  if (dias <= 3) return 'bg-accent dark:bg-accent'
  return 'bg-muted-foreground/30 dark:bg-muted-foreground/40'
}

export function BirthdayCard() {
  const navigate = useNavigate()

  if (aniversariantes.length === 0) return null

  const maxDias = Math.max(...aniversariantes.map((a) => a.dias))

  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <Cake size={16} className="text-accent" />
        <h3 className="text-foreground text-sm font-semibold">Aniversariantes</h3>
      </div>

      <div className="flex flex-col gap-3">
        {aniversariantes.map((a) => {
          const pct = maxDias === 0 ? 100 : ((maxDias - a.dias) / maxDias) * 100
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => navigate(`/clientes/${a.id}`)}
              className="flex items-center gap-3 text-left"
            >
              <div className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${a.dias === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
                {a.nome.charAt(0)}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-foreground text-sm font-medium truncate">{a.nome}</span>
                  <span className={`text-xs font-bold shrink-0 ml-2 ${a.dias === 0 ? 'text-primary dark:text-primary-foreground' : 'text-muted-foreground'}`}>{label(a.dias)}</span>
                </div>
                <div className="bg-muted-foreground/10 h-1.5 w-full overflow-hidden rounded-full">
                  <div className={`h-full rounded-full ${barColor(a.dias)} transition-all`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}