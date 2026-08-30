import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CircleArrowRight } from 'lucide-react'

const fila = [
  { nome: 'Pedro Almeida', horario: '14:30', protocolo: 'Avaliação Cooper de 12min' },
  { nome: 'Mariana Santos', horario: '15:00', protocolo: 'Avaliação Isocinética' },
  { nome: 'Carlos Lima', horario: '15:45', protocolo: 'Bioimpedância' },
]

export function NextAssessmentCard() {
  const navigate = useNavigate()
  const [index, setIndex] = useState(0)
  const current = fila[index]

  const proximo = () => {
    if (index < fila.length - 1) setIndex(index + 1)
  }

  const anterior = () => {
    if (index > 0) setIndex(index - 1)
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-foreground text-lg font-bold">Próxima avaliação</h2>

      <div className="px-6">
        {index > 0 && index < fila.length - 1 ? (
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={anterior}
              className="text-muted-foreground text-xs font-semibold hover:underline"
            >
              &larr; {fila[index - 1].nome}
            </button>
            <div className="flex items-center gap-1.5">
              {fila.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndex(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === index ? 'w-6 bg-primary' : 'w-2 bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={proximo}
              className="text-link dark:text-primary-foreground text-xs font-semibold hover:underline"
            >
              {fila[index + 1].nome} &rarr;
            </button>
          </div>
        ) : index > 0 ? (
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={anterior}
              className="text-muted-foreground text-xs font-semibold hover:underline"
            >
              &larr; {fila[index - 1].nome}
            </button>
            <div className="flex items-center gap-1.5">
              {fila.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndex(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === index ? 'w-6 bg-primary' : 'w-2 bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {fila.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndex(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === index ? 'w-6 bg-primary' : 'w-2 bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={proximo}
              className="text-link dark:text-primary-foreground text-xs font-semibold hover:underline"
            >
              {fila[index + 1].nome} &rarr;
            </button>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => navigate('/avaliacao/nova')}
        className="flex w-full items-center justify-between rounded-[31px] border border-primary bg-primary px-6 py-5 text-left shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
      >
        <div>
          <p className="text-primary-foreground text-base font-semibold">
            {current.nome}
            <span className="text-primary-foreground/70 ml-2 text-sm font-medium">{current.horario}</span>
          </p>
          <p className="text-primary-foreground/60 text-xs">{current.protocolo}</p>
        </div>

        <CircleArrowRight size={32} className="text-primary-foreground shrink-0" />
      </button>
    </div>
  )
}