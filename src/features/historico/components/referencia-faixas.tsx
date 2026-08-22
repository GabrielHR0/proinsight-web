import type { NivelReferencia, ReferenciaClassificacao } from '@/types/avaliacao'
import { cn } from '@/lib/utils'
import {
  corClassificacao,
  formatarFaixa,
  formatarValor,
  rotuloReferencia,
  unidadeTipo,
} from './classificacao-utils'

interface ReferenciaFaixasProps {
  referencia: ReferenciaClassificacao
  valor?: number
  tipo: string
  mostrarValorAtual?: boolean
  painel?: boolean
}

interface Segmento extends NivelReferencia {
  inicio: number
  fim: number
}

function escala(niveis: NivelReferencia[], valor?: number): { minExib: number; maxExib: number } {
  const mins = niveis.map((n) => n.min).filter((v): v is number => v != null)
  const maxs = niveis.map((n) => n.max).filter((v): v is number => v != null)
  const minNum = Math.min(...mins, valor != null ? valor : Infinity)
  const maxNum = Math.max(...maxs, valor != null ? valor : -Infinity)
  const span = maxNum - minNum || 1
  return { minExib: Math.max(0, minNum - span * 0.15), maxExib: maxNum + span * 0.15 }
}

function montarSegmentos(niveis: NivelReferencia[], valor?: number): { segmentos: Segmento[]; minExib: number; maxExib: number } {
  const { minExib, maxExib } = escala(niveis, valor)
  const segmentos = niveis.map((n) => ({
    ...n,
    inicio: n.min ?? minExib,
    fim: n.max ?? maxExib,
  }))
  return { segmentos, minExib, maxExib }
}

export function ReferenciaFaixas({ referencia, valor, tipo, mostrarValorAtual = true, painel = true }: ReferenciaFaixasProps) {
  if (referencia.niveis.length === 0) return null

  const { segmentos, minExib, maxExib } = montarSegmentos(referencia.niveis, valor)
  const span = maxExib - minExib || 1

  const pctValor = valor != null ? Math.min(100, Math.max(0, ((valor - minExib) / span) * 100)) : null

  const indiceAtual = valor != null
    ? segmentos.findIndex((s) => {
        const acimaDoMin = s.min == null || (s.tipo_min === 'EXCLUSIVO' ? valor > s.min : valor >= s.min)
        const abaixoDoMax = s.max == null || (s.tipo_max === 'EXCLUSIVO' ? valor < s.max : valor <= s.max)
        return acimaDoMin && abaixoDoMax
      })
    : -1

  const nivelAtual = indiceAtual >= 0 ? segmentos[indiceAtual] : null

  const rotulo = rotuloReferencia(referencia)

  return (
    <div className={cn('rounded-2xl border border-border/60 bg-card p-5 shadow-sm', !painel && 'rounded-none border-0 bg-transparent p-0 shadow-none')}>
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <p className="text-muted-foreground text-[11px] font-semibold uppercase tracking-[0.12em]">
          Referência
        </p>
        {rotulo && <p className="text-muted-foreground text-xs font-medium">{rotulo}</p>}
      </div>

      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="absolute inset-0 flex">
          {segmentos.map((s, i) => {
            const cor = corClassificacao(s.classificacao)
            return (
              <div
                key={`${s.classificacao ?? ''}-${i}`}
                className="h-full"
                style={{
                  width: `${((s.fim - s.inicio) / span) * 100}%`,
                  backgroundColor: cor.hex,
                }}
              />
            )
          })}
        </div>
        {pctValor != null && (
          <div
            className="absolute top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full bg-background shadow-sm"
            style={{ left: `${pctValor}%` }}
          />
        )}
      </div>

      {mostrarValorAtual && valor != null && nivelAtual != null && (
        <div className="mt-3 flex items-baseline justify-between gap-3">
          <p className="text-foreground text-sm font-semibold">
            {formatarValor(valor, tipo)}
            <span className="text-muted-foreground ml-1 text-[11px] font-medium">{unidadeTipo(tipo)}</span>
          </p>
          <p className={cn('text-[11px] font-semibold uppercase tracking-[0.12em]', corClassificacao(nivelAtual.classificacao).texto)}>
            {nivelAtual.classificacao_legivel ?? nivelAtual.classificacao}
          </p>
        </div>
      )}

      <div className="mt-4 flex flex-col gap-1.5">
        {segmentos.map((s, i) => {
          const cor = corClassificacao(s.classificacao)
          const atual = i === indiceAtual
          return (
            <div key={`${s.classificacao ?? ''}-${i}`} className="flex items-center gap-2.5">
              <span className={cn('size-2 rounded-full', cor.ponto)} />
              <span className={cn('flex-1 text-xs', atual ? 'text-foreground font-semibold' : 'text-muted-foreground')}>
                {s.classificacao_legivel ?? s.classificacao}
              </span>
              <span className="text-muted-foreground text-[11px] tabular-nums">{formatarFaixa(s)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
