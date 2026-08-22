import { useMemo } from 'react'
import { ArrowRight, Minus } from 'lucide-react'
import type { AvaliacaoHistorico } from '@/types/avaliacao'
import { cn } from '@/lib/utils'
import { formatarData } from './classificacao-utils'
import { compararAvaliacoesPorMetrica, formatarPercentual, formatarValorLaudo } from './laudo-utils'

interface ResumoEvolucaoProps {
  avaliacoes: AvaliacaoHistorico[]
}

export function ResumoEvolucao({ avaliacoes }: ResumoEvolucaoProps) {
  const ordenadas = useMemo(
    () => [...avaliacoes].sort((a, b) => (a.data_avaliacao ?? '').localeCompare(b.data_avaliacao ?? '')),
    [avaliacoes],
  )

  const linhas = useMemo(() => compararAvaliacoesPorMetrica(avaliacoes), [avaliacoes])

  if (linhas.length === 0) return null

  const primeiraData = ordenadas[0]?.data_avaliacao
  const ultimaData = ordenadas[ordenadas.length - 1]?.data_avaliacao

  return (
    <section>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-foreground text-base font-black tracking-tight">Resumo</h2>
        <p className="text-muted-foreground text-[11px] font-semibold uppercase tracking-[0.12em]">
          {formatarData(primeiraData)} {'→'} {formatarData(ultimaData)}
        </p>
      </div>

      <div className="mt-3 flex flex-col divide-y divide-border/60">
        {linhas.map((linha) => {
          const ambos = linha.valorA != null && linha.valorB != null
          const variacao = ambos ? linha.valorB! - linha.valorA! : null
          const melhorou = variacao != null && variacao !== 0 && variacao > 0 === linha.melhorQuandoSubir
          const cor =
            variacao == null || variacao === 0
              ? 'text-muted-foreground/60'
              : melhorou
                ? 'text-primary'
                : 'text-red-500 dark:text-red-400'
          return (
            <div
              key={linha.metrica}
              className="flex flex-col gap-1 py-3 md:flex-row md:items-center md:gap-2"
            >
              <span className="text-muted-foreground text-[11px] font-semibold uppercase leading-relaxed tracking-[0.12em] md:w-24 md:shrink-0">
                {linha.rotulo}
              </span>
              <div className="flex items-center gap-2 md:flex-1">
                <span className="text-foreground flex-1 text-right text-sm font-bold">
                  {linha.valorA != null
                    ? `${formatarValorLaudo(linha.valorA)} ${linha.unidade}`
                    : '\u2014'}
                </span>
                <span
                  className={cn(
                    'flex w-14 shrink-0 items-center justify-center gap-1 md:w-16',
                    cor,
                  )}
                >
                  {variacao == null ? (
                    <Minus size={14} />
                  ) : (
                    <>
                      <ArrowRight size={14} strokeWidth={2.5} />
                      {linha.variacaoPct != null && (
                        <span className="text-[11px] font-bold">
                          {variacao > 0 ? '+' : ''}
                          {formatarPercentual(linha.variacaoPct)}%
                        </span>
                      )}
                    </>
                  )}
                </span>
                <span className="text-foreground flex-1 text-sm font-bold">
                  {linha.valorB != null
                    ? `${formatarValorLaudo(linha.valorB)} ${linha.unidade}`
                    : '\u2014'}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
