import { useMemo, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceArea,
  ResponsiveContainer,
  LabelList,
} from 'recharts'
import type { AvaliacaoHistorico, NivelReferencia } from '@/types/avaliacao'
import { cn } from '@/lib/utils'
import { formatarData } from './classificacao-utils'
import {
  METRICAS,
  serieDaMetrica,
  formatarValorLaudo,
  valorMetrica,
  type Metrica,
} from './laudo-utils'

interface EvolucaoChartProps {
  avaliacoes: AvaliacaoHistorico[]
  metricaAtiva: Metrica
  onMetricaChange: (m: Metrica) => void
  metricasComparacao: Metrica[]
  onMetricasComparacaoChange: (m: Metrica[]) => void
}

interface BarraMulti {
  data: string
  _sortKey: string
  [chave: string]: string | number
}

const CORES_BARRA: Record<string, string> = {
  peso: 'var(--color-primary)',
  imc: '#6db6fe',
  gordura: '#f59e0b',
  massaMagra: '#10b981',
  vo2: '#ef4444',
}

const CORES_ZONA: Record<string, string> = {
  MUITO_RUIM: 'rgba(239,68,68,0.15)',
  RUIM: 'rgba(245,158,11,0.15)',
  MEDIO: 'rgba(234,179,8,0.12)',
  M\u00C9DIO: 'rgba(234,179,8,0.12)',
  BOM: 'rgba(90,161,127,0.12)',
  MUITO_BOM: 'rgba(16,185,129,0.12)',
  EXCELENTE: 'rgba(14,165,233,0.12)',
  ABAIXO_DO_PESO: 'rgba(14,165,233,0.12)',
  NORMAL: 'rgba(90,161,127,0.12)',
  SOBREPESO: 'rgba(251,191,36,0.15)',
  OBESIDADE_I: 'rgba(249,115,22,0.15)',
  OBESIDADE_II: 'rgba(239,68,68,0.15)',
  OBESIDADE_III: 'rgba(185,28,28,0.15)',
}

function corZona(classificacao?: string): string {
  if (!classificacao) return 'rgba(128,128,128,0.08)'
  return CORES_ZONA[classificacao] ?? 'rgba(128,128,128,0.08)'
}

function inicioZona(nivel: NivelReferencia): number {
  if (nivel.min != null) return nivel.min
  if (nivel.max != null) return nivel.max - 10
  return -999
}

function fimZona(nivel: NivelReferencia, maxGeral: number): number {
  if (nivel.max != null) return nivel.max
  return maxGeral + 10
}

interface TooltipPayloadItem {
  dataKey: string
  value: number
  payload: BarraMulti
}

function TooltipMulti({ active, payload }: { active?: boolean; payload?: TooltipPayloadItem[] }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-xl border border-border/70 bg-background px-3 py-2 shadow-sm">
      <p className="text-muted-foreground text-[11px]">{d.data}</p>
      {payload.map((p) => {
        const def = METRICAS.find((m) => m.metrica === p.dataKey)
        if (!def || typeof p.value !== 'number') return null
        return (
          <p key={p.dataKey} className="text-sm font-bold" style={{ color: CORES_BARRA[p.dataKey] }}>
            {formatarValorLaudo(p.value)} {def.unidade}
            <span className="ml-1 text-[10px] font-semibold uppercase opacity-70">{def.rotulo}</span>
          </p>
        )
      })}
    </div>
  )
}

function LabelBarra(props: { x?: number; y?: number; width?: number; value?: string }) {
  const { x = 0, y = 0, width = 0, value } = props
  if (!value) return null
  return (
    <text x={x + width / 2} y={y - 6} textAnchor="middle" fontSize={10} fontWeight={700} fill="var(--color-foreground)">
      {value}
    </text>
  )
}

