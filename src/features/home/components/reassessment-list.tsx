import { useNavigate } from 'react-router-dom'
import { Clock } from 'lucide-react'

const alunos = [
  { id: '4', nome: 'Fernanda Lima', dias: 45 },
  { id: '5', nome: 'Roberto Alves', dias: 38 },
  { id: '6', nome: 'Juliana Costa', dias: 60 },
]

function urgencyBar(dias: number) {
  if (dias >= 60) return { width: 'w-full', color: 'bg-red-500 dark:bg-red-400' }
  if (dias >= 45) return { width: 'w-3/4', color: 'bg-amber-500 dark:bg-amber-400' }
  return { width: 'w-1/2', color: 'bg-amber-400 dark:bg-amber-300' }
}

export function ReassessmentList() {
  const navigate = useNavigate()

  if (alunos.length === 0) return null

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-amber-500/10 dark:bg-amber-400/20 flex size-8 items-center justify-center rounded-lg text-amber-600 dark:text-amber-400">
            <Clock size={16} />
          </div>
          <h3 className="text-foreground text-sm font-semibold">Precisam de reavaliação</h3>
        </div>
        <button
          onClick={() => navigate('/clientes')}
          className="text-link text-xs font-semibold"
        >
          Ver todos
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl">
        {alunos.map((aluno) => {
          const bar = urgencyBar(aluno.dias)
          return (
            <button
              key={aluno.id}
              type="button"
              onClick={() => navigate(`/clientes/${aluno.id}`)}
              className="flex w-full items-center gap-3 border-b border-foreground/5 bg-muted/50 px-4 py-3 text-left last:border-b-0 transition-colors hover:bg-muted/80"
            >
              <div className={`h-10 w-1 shrink-0 rounded-full ${bar.color}`} />

              <div className="bg-amber-100 dark:bg-amber-900/30 flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-amber-700 dark:text-amber-300">
                {aluno.nome.charAt(0)}
              </div>

              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-foreground text-sm font-medium truncate">{aluno.nome}</span>
                <span className="text-muted-foreground text-xs">{aluno.dias} dias sem reavaliar</span>
              </div>

              <div className="flex flex-col items-end gap-1">
                <span className="text-amber-600 dark:text-amber-400 text-xs font-bold">{aluno.dias}d</span>
                <div className="bg-muted-foreground/20 h-1.5 w-12 overflow-hidden rounded-full">
                  <div className={`h-full rounded-full ${bar.color} ${bar.width}`} />
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}