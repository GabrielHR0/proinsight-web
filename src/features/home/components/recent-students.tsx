import { useNavigate } from 'react-router-dom'

const recentes = [
  { id: '1', nome: 'Carlos Silva', email: 'carlos@email.com', ativo: true },
  { id: '2', nome: 'Ana Oliveira', email: 'ana@email.com', ativo: true },
  { id: '3', nome: 'Marcio Santos', email: 'marcio@email.com', ativo: false },
  { id: '4', nome: 'Fernanda Lima', email: 'fernanda@email.com', ativo: true },
]

export function RecentStudents() {
  const navigate = useNavigate()

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-foreground text-lg font-bold">Alunos</h2>
        <button
          onClick={() => navigate('/clientes')}
          className="text-link dark:text-primary-foreground text-sm font-semibold"
        >
          Ver todos
        </button>
      </div>
      <div className="flex gap-3 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {recentes.map((aluno) => (
          <button
            key={aluno.id}
            type="button"
            onClick={() => navigate(`/clientes/${aluno.id}`)}
            className="flex shrink-0 flex-col items-center gap-2"
          >
            <div className="relative">
              <div className="bg-accent/10 text-accent flex size-16 items-center justify-center rounded-2xl text-xl font-bold transition-transform hover:scale-105">
                {aluno.nome.charAt(0)}
              </div>
              <span className={`absolute -top-0.5 -right-0.5 size-3.5 rounded-full border-2 border-background ${aluno.ativo ? 'bg-green-500' : 'bg-muted-foreground'}`} />
            </div>
            <span className="text-foreground text-xs font-medium truncate max-w-[64px] text-center">
              {aluno.nome.split(' ')[0]}
            </span>
          </button>
        ))}
        <button
          type="button"
          onClick={() => navigate('/clientes')}
          className="flex shrink-0 flex-col items-center gap-2"
        >
          <div className="flex size-16 items-center justify-center rounded-2xl border-2 border-dashed border-muted-foreground/30 text-muted-foreground transition-colors hover:border-muted-foreground/50">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>
          <span className="text-muted-foreground text-xs">Ver todos</span>
        </button>
      </div>
    </section>
  )
}