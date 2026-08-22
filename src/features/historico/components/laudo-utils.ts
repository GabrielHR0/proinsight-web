import type { AvaliacaoHistorico } from '@/types/avaliacao'

export type Metrica = 'peso' | 'imc' | 'gordura' | 'massaMagra' | 'vo2'

export interface MetricaDefinicao {
  metrica: Metrica
  rotulo: string
  unidade: string
  melhorQuandoSubir: boolean
  extrair: (avaliacao: AvaliacaoHistorico) => number | null
}

function numero(valor: unknown): number | null {
  return typeof valor === 'number' ? valor : null
}

export const METRICAS: MetricaDefinicao[] = [
  {
    metrica: 'peso',
    rotulo: 'Peso',
    unidade: 'kg',
    melhorQuandoSubir: false,
    extrair: (a) => {
      const pesoKg = numero(a.detalhes.pesoKg)
      if (pesoKg != null) return pesoKg
      const gramas = numero(a.detalhes.massaCorporalGramas)
      return gramas != null ? gramas / 1000 : null
    },
  },
  {
    metrica: 'imc',
    rotulo: 'IMC',
    unidade: 'kg/m\u00B2',
    melhorQuandoSubir: false,
    extrair: (a) => (a.tipo === 'IMC' ? a.valor ?? null : null),
  },
  {
    metrica: 'gordura',
    rotulo: 'Gordura',
    unidade: '%',
    melhorQuandoSubir: false,
    extrair: (a) => numero(a.detalhes.percentualGordura),
  },
  {
    metrica: 'massaMagra',
    rotulo: 'Massa magra',
    unidade: 'kg',
    melhorQuandoSubir: true,
    extrair: (a) => numero(a.detalhes.massaMagraKg),
  },
  {
    metrica: 'vo2',
    rotulo: 'VO\u2082 m\u00E1x',
    unidade: 'mL/kg/min',
    melhorQuandoSubir: true,
    extrair: (a) => (a.tipo === 'VO2_MAX' ? a.valor ?? null : null),
  },
]

export function valorMetrica(avaliacao: AvaliacaoHistorico, metrica: Metrica): number | null {
  const definicao = METRICAS.find((m) => m.metrica === metrica)
  return definicao ? definicao.extrair(avaliacao) : null
}

export const TABS_DISPONIVEIS: Metrica[] = ['peso', 'imc', 'gordura', 'massaMagra', 'vo2']

export function metricasDisponiveis(avaliacoes: AvaliacaoHistorico[]): Metrica[] {
  return TABS_DISPONIVEIS.filter((m) => {
    const def = METRICAS.find((d) => d.metrica === m)
    return def && avaliacoes.some((a) => def.extrair(a) != null)
  })
}

export interface SerieMetrica {
  metrica: Metrica
  pontos: AvaliacaoHistorico[]
}

export function serieDaMetrica(avaliacoes: AvaliacaoHistorico[], metrica: Metrica): SerieMetrica {
  const def = METRICAS.find((d) => d.metrica === metrica)
  if (!def) return { metrica, pontos: [] }
  const pontos = avaliacoes
    .filter((a) => def.extrair(a) != null)
    .sort((a, b) => (a.data_avaliacao ?? '').localeCompare(b.data_avaliacao ?? ''))
  return { metrica, pontos }
}

export interface Indicador {
  metrica: Metrica
  rotulo: string
  unidade: string
  atual: number
  primeira: number
  variacaoAbs: number
  variacaoPct: number | null
  melhorQuandoSubir: boolean
}

export function montarIndicadores(avaliacoes: AvaliacaoHistorico[]): Indicador[] {
  const indicadores: Indicador[] = []
  for (const m of METRICAS) {
    const serie = serieDaMetrica(avaliacoes, m.metrica)
    if (serie.pontos.length < 2) continue
    const primeira = valorMetrica(serie.pontos[0], m.metrica)
    const atual = valorMetrica(serie.pontos[serie.pontos.length - 1], m.metrica)
    if (primeira == null || atual == null) continue
    const variacaoAbs = atual - primeira
    const variacaoPct = primeira === 0 ? null : (variacaoAbs / Math.abs(primeira)) * 100
    indicadores.push({
      metrica: m.metrica,
      rotulo: m.rotulo,
      unidade: m.unidade,
      atual,
      primeira,
      variacaoAbs,
      variacaoPct,
      melhorQuandoSubir: m.melhorQuandoSubir,
    })
  }
  return indicadores
}

