import { useNavigate } from 'react-router-dom'

const sugestoes = [
  { id: '4', nome: 'Fernanda Lima', dias: 45, motivo: 'última avaliação há 45 dias' },
  { id: '5', nome: 'Roberto Alves', dias: 38, motivo: 'última avaliação há 38 dias' },
  { id: '6', nome: 'Juliana Costa', dias: 60, motivo: 'mais de 60 dias sem reavaliar' },
]

export function PendingAssessments() {
  const navigate = useNavigate()

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-foreground text-lg font-bold">Sugestões</h2>
        <button
          onClick={() => navigate('/avaliacoes')}
          className="text-link dark:text-primary-foreground text-sm font-semibold"
        >
          Ver todas
        </button>
      </div>
      <div className="flex flex-col gap-2">
        {sugestoes.map((aluno) => (
          <button
            key={aluno.id}
            type="button"
            onClick={() => navigate(`/clientes/${aluno.id}`)}
            className="group flex items-center gap-3 rounded-2xl bg-muted/50 px-4 py-3 text-left transition-colors hover:bg-muted/80"
          >
            <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-2xl border-r-[3px] border-r-amber-400 bg-muted">
              <span className="text-foreground text-base leading-none font-black">{aluno.dias}</span>
              <span className="text-muted-foreground text-[9px] font-semibold tracking-[0.14em] uppercase">
                dias
              </span>
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-foreground text-sm font-medium truncate">{aluno.nome}</span>
              <span className="text-muted-foreground text-xs truncate">{aluno.motivo}</span>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-muted-foreground shrink-0">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        ))}
      </div>
    </section>
  )
}