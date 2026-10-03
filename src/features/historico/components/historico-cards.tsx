import { useMemo, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { AvaliacaoHistorico } from '@/types/avaliacao'
import { cn } from '@/lib/utils'
import { corClassificacao, detalhesLegiveis, formatarDataHora, linhasFuncional, rotuloTipo } from './classificacao-utils'
import { formatarValorLaudo, METRICAS, valorMetrica } from './laudo-utils'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { FcTempoChart, extrairFc } from '@/features/avaliacao/components/fc-tempo-chart'

interface HistoricoCardsProps {
  avaliacoes: AvaliacaoHistorico[]
}

export function HistoricoCards({ avaliacoes }: HistoricoCardsProps) {
  const desc = useMemo(
    () =>
      [...avaliacoes].sort((a, b) =>
        (b.data_avaliacao ?? '').localeCompare(a.data_avaliacao ?? ''),
      ),
    [avaliacoes],
  )

  return (
    <section>
      <h2 className="text-foreground text-base font-black tracking-tight">Histórico</h2>
      <div className="mt-4 flex flex-col gap-3">
        {desc.map((avaliacao) => (
          <HistoricoLinha key={avaliacao.id} avaliacao={avaliacao} />
        ))}
      </div>
    </section>
  )
}

function HistoricoLinha({ avaliacao }: { avaliacao: AvaliacaoHistorico }) {
  const [aberta, setAberta] = useState(false)
  const [completaAberta, setCompletaAberta] = useState(false)
  const cor = corClassificacao(avaliacao.classificacao)
  const ehFuncional = avaliacao.tipo === 'FUNCIONAL'

  const resumo = METRICAS.map((m) => {
    const valor = valorMetrica(avaliacao, m.metrica)
    return valor != null ? { rotulo: m.rotulo, valor: `${formatarValorLaudo(valor)} ${m.unidade}` } : null
  }).filter((r): r is { rotulo: string; valor: string } => r != null)

  const detalhes = detalhesLegiveis(avaliacao)
  const observacao = detalhes.find((d) => d.label === 'Observações')
  const detalhesMetricas = detalhes.filter((d) => d.label !== 'Observações')
  const linhas = ehFuncional ? linhasFuncional(avaliacao) : []
  const fcDados = extrairFc(avaliacao.detalhes)

  return (
    <Collapsible open={aberta} onOpenChange={(v) => { setAberta(v); if (!v) setCompletaAberta(false) }}>
      <div className="rounded-2xl border border-border/60 bg-background shadow-sm">
        <CollapsibleTrigger asChild>
          <button type="button" className="flex w-full items-center justify-between px-5 py-4 text-left">
            <div className="min-w-0 flex-1">
              <p className="text-foreground text-sm font-bold">
                {rotuloTipo(avaliacao.tipo)}
                {avaliacao.protocolo_nome ? (
                  <span className="text-muted-foreground font-normal">{' '}&middot;{' '}{avaliacao.protocolo_nome}</span>
                ) : null}
              </p>
              <p className="text-muted-foreground mt-0.5 text-[11px] font-medium tabular-nums">
                {formatarDataHora(avaliacao.data_avaliacao)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={cn('text-[11px] font-bold uppercase tracking-[0.12em]', cor.texto)}>
                {avaliacao.classificacao_legivel ?? avaliacao.classificacao ?? '\u2014'}
              </span>
              <ChevronDown size={16} className={cn('text-muted-foreground transition-transform duration-200', aberta && 'rotate-180')} />
            </div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="flex flex-col gap-4 border-t border-foreground/5 px-5 py-4">
            {ehFuncional ? (
              <>
                {typeof avaliacao.valor === 'number' && (
                  <div>
                    <p className="text-muted-foreground text-[11px] font-semibold uppercase tracking-[0.14em]">
                      Percentil médio
                    </p>
                    <p className="text-foreground text-3xl font-black tracking-tight tabular-nums">
                      {Math.round(avaliacao.valor)}
                    </p>
                  </div>
                )}

                {linhas.length > 0 && (
                  <ul className="divide-y divide-foreground/5 border-t border-foreground/5">
                    {linhas.map((linha) => (
                      <li key={linha.nome} className="flex items-center justify-between gap-3 py-2.5">
                        <div className="min-w-0">
                          <p className="text-foreground text-sm font-medium">{linha.nome}</p>
                          {linha.valor && (
                            <p className="text-muted-foreground text-[11px] tabular-nums">{linha.valor}</p>
                          )}
                        </div>
                        <div className="flex shrink-0 items-center gap-3 tabular-nums">
                          <span className="text-muted-foreground text-[11px] font-semibold">{linha.percentil}</span>
                          <span className={cn('text-[11px] font-bold uppercase tracking-[0.1em]', linha.cor)}>
                            {linha.classificacao}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                {observacao && (
                  <div className="border-t border-foreground/5 pt-3">
                    <p className="text-muted-foreground text-[10px] font-semibold uppercase leading-relaxed tracking-[0.12em]">
                      Observações
                    </p>
                    <p className="text-foreground text-sm font-normal leading-relaxed">{observacao.valor}</p>
                  </div>
                )}
              </>
            ) : (
              <>
                {resumo.length > 0 && (
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
                    {resumo.map((item) => (
                      <div key={item.rotulo}>
                        <p className="text-muted-foreground text-[10px] font-semibold uppercase leading-relaxed tracking-[0.12em]">
                          {item.rotulo}
                        </p>
                        <p className="text-foreground text-sm font-bold tabular-nums">{item.valor}</p>
                      </div>
                    ))}
                  </div>
                )}

                {(detalhes.length > 0 || (avaliacao.tipo === 'VO2_MAX' && fcDados.length > 0)) && (
                  <div className="border-t border-foreground/5 pt-4">
                    <button
                      type="button"
                      onClick={() => setCompletaAberta(!completaAberta)}
                      className="flex w-full items-center justify-between text-left"
                    >
                      <p className="text-muted-foreground text-[11px] font-semibold uppercase tracking-[0.14em]">
                        Avaliação completa
                      </p>
                      <ChevronDown size={14} className={cn('text-muted-foreground transition-transform duration-200', completaAberta && 'rotate-180')} />
                    </button>
                    {completaAberta && (
                      <div className="mt-3 flex flex-col gap-4">
                        {detalhesMetricas.length > 0 && (
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                            {detalhesMetricas.map((d) => (
                              <div key={d.label}>
                                <p className="text-muted-foreground text-[10px] font-semibold uppercase leading-relaxed tracking-[0.12em]">
                                  {d.label}
                                </p>
                                <p className="text-foreground text-sm font-bold">{d.valor}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {avaliacao.tipo === 'VO2_MAX' && fcDados.length > 0 && (
                          <div className="rounded-3xl border border-border/60 bg-background p-4 shadow-sm">
                            <div className="flex items-baseline justify-between">
                              <p className="text-muted-foreground text-[11px] font-semibold uppercase tracking-[0.14em]">
                                Freq. cardíaca × tempo
                              </p>
                              <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">
                                {fcDados.length} registros
                              </span>
                            </div>
                            <div className="mt-3">
                              <FcTempoChart dados={fcDados} />
                            </div>
                            {observacao && (
                              <div className="mt-3 border-t border-foreground/5 pt-3">
                                <p className="text-muted-foreground text-[10px] font-semibold uppercase leading-relaxed tracking-[0.12em]">
                                  Observações
                                </p>
                                <p className="text-foreground text-sm font-normal leading-relaxed">{observacao.valor}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {avaliacao.tipo !== 'VO2_MAX' && observacao && (
                          <div className="border-t border-foreground/5 pt-3">
                            <p className="text-muted-foreground text-[10px] font-semibold uppercase leading-relaxed tracking-[0.12em]">
                              Observações
                            </p>
                            <p className="text-foreground text-sm font-normal leading-relaxed">{observacao.valor}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}
