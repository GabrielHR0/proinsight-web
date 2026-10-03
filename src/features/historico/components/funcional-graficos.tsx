import { useMemo, useState } from 'react'
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { AvaliacaoHistorico } from '@/types/avaliacao'
import { cn } from '@/lib/utils'
import { corClassificacao, rotuloClassificacao } from './classificacao-utils'
import {
  dominioValor,
  formatarNumero,
  rotuloPercentil,
  seriesFuncionais,
  type PontoFuncional,
  type SerieFuncional,
} from './funcional-graficos-utils'

const COR_VALOR = 'var(--color-chart-1)'
const COR_PERCENTIL = 'var(--color-chart-3)'
const FAIXA_NORMAL = { min: 25, max: 75 }

type TipoGrafico = 'linha' | 'barra' | 'area'
type Modo = 'absoluto' | 'evolucao'

const TIPOS: { valor: TipoGrafico; rotulo: string }[] = [
  { valor: 'linha', rotulo: 'Linha' },
  { valor: 'barra', rotulo: 'Barra' },
  { valor: 'area', rotulo: 'Área' },
]

interface PontoGrafico extends PontoFuncional {
  valorGrafico: number | null
  percentilGrafico: number | null
}

interface TooltipFuncionalProps {
  ativo?: boolean
  payload?: { payload: PontoGrafico }[]
  unidade: string
  modo: Modo
}

function TooltipFuncional({ ativo, payload, unidade, modo }: TooltipFuncionalProps) {
  if (!ativo || !payload?.length) return null
  const ponto = payload[0].payload
  const codigo = ponto.classificacao
  const cor = corClassificacao(codigo)

  return (
    <div className="rounded-xl border border-border bg-background px-3 py-2 shadow-sm">
      <p className="text-muted-foreground text-[11px] tabular-nums">{ponto.data}</p>
      {ponto.valorGrafico != null && (
        <p className="text-sm font-bold tabular-nums" style={{ color: COR_VALOR }}>
          {formatarNumero(ponto.valorGrafico)} {unidade}
          {modo === 'evolucao' ? ' de evolução' : ''}
        </p>
      )}
      <p className="text-foreground text-[11px] font-semibold tabular-nums">
        {ponto.percentilGrafico != null ? `Percentil ${ponto.percentilGrafico}` : 'Abaixo do percentil 5'}
      </p>
      {codigo && (
        <p className={cn('text-[11px] font-bold uppercase tracking-[0.1em]', cor.texto)}>
          {rotuloClassificacao(codigo)}
        </p>
      )}
    </div>
  )
}

interface GraficoTesteProps {
  serie: SerieFuncional
  tipo: TipoGrafico
  modo: Modo
}