export function EvolucaoChart({
  avaliacoes,
  metricaAtiva,
  onMetricaChange,
  metricasComparacao,
  onMetricasComparacaoChange,
}: EvolucaoChartProps) {
  const [modo, setModo] = useState<'absoluto' | 'evolucao'>('absoluto')

  const tabs = useMemo(() => {
    const disponibles: Metrica[] = []
    for (const m of METRICAS) {
      if (avaliacoes.some((a) => m.extrair(a) != null)) disponibles.push(m.metrica)
    }
    return disponibles
  }, [avaliacoes])

  const metricasNoGrafico = useMemo(() => {
    return [metricaAtiva, ...metricasComparacao.filter((m) => m !== metricaAtiva)]
  }, [metricaAtiva, metricasComparacao])

  const dados: BarraMulti[] = useMemo(() => {
    const dataMap = new Map<string, BarraMulti>()

    for (const metrica of metricasNoGrafico) {
      const def = METRICAS.find((m) => m.metrica === metrica)!
      const pontos = avaliacoes
        .filter((a) => def.extrair(a) != null)
        .sort((a, b) => (a.data_avaliacao ?? '').localeCompare(b.data_avaliacao ?? ''))

      if (pontos.length === 0) continue
      const primeira = valorMetrica(pontos[0], metrica) ?? 0

      for (const av of pontos) {
        const raw = valorMetrica(av, metrica)
        if (raw == null) continue

        const dataLabel = formatarData(av.data_avaliacao)

        if (!dataMap.has(dataLabel)) {
          dataMap.set(dataLabel, { data: dataLabel, _sortKey: av.data_avaliacao ?? '' })
        }
        const entry = dataMap.get(dataLabel)!
        const valor =
          modo === 'evolucao' && primeira !== 0
            ? Math.round(((raw - primeira) / Math.abs(primeira)) * 1000) / 10
            : Math.round(raw * 10) / 10
        entry[metrica] = valor
      }
    }

    return Array.from(dataMap.values()).sort((a, b) =>
      (a._sortKey as string).localeCompare(b._sortKey as string),
    )
  }, [avaliacoes, metricasNoGrafico, modo])

  const ultimaRef = useMemo(() => {
    const serie = serieDaMetrica(avaliacoes, metricaAtiva)
    return serie.pontos[serie.pontos.length - 1]?.referencias
  }, [avaliacoes, metricaAtiva])

  const niveis = modo === 'absoluto' ? (ultimaRef?.niveis ?? []) : []

  const allVals: number[] = []
  dados.forEach((d) => {
    for (const m of metricasNoGrafico) {
      const v = d[m]
      if (typeof v === 'number') allVals.push(v)
    }
  })
  const minData = allVals.length > 0 ? Math.min(...allVals) : 0
  const maxData = allVals.length > 0 ? Math.max(...allVals) : 10
  const semVariacao = modo === 'evolucao' && minData === 0 && maxData === 0 && allVals.length > 0
  const refMin =
    niveis.length > 0
      ? Math.min(...niveis.map((n) => n.min ?? Infinity).filter((v) => v < Infinity))
      : minData
  const refMax =
    niveis.length > 0
      ? Math.max(...niveis.map((n) => n.max ?? -Infinity).filter((v) => v > -Infinity))
      : maxData
  const yMin = Math.min(minData, refMin) - 2
  const yMax = Math.max(maxData, refMax) + 2

  const comparaveis = tabs.filter((t) => t !== metricaAtiva)

  function toggleComparacao(m: Metrica) {
    if (metricasComparacao.includes(m)) {
      onMetricasComparacaoChange(metricasComparacao.filter((c) => c !== m))
    } else {
      onMetricasComparacaoChange([...metricasComparacao, m])
    }
  }

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-foreground text-base font-black tracking-tight">Evolução</h2>
        <button
          type="button"
          onClick={() => setModo(modo === 'absoluto' ? 'evolucao' : 'absoluto')}
          className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary hover:text-primary/80 transition-colors"
        >
          {modo === 'absoluto' ? 'Ver evolução' : 'Ver valores'}
        </button>
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {tabs.map((t) => {
          const def = METRICAS.find((m) => m.metrica === t)!
          return (
            <button
              key={t}
              type="button"
              onClick={() => onMetricaChange(t)}
              className={cn(
                'shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors',
                t === metricaAtiva ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground',
              )}
            >
              {def.rotulo}
            </button>
          )
        })}
      </div>

      {comparaveis.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground text-[11px] font-semibold">Comparar com:</span>
          {comparaveis.map((c) => {
            const def = METRICAS.find((m) => m.metrica === c)!
            const ativo = metricasComparacao.includes(c)
            return (
              <button
                key={c}
                type="button"
                onClick={() => toggleComparacao(c)}
                className={cn(
                  'rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors',
                  ativo
                    ? 'bg-primary/15 text-primary'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted',
                )}
              >
                {def.rotulo}
              </button>
            )
          })}
        </div>
      )}

      {metricasNoGrafico.length > 1 && (
        <div className="mt-2 flex flex-wrap items-center gap-3">
          {metricasNoGrafico.map((m) => {
            const def = METRICAS.find((d) => d.metrica === m)!
            return (
              <span key={m} className="flex items-center gap-1.5 text-[11px] font-semibold">
                <span
                  className="inline-block size-2 rounded-full"
                  style={{ backgroundColor: CORES_BARRA[m] }}
                />
                {def.rotulo}
              </span>
            )
          })}
        </div>
      )}

      <div className="mt-4 rounded-3xl border border-border/60 bg-background p-4 shadow-sm md:p-6">
        {semVariacao || dados.length === 0 ? (
          <div className="flex h-48 items-center justify-center">
            <p className="text-muted-foreground text-sm">Sem variação entre avaliações</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={dados} margin={{ top: 28, right: 16, left: 8, bottom: 4 }}>
              <CartesianGrid vertical={false} stroke="var(--color-border)" strokeDasharray="3 4" />
              <XAxis
                dataKey="data"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }}
                tickMargin={8}
              />
              <YAxis
                domain={[yMin, yMax]}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }}
                tickFormatter={(v: number) => String(Math.round(v))}
                width={36}
              />
              <Tooltip content={<TooltipMulti />} cursor={false} />
              {niveis.map((nivel, i) => {
                const y1 = inicioZona(nivel)
                const y2 = fimZona(nivel, yMax)
                if (y1 >= y2) return null
                return (
                  <ReferenceArea
                    key={`ref-${i}`}
                    y1={y1}
                    y2={y2}
                    fill={corZona(nivel.classificacao)}
                    fillOpacity={1}
                    stroke="none"
                  />
                )
              })}
              {metricasNoGrafico.map((m) => (
                <Bar
                  key={m}
                  dataKey={m}
                  fill={CORES_BARRA[m]}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={36}
                  fillOpacity={0.85}
                >
                  <LabelList content={<LabelBarra />} />
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  )
}
