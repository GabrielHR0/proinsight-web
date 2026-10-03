import type { AvaliacaoHistorico } from '@/types/avaliacao'
import { formatarData, TESTES_FUNCIONAIS } from './classificacao-utils'

export interface PontoFuncional {
  data: string
  dataCurta: string
  dataIso: string
  valor: number | null
  percentil: number | null
  classificacao?: string
  variacao: number | null
}

export interface SerieFuncional {
  teste: string
  nome: string
  unidade: string
  pontos: PontoFuncional[]
}

function numero(valor: unknown): number | null {
  return typeof valor === 'number' && Number.isFinite(valor) ? valor : null
}

function mapa(detalhes: Record<string, unknown>, campo: string): Record<string, unknown> {
  const bruto = detalhes[campo]
  return bruto && typeof bruto === 'object' ? (bruto as Record<string, unknown>) : {}
}

export function variacaoPercentual(base: number, atual: number): number | null {
  if (base === 0) return null
  return Math.round(((atual - base) / Math.abs(base)) * 1000) / 10
}

export function avaliacoesFuncionais(avaliacoes: AvaliacaoHistorico[]): AvaliacaoHistorico[] {
  return avaliacoes
    .filter((a) => a.tipo === 'FUNCIONAL')
    .sort((a, b) => (a.data_avaliacao ?? '').localeCompare(b.data_avaliacao ?? ''))
}

export function seriesFuncionais(avaliacoes: AvaliacaoHistorico[]): SerieFuncional[] {
  const registros = avaliacoesFuncionais(avaliacoes)
  const series: SerieFuncional[] = []

  for (const [chave, def] of Object.entries(TESTES_FUNCIONAIS)) {
    const pontos: PontoFuncional[] = []
    let base: number | null = null

    for (const avaliacao of registros) {
      const detalhes = avaliacao.detalhes ?? {}
      const valor = numero(detalhes[def.campo])
      const percentil = numero(mapa(detalhes, 'percentis')[chave])
      if (valor == null && percentil == null) continue

      if (base == null && valor != null) base = valor
      const codigo = mapa(detalhes, 'classificacoes')[chave]

      pontos.push({
        data: formatarData(avaliacao.data_avaliacao),
        dataCurta: '',
        dataIso: avaliacao.data_avaliacao ?? '',
        valor,
        percentil,
        classificacao: typeof codigo === 'string' ? codigo : undefined,
        variacao: valor != null && base != null ? variacaoPercentual(base, valor) : null,
      })
    }

    if (pontos.length > 0) {
      const anos = new Set(
        pontos.map((p) => new Date(p.dataIso).getFullYear()).filter((ano) => !Number.isNaN(ano)),
      )
      const mesmoAno = anos.size <= 1
      for (const ponto of pontos) {
        ponto.dataCurta =
          mesmoAno ? ponto.data.slice(0, 5) : `${ponto.data.slice(0, 5)}/${ponto.data.slice(8, 10)}`
      }
      series.push({ teste: chave, nome: def.nome, unidade: def.unidade, pontos })
    }
  }

  return series
}

export function rotuloPercentil(percentil: number | null): string {
  if (percentil == null) return 'P<5'
  return `P${percentil}`
}

export function formatarNumero(valor: number | null, casas = 1): string {
  if (valor == null) return '—'
  return valor.toLocaleString('pt-BR', { maximumFractionDigits: casas })
}

export function dominioValor(
  pontos: PontoFuncional[],
  modo: 'absoluto' | 'evolucao',
): [number, number] {
  const valores = pontos
    .map((p) => (modo === 'evolucao' ? p.variacao : p.valor))
    .filter((v): v is number => v != null)

  if (valores.length === 0) return [0, 10]

  const menor = modo === 'evolucao' ? Math.min(0, ...valores) : Math.min(...valores)
  const maior = modo === 'evolucao' ? Math.max(0, ...valores) : Math.max(...valores)
  const folga = Math.max(1, (maior - menor) * 0.2)

  return [menor - folga, maior + folga]
}