function GraficoTeste({ serie, tipo, modo }: GraficoTesteProps) {
  const dados = useMemo<PontoGrafico[]>(
    () =>
      serie.pontos.map((p) => ({
        ...p,
        valorGrafico: modo === 'evolucao' ? p.variacao : p.valor,
        percentilGrafico: p.percentil,
      })),
    [serie.pontos, modo],
  )

  const [yMin, yMax] = useMemo(() => dominioValor(serie.pontos, modo), [serie.pontos, modo])
  const ultimo = serie.pontos[serie.pontos.length - 1]
  const corUltima = corClassificacao(ultimo.classificacao)

  return (
    <div className="rounded-2xl border border-border/60 bg-background p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-foreground text-sm font-bold leading-tight">{serie.nome}</p>
          <p className="text-muted-foreground text-[11px] font-semibold uppercase tracking-[0.12em]">
            {modo === 'evolucao' ? 'variação (%)' : serie.unidade}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-foreground text-2xl font-black tracking-tight tabular-nums">
            {formatarNumero(ultimo.valor)}
          </p>
          <p className="text-muted-foreground text-[11px] font-semibold tabular-nums">
            {rotuloPercentil(ultimo.percentil)}
          </p>
          <p className={cn('text-[11px] font-bold uppercase tracking-[0.1em]', corUltima.texto)}>
            {rotuloClassificacao(ultimo.classificacao)}
          </p>
        </div>
      </div>

      <div className="mt-3">
        <ResponsiveContainer width="100%" height={150}>
          <ComposedChart data={dados} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--color-border)" strokeDasharray="3 4" />
            <XAxis
              dataKey="dataCurta"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 9, fill: 'var(--color-muted-foreground)' }}
              tickMargin={6}
              minTickGap={8}
            />
            <YAxis
              yAxisId="valor"
              domain={[yMin, yMax]}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 9, fill: 'var(--color-muted-foreground)' }}
              tickFormatter={(v: number) => formatarNumero(v, 0)}
              width={32}
            />
            <YAxis
              yAxisId="percentil"
              orientation="right"
              domain={[0, 100]}
              ticks={[0, 50, 100]}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 9, fill: 'var(--color-muted-foreground)' }}
              width={24}
            />
            <ReferenceArea
              yAxisId="percentil"
              y1={FAIXA_NORMAL.min}
              y2={FAIXA_NORMAL.max}
              fill={COR_VALOR}
              fillOpacity={0.06}
              stroke="none"
            />
            <ReferenceLine
              yAxisId="percentil"
              y={50}
              stroke="var(--color-border)"
              strokeDasharray="2 4"
            />
            <Tooltip
              content={<TooltipFuncional unidade={serie.unidade} modo={modo} />}
              cursor={{ stroke: 'var(--color-border)' }}
            />

            {tipo === 'linha' && (
              <Line
                yAxisId="valor"
                type="monotone"
                dataKey="valorGrafico"
                stroke={COR_VALOR}
                strokeWidth={2}
                dot={{ r: 3, fill: COR_VALOR, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: COR_VALOR }}
                connectNulls
              />
            )}

            {tipo === 'barra' && (
              <Bar
                yAxisId="valor"
                dataKey="valorGrafico"
                fill={COR_VALOR}
                radius={[4, 4, 0, 0]}
                maxBarSize={22}
                fillOpacity={0.85}
              />
            )}

            {tipo === 'area' && (
              <Area
                yAxisId="valor"
                type="monotone"
                dataKey="valorGrafico"
                stroke={COR_VALOR}
                strokeWidth={2}
                fill={COR_VALOR}
                fillOpacity={0.16}
                connectNulls
              />
            )}

            <Line
              yAxisId="percentil"
              type="monotone"
              dataKey="percentilGrafico"
              stroke={COR_PERCENTIL}
              strokeWidth={1.5}
              strokeDasharray="4 3"
              dot={{ r: 2, fill: COR_PERCENTIL, strokeWidth: 0 }}
              connectNulls
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

interface GraficosFuncionaisProps {
  avaliacoes: AvaliacaoHistorico[]
}

export function GraficosFuncionais({ avaliacoes }: GraficosFuncionaisProps) {
  const [tipo, setTipo] = useState<TipoGrafico>('linha')
  const [modo, setModo] = useState<Modo>('absoluto')

  const series = useMemo(() => seriesFuncionais(avaliacoes), [avaliacoes])
  const avaliacoesCount = useMemo(
    () => avaliacoes.filter((a) => a.tipo === 'FUNCIONAL').length,
    [avaliacoes],
  )

  if (series.length === 0) return null

  return (
    <section>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-foreground text-base font-black tracking-tight">Evolução funcional</h2>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Comparativo histórico de cada teste da bateria
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModo(modo === 'absoluto' ? 'evolucao' : 'absoluto')}
          className="text-primary hover:text-primary/80 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors"
        >
          {modo === 'absoluto' ? 'Ver evolução' : 'Ver valores'}
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {TIPOS.map((t) => (
          <button
            key={t.valor}
            type="button"
            onClick={() => setTipo(t.valor)}
            className={cn(
              'shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors',
              t.valor === tipo ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground',
            )}
          >
            {t.rotulo}
          </button>
        ))}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-3">
        <span className="text-muted-foreground text-[11px] font-semibold">
          {avaliacoesCount} {avaliacoesCount === 1 ? 'avaliação' : 'avaliações'}
        </span>
        <span className="flex items-center gap-1.5 text-[11px] font-semibold">
          <span className="inline-block size-2 rounded-full" style={{ backgroundColor: COR_VALOR }} />
          Valor bruto
        </span>
        <span className="flex items-center gap-1.5 text-[11px] font-semibold">
          <span className="inline-block size-2 rounded-full" style={{ backgroundColor: COR_PERCENTIL }} />
          Percentil
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {series.map((serie) => (
          <GraficoTeste key={serie.teste} serie={serie} tipo={tipo} modo={modo} />
        ))}
      </div>
    </section>
  )
}