export interface ComparacaoLinha {
  metrica: Metrica
  rotulo: string
  unidade: string
  valorA: number | null
  valorB: number | null
  melhorQuandoSubir: boolean
  variacaoPct: number | null
}

export function compararAvaliacoes(a: AvaliacaoHistorico, b: AvaliacaoHistorico): ComparacaoLinha[] {
  const linhas: ComparacaoLinha[] = []
  for (const m of METRICAS) {
    const valorA = m.extrair(a)
    const valorB = m.extrair(b)
    if (valorA == null && valorB == null) continue
    let variacaoPct: number | null = null
    if (valorA != null && valorB != null && valorA !== 0) {
      variacaoPct = ((valorB - valorA) / Math.abs(valorA)) * 100
    }
    linhas.push({
      metrica: m.metrica,
      rotulo: m.rotulo,
      unidade: m.unidade,
      valorA,
      valorB,
      melhorQuandoSubir: m.melhorQuandoSubir,
      variacaoPct,
    })
  }
  return linhas
}

export function compararAvaliacoesPorMetrica(avaliacoes: AvaliacaoHistorico[]): ComparacaoLinha[] {
  const ordenadas = [...avaliacoes].sort((a, b) =>
    (a.data_avaliacao ?? '').localeCompare(b.data_avaliacao ?? ''),
  )
  const linhas: ComparacaoLinha[] = []
  for (const m of METRICAS) {
    const primeira = ordenadas.find((a) => m.extrair(a) != null)
    const ultima = [...ordenadas].reverse().find((a) => m.extrair(a) != null)
    if (!primeira && !ultima) continue
    const valorA = primeira ? m.extrair(primeira) : null
    const valorB = ultima ? m.extrair(ultima) : null
    if (valorA == null && valorB == null) continue
    let variacaoPct: number | null = null
    if (valorA != null && valorB != null && valorA !== 0) {
      variacaoPct = ((valorB - valorA) / Math.abs(valorA)) * 100
    }
    linhas.push({
      metrica: m.metrica,
      rotulo: m.rotulo,
      unidade: m.unidade,
      valorA,
      valorB,
      melhorQuandoSubir: m.melhorQuandoSubir,
      variacaoPct,
    })
  }
  return linhas
}

export function formatarValorLaudo(valor: number): string {
  return valor.toLocaleString('pt-BR', { maximumFractionDigits: 1 })
}

export function formatarPercentual(valor: number): string {
  return valor.toLocaleString('pt-BR', { maximumFractionDigits: 1 })
}

export function calcularIdade(dataNascimento?: string): number | null {
  if (!dataNascimento) return null
  const nascimento = new Date(dataNascimento)
  if (Number.isNaN(nascimento.getTime())) return null
  const hoje = new Date()
  let idade = hoje.getFullYear() - nascimento.getFullYear()
  const meses = hoje.getMonth() - nascimento.getMonth()
  if (meses < 0 || (meses === 0 && hoje.getDate() < nascimento.getDate())) idade -= 1
  return idade
}

export function iniciais(nome?: string): string {
  if (!nome) return '?'
  const partes = nome.trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) return '?'
  if (partes.length === 1) return partes[0].charAt(0).toUpperCase()
  return (partes[0].charAt(0) + partes[1].charAt(0)).toUpperCase()
}

export function tempoAcompanhamento(avaliacoes: AvaliacaoHistorico[]): string | null {
  const datas = avaliacoes
    .map((a) => a.data_avaliacao)
    .filter((d): d is string => !!d)
    .map((d) => new Date(d).getTime())
    .sort((a, b) => a - b)
  if (datas.length === 0) return null
  const dias = Math.max(0, Math.round((datas[datas.length - 1] - datas[0]) / 86_400_000))
  if (dias < 30) return `${dias} ${dias === 1 ? 'dia' : 'dias'}`
  if (dias < 365) {
    const meses = Math.max(1, Math.round(dias / 30.44))
    return `${meses} ${meses === 1 ? 'm\u00EAs' : 'meses'}`
  }
  const anos = Math.max(1, Math.round(dias / 365.25))
  return `${anos} ${anos === 1 ? 'ano' : 'anos'}`
}
