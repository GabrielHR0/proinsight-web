import { useMemo } from 'react'
import type { AvaliacaoHistorico } from '@/types/avaliacao'
import { cn } from '@/lib/utils'
import { corClassificacao, formatarData } from './classificacao-utils'
import {
  formatarPercentual,
  formatarValorLaudo,
  METRICAS,
  serieDaMetrica,
  valorMetrica,
  type Metrica,
} from './laudo-utils'
import { ReferenciaFaixas } from './referencia-faixas'

interface DetalheMetricaProps {
  avaliacoes: AvaliacaoHistorico[]
  metrica: Metrica
}

function extrairAlturaMetros(avaliacoes: AvaliacaoHistorico[]): number | null {
  for (const a of avaliacoes) {
    const h = a.detalhes.alturaCm
    if (typeof h === 'number' && h > 0) return h / 100
  }
  return null
}

function faixasPesoPorAltura(alturaM: number) {
  const faixas = [
    { classificacao: 'ABAIXO_DO_PESO', classificacao_legivel: 'Abaixo do peso', max: 18.5 * alturaM * alturaM },
    { classificacao: 'NORMAL', classificacao_legivel: 'Normal', min: 18.5 * alturaM * alturaM, max: 25 * alturaM * alturaM },
    { classificacao: 'SOBREPESO', classificacao_legivel: 'Sobrepeso', min: 25 * alturaM * alturaM, max: 30 * alturaM * alturaM },
    { classificacao: 'OBESIDADE_I', classificacao_legivel: 'Obesidade I', min: 30 * alturaM * alturaM, max: 35 * alturaM * alturaM },
    { classificacao: 'OBESIDADE_II', classificacao_legivel: 'Obesidade II', min: 35 * alturaM * alturaM, max: 40 * alturaM * alturaM },
    { classificacao: 'OBESIDADE_III', classificacao_legivel: 'Obesidade III', min: 40 * alturaM * alturaM },
  ]
  return {
    niveis: faixas.map((f) => ({
      classificacao: f.classificacao,
      classificacao_legivel: f.classificacao_legivel,
      min: f.min != null ? Math.round(f.min * 10) / 10 : undefined,
      max: f.max != null ? Math.round(f.max * 10) / 10 : undefined,
    })),
  }
}

function calcularImc(pesoKg: number, alturaM: number): number {
  return pesoKg / (alturaM * alturaM)
}

function classificarPeso(pesoKg: number, alturaM: number): string {
  const imc = calcularImc(pesoKg, alturaM)
  if (imc < 18.5) return 'ABAIXO_DO_PESO'
  if (imc < 25) return 'NORMAL'
  if (imc < 30) return 'SOBREPESO'
  if (imc < 35) return 'OBESIDADE_I'
  if (imc < 40) return 'OBESIDADE_II'
  return 'OBESIDADE_III'
}

export function DetalheMetrica({ avaliacoes, metrica }: DetalheMetricaProps) {
  const definicao = METRICAS.find((m) => m.metrica === metrica)
  const serie = useMemo(
    () => (definicao ? serieDaMetrica(avaliacoes, metrica) : { metrica, pontos: [] as AvaliacaoHistorico[] }),
    [avaliacoes, metrica, definicao],
  )

  const alturaM = useMemo(() => extrairAlturaMetros(avaliacoes), [avaliacoes])

  if (!definicao || serie.pontos.length === 0) return null

  const primeira = serie.pontos[0]
  const atual = serie.pontos[serie.pontos.length - 1]
  const unicaAvaliacao = serie.pontos.length === 1
  const valorAtual = valorMetrica(atual, metrica) ?? 0
  const valorPrimeira = valorMetrica(primeira, metrica) ?? 0
  const variacaoAbs = valorAtual - valorPrimeira
  const variacaoPct = valorPrimeira === 0 ? null : (variacaoAbs / Math.abs(valorPrimeira)) * 100
  const subiu = variacaoAbs > 0
  const corEvolucao =
    variacaoAbs === 0
      ? 'text-muted-foreground'
      : subiu === definicao.melhorQuandoSubir
        ? 'text-primary'
        : 'text-red-500 dark:text-red-400'

  const isPeso = metrica === 'peso' && alturaM != null
  const classificacaoChave = isPeso ? classificarPeso(valorAtual, alturaM!) : undefined
  const classificacaoLegivel = classificacaoChave
    ? { ABAIXO_DO_PESO: 'Abaixo do peso', NORMAL: 'Normal', SOBREPESO: 'Sobrepeso', OBESIDADE_I: 'Obesidade I', OBESIDADE_II: 'Obesidade II', OBESIDADE_III: 'Obesidade III' }[classificacaoChave] ?? classificacaoChave
    : (atual.classificacao_legivel ?? atual.classificacao ?? '')
  const cor = isPeso
    ? corClassificacao(classificacaoChave)
    : corClassificacao(atual.classificacao)

  const refPeso = isPeso ? faixasPesoPorAltura(alturaM!) : null
  const protocolo = isPeso
    ? 'Peso \u2022 IMC - OMS'
    : (atual.protocolo_nome ?? 'Avalia\u00E7\u00E3o')

  return (
    <section>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-foreground text-base font-black tracking-tight">{definicao.rotulo}</h2>
        <p className="text-muted-foreground text-[11px] font-semibold uppercase tracking-[0.12em]">
          {protocolo}
        </p>
      </div>

      <div className="mt-4 text-center md:text-left">
        <p className="text-foreground text-6xl font-black tracking-tight">{formatarValorLaudo(valorAtual)}</p>
        <p className="text-muted-foreground mt-1 text-sm font-semibold">{definicao.unidade}</p>
        <p className={cn('mt-2 text-xs font-bold uppercase tracking-[0.14em]', cor.texto)}>
          {classificacaoLegivel || 'Sem classifica\u00E7\u00E3o'}
        </p>

        <div className="mt-6 flex flex-col gap-1.5 border-t border-border/60 pt-4">
          <p className="text-muted-foreground text-[11px] font-semibold uppercase tracking-[0.12em]">
            {unicaAvaliacao
              ? 'Avalia\u00E7\u00E3o atual'
              : 'Evolu\u00E7\u00E3o desde a 1\u00AA avalia\u00E7\u00E3o'}
          </p>
          <p className={cn('text-xl font-black tracking-tight', corEvolucao)}>
            {variacaoAbs === 0
              ? '\u2014'
              : `${subiu ? '+' : ''}${formatarValorLaudo(variacaoAbs)} ${definicao.unidade}`}
            {variacaoPct != null && (
              <span className="ml-2 text-sm font-bold opacity-80">
                ({subiu ? '+' : ''}
                {formatarPercentual(variacaoPct)}%)
              </span>
            )}
          </p>
          <p className="text-muted-foreground text-xs">
            {formatarData(primeira.data_avaliacao)} {'→'} {formatarData(atual.data_avaliacao)}
          </p>
        </div>
      </div>

      {isPeso && refPeso && (
        <div className="mt-6 border-t border-border/60 pt-5">
          <ReferenciaFaixas
            referencia={refPeso}
            valor={valorAtual}
            tipo="PESO"
            mostrarValorAtual={false}
            painel={false}
          />
        </div>
      )}

      {!isPeso && atual.referencias && atual.referencias.niveis.length > 0 && (
        <div className="mt-6 border-t border-border/60 pt-5">
          <ReferenciaFaixas
            referencia={atual.referencias}
            valor={valorAtual}
            tipo={atual.tipo}
            mostrarValorAtual={false}
            painel={false}
          />
        </div>
      )}
    </section>
  )
}
