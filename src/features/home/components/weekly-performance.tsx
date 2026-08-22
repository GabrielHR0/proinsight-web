import { useState } from 'react'
import { AnimatedNumber } from '@/components/ui/animated-number'

type Periodo = 'diario' | 'semanal' | 'mensal'

const periodos = [
  { value: 'diario' as const, label: 'Hoje' },
  { value: 'semanal' as const, label: 'Semana' },
  { value: 'mensal' as const, label: 'Mês' },
]

const kpis: Record<Periodo, {
  id: string
  label: string
  valor: number
  meta: number
  anterior: number
  unidade: string
  dados: number[]
}[]> = {
  diario: [
    {
      id: 'alunos',
      label: 'Alunos',
      valor: 12,
      meta: 15,
      anterior: 10,
      unidade: '',
      dados: [10, 11, 12, 10, 11, 12, 12],
    },
    {
      id: 'avaliacoes',
      label: 'Avaliações',
      valor: 3,
      meta: 5,
      anterior: 2,
      unidade: '',
      dados: [2, 1, 3, 0, 1, 2, 3],
    },
    {
      id: 'retencao',
      label: 'Retenção',
      valor: 92,
      meta: 95,
      anterior: 88,
      unidade: '%',
      dados: [88, 89, 90, 90, 91, 91, 92],
    },
  ],
  semanal: [
    {
      id: 'alunos',
      label: 'Alunos',
      valor: 48,
      meta: 60,
      anterior: 42,
      unidade: '',
      dados: [42, 43, 44, 45, 46, 47, 48],
    },
    {
      id: 'avaliacoes',
      label: 'Avaliações',
      valor: 24,
      meta: 30,
      anterior: 18,
      unidade: '',
      dados: [18, 20, 21, 22, 23, 23, 24],
    },
    {
      id: 'retencao',
      label: 'Retenção',
      valor: 88,
      meta: 95,
      anterior: 82,
      unidade: '%',
      dados: [82, 83, 85, 86, 87, 87, 88],
    },
  ],
  mensal: [
    {
      id: 'alunos',
      label: 'Alunos',
      valor: 48,
      meta: 60,
      anterior: 40,
      unidade: '',
      dados: [40, 42, 43, 45, 46, 47, 48],
    },
    {
      id: 'avaliacoes',
      label: 'Avaliações',
      valor: 86,
      meta: 100,
      anterior: 72,
      unidade: '',
      dados: [72, 76, 78, 80, 82, 84, 86],
    },
    {
      id: 'retencao',
      label: 'Retenção',
      valor: 85,
      meta: 95,
      anterior: 78,
      unidade: '%',
      dados: [78, 80, 81, 82, 83, 84, 85],
    },
  ],
}

const labels: Record<Periodo, string[]> = {
  diario: ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'],
  semanal: ['1ª', '2ª', '3ª', '4ª', '5ª', '6ª', '7ª'],
  mensal: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul'],
}

export function WeeklyPerformance() {
  const [periodo, setPeriodo] = useState<Periodo>('diario')
  const [active, setActive] = useState('alunos')
  const itens = kpis[periodo]
  const kpi = itens.find((k) => k.id === active) ?? itens[0]
  const variacao = ((kpi.valor - kpi.anterior) / kpi.anterior) * 100
  const max = Math.max(...kpi.dados)

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-foreground text-sm font-semibold">Indicadores</h3>
      </div>

      <div className="mb-4 flex gap-2">
        {periodos.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => { setPeriodo(p.value); setActive(itens[0]?.id ?? 'alunos') }}
            className={`flex-1 rounded-full py-1.5 text-xs font-semibold transition-colors ${
              periodo === p.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="-mx-6 mb-4 flex gap-2 overflow-x-auto px-6 pb-1 scrollbar-none">
        {itens.map((k) => (
          <button
            key={k.id}
            type="button"
            onClick={() => setActive(k.id)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
              active === k.id
                ? 'bg-foreground text-background'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {k.label}
          </button>
        ))}
      </div>

      <div className="mb-3 flex items-end justify-between">
        <div>
          <span className="text-foreground text-2xl font-bold">
            {kpi.unidade === 'R$' ? `R$ ` : ''}
            <AnimatedNumber key={`${periodo}-${kpi.id}`} value={kpi.valor} />
            {kpi.unidade !== 'R$' ? kpi.unidade : ''}
          </span>
          <span className="text-muted-foreground ml-1 text-xs">
            / {kpi.unidade === 'R$' ? `R$ ${kpi.meta}` : `${kpi.meta}${kpi.unidade}`}
          </span>
        </div>
        <span className={`text-xs font-bold ${variacao >= 0 ? 'text-primary' : 'text-red-500'}`}>
          {variacao >= 0 ? '+' : ''}{Math.round(variacao)}%
        </span>
      </div>

      <div className="flex items-end gap-2 h-28">
        {kpi.dados.map((valor, i) => {
          const h = max === 0 ? 0 : (valor / max) * 100
          const isActive = i === kpi.dados.length - 1
          return (
            <div key={`${periodo}-${kpi.id}-${i}`} className="flex flex-1 flex-col items-center gap-1">
              <span className={`text-[10px] font-bold ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                {kpi.unidade === '%' ? `${valor}` : valor}
              </span>
              <div className="w-full flex items-end" style={{ height: '80px' }}>
                <div
                  className={`w-full rounded-t-lg transition-[height] duration-500 ease-out ${isActive ? 'bg-primary dark:bg-secondary' : 'bg-primary/20 dark:bg-secondary/30'}`}
                  style={{ height: `${Math.max(h, 8)}%` }}
                />
              </div>
              <span className={`text-[10px] font-medium ${isActive ? 'text-primary dark:text-secondary' : 'text-muted-foreground'}`}>{labels[periodo][i]}</span>
            </div>
          )
        })}
      </div>

      <p className="text-muted-foreground mt-3 text-xs">
        {kpi.valor - kpi.anterior > 0 ? '+' : ''}{Math.round(kpi.valor - kpi.anterior)}{kpi.unidade} vs {periodo === 'diario' ? 'ontem' : periodo === 'semanal' ? 'semana anterior' : 'mês anterior'}
      </p>
    </section>
  )
}