import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export interface FcPonto {
  tempo: number
  bpm: number
}

export function extrairFc(detalhes?: Record<string, unknown>): FcPonto[] {
  if (!detalhes) return []
  const bruto = detalhes.frequenciasCardiacas
  if (!Array.isArray(bruto)) return []
  return bruto
    .filter((f): f is Record<string, number> => f != null && typeof f === 'object')
    .map((f) => ({ tempo: Number(f.tempoDecorridoSegundos ?? 0), bpm: Number(f.fcBpm ?? 0) }))
    .filter((p) => p.bpm > 0)
}

interface FcTempoChartProps {
  dados: FcPonto[]
  altura?: number
}

function formatTime(segundos: number): string {
  const m = Math.floor(segundos / 60)
  const s = segundos % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

interface TooltipProps {
  active?: boolean
  payload?: Array<{ payload: FcPonto }>
}

function FcTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload
  return (
    <div className="rounded-xl border border-border bg-background px-3 py-2 shadow-sm">
      <p className="text-muted-foreground text-[11px] tabular-nums">{formatTime(p.tempo)}</p>
      <p className="text-sm font-bold tabular-nums" style={{ color: 'var(--color-primary)' }}>
        {p.bpm} bpm
      </p>
    </div>
  )
}

export function FcTempoChart({ dados, altura = 220 }: FcTempoChartProps) {
  const series = useMemo(() => [...dados].sort((a, b) => a.tempo - b.tempo), [dados])

  if (series.length === 0) return null

  const bpms = series.map((d) => d.bpm)
  const yMin = Math.max(0, Math.min(...bpms) - 10)
  const yMax = Math.max(...bpms) + 10

  const maxTempo = Math.max(...series.map((d) => d.tempo), 0)
  const ticks: number[] = []
  for (let t = 0; t <= maxTempo; t += 60) ticks.push(t)

  return (
    <ResponsiveContainer width="100%" height={altura}>
      <LineChart data={series} margin={{ top: 24, right: 28, left: 8, bottom: 12 }}>
        <CartesianGrid vertical={false} stroke="var(--color-border)" strokeDasharray="3 4" />
        <XAxis
          dataKey="tempo"
          type="number"
          domain={[0, maxTempo]}
          ticks={ticks}
          tickFormatter={(v) => formatTime(Number(v))}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }}
          tickMargin={10}
          minTickGap={16}
        />
        <YAxis
          domain={[yMin, yMax]}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }}
          tickFormatter={(v) => String(Math.round(Number(v)))}
          width={40}
          tickMargin={8}
        />
        <Tooltip content={<FcTooltip />} cursor={{ stroke: 'var(--color-border)' }} />
        <Line
          type="monotone"
          dataKey="bpm"
          stroke="var(--color-primary)"
          strokeWidth={2}
          dot={{ r: 3, fill: 'var(--color-primary)', strokeWidth: 0 }}
          activeDot={{ r: 5, fill: 'var(--color-primary)' }}
          isAnimationActive
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
