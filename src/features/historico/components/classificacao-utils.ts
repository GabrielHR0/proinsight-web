import type { AvaliacaoHistorico, NivelReferencia } from '@/types/avaliacao'

interface CoresClassificacao {
  barra: string
  texto: string
  ponto: string
  hex: string
}

const CORES: Record<string, CoresClassificacao> = {
  MUITO_RUIM: { barra: 'border-l-red-500', texto: 'text-red-500 dark:text-red-400', ponto: 'bg-red-500', hex: '#ef4444' },
  RUIM: { barra: 'border-l-amber-500', texto: 'text-amber-600 dark:text-amber-400', ponto: 'bg-amber-500', hex: '#f59e0b' },
  MEDIO: { barra: 'border-l-yellow-500', texto: 'text-yellow-600 dark:text-yellow-400', ponto: 'bg-yellow-500', hex: '#eab308' },
  'MÉDIO': { barra: 'border-l-yellow-500', texto: 'text-yellow-600 dark:text-yellow-400', ponto: 'bg-yellow-500', hex: '#eab308' },
  BOM: { barra: 'border-l-primary', texto: 'text-primary', ponto: 'bg-primary', hex: 'var(--color-primary)' },
  MUITO_BOM: { barra: 'border-l-emerald-500', texto: 'text-emerald-600 dark:text-emerald-400', ponto: 'bg-emerald-500', hex: '#10b981' },
  EXCELENTE: { barra: 'border-l-sky-500', texto: 'text-sky-500 dark:text-sky-400', ponto: 'bg-sky-500', hex: '#0ea5e9' },
  ABAIXO_DO_PESO: { barra: 'border-l-sky-500', texto: 'text-sky-500 dark:text-sky-400', ponto: 'bg-sky-500', hex: '#0ea5e9' },
  NORMAL: { barra: 'border-l-primary', texto: 'text-primary', ponto: 'bg-primary', hex: 'var(--color-primary)' },
  BAIXO: { barra: 'border-l-amber-400', texto: 'text-amber-600 dark:text-amber-400', ponto: 'bg-amber-500', hex: '#f59e0b' },
  ELEVADO: { barra: 'border-l-emerald-500', texto: 'text-emerald-600 dark:text-emerald-400', ponto: 'bg-emerald-500', hex: '#10b981' },
  SOBREPESO: { barra: 'border-l-amber-400', texto: 'text-amber-500 dark:text-amber-400', ponto: 'bg-amber-400', hex: '#fbbf24' },
  OBESIDADE_I: { barra: 'border-l-orange-500', texto: 'text-orange-500 dark:text-orange-400', ponto: 'bg-orange-500', hex: '#f97316' },
  OBESIDADE_II: { barra: 'border-l-red-500', texto: 'text-red-500 dark:text-red-400', ponto: 'bg-red-500', hex: '#ef4444' },
  OBESIDADE_III: { barra: 'border-l-red-700', texto: 'text-red-700 dark:text-red-400', ponto: 'bg-red-700', hex: '#b91c1c' },
}

const PADRAO: CoresClassificacao = {
  barra: 'border-l-muted-foreground/40',
  texto: 'text-muted-foreground',
  ponto: 'bg-muted-foreground/40',
  hex: 'var(--color-muted-foreground)',
}

function corPercentil(percentil: number): CoresClassificacao {
  if (percentil < 5) return CORES.MUITO_RUIM
  if (percentil < 25) return CORES.RUIM
  if (percentil < 50) return CORES.MEDIO
  if (percentil < 75) return CORES.BOM
  if (percentil < 90) return CORES.MUITO_BOM
  return CORES.EXCELENTE
}

export function corClassificacao(codigo?: string): CoresClassificacao {
  if (!codigo) return PADRAO
  if (codigo === 'MENOR_QUE_P5' || codigo === 'ABAIXO_PERCENTIL_5') return CORES.MUITO_RUIM
  const percentil = /^PERCENTIL_(\d+)$/.exec(codigo)
  if (percentil) return corPercentil(Number(percentil[1]))
  const legado = /^Percentil (\d+)$/.exec(codigo)
  if (legado) return corPercentil(Number(legado[1]))
  return CORES[codigo] ?? PADRAO
}

const ROTULOS_CLASSIFICACAO: Record<string, string> = {
  BAIXO: 'Baixo',
  NORMAL: 'Normal',
  ELEVADO: 'Elevado',
  MUITO_RUIM: 'Muito ruim',
  RUIM: 'Ruim',
  MEDIO: 'Médio',
  'MÉDIO': 'Médio',
  BOM: 'Bom',
  MUITO_BOM: 'Muito bom',
  EXCELENTE: 'Excelente',
  MENOR_QUE_P5: 'Abaixo do P5',
  ABAIXO_PERCENTIL_5: 'Abaixo do P5',
}

export function rotuloClassificacao(codigo: unknown): string {
  if (typeof codigo !== 'string' || !codigo) return '—'
  const legado = ROTULOS_CLASSIFICACAO[codigo]
  if (legado) return legado
  if (/^Percentil \d+$/.test(codigo)) return codigo
  const tecnico = /^PERCENTIL_(\d+)$/.exec(codigo)
  if (tecnico) return `Percentil ${tecnico[1]}`
  return codigo
}

export function formatarValor(valor?: number, tipo?: string): string {
  if (valor == null) return '—'
  if (tipo === 'IMC') {
    return valor.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
  }
  if (tipo === 'VO2_MAX') return String(Math.round(valor))
  if (tipo === 'FUNCIONAL') return String(Math.round(valor))
  return String(valor)
}

export function unidadeTipo(tipo?: string): string {
  if (tipo === 'VO2_MAX') return 'mL/kg/min'
  if (tipo === 'IMC') return 'kg/m²'
  if (tipo === 'FUNCIONAL') return 'percentil'
  return ''
}

export function rotuloTipo(tipo?: string): string {
  if (tipo === 'VO2_MAX') return 'VO2 Máx'
  if (tipo === 'IMC') return 'IMC'
  if (tipo === 'BIOIMPEDANCIA') return 'Bioimpedância'
  if (tipo === 'FUNCIONAL') return 'Funcional'
  return tipo ?? 'Avaliação'
}

export function formatarData(iso?: string): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function formatarDataHora(iso?: string): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function numeroFaixa(valor?: number): string {
  if (valor == null) return ''
  return valor.toLocaleString('pt-BR', { maximumFractionDigits: 1 })
}

export function formatarFaixa(nivel: NivelReferencia): string {
  const { min, max, tipo_min, tipo_max } = nivel
  if (min == null && max == null) return '—'
  if (min == null) {
    const aberto = tipo_max === 'EXCLUSIVO' ? 'menos que' : 'até'
    return `${aberto} ${numeroFaixa(max)}`
  }
  if (max == null) {
    return `${tipo_min === 'EXCLUSIVO' ? '>' : '≥'} ${numeroFaixa(min)}`
  }
  return `${numeroFaixa(min)} – ${numeroFaixa(max)}`
}

export function rotuloSexo(sexo?: string): string {
  if (sexo === 'MASCULINO') return 'Homem'
  if (sexo === 'FEMININO') return 'Mulher'
  return ''
}

export function rotuloReferencia(referencia: { sexo?: string; idade_min?: number; idade_max?: number }): string {
  const sexo = rotuloSexo(referencia.sexo)
  const faixa =
    referencia.idade_min != null && referencia.idade_max != null
      ? `${referencia.idade_min}–${referencia.idade_max} anos`
      : ''
  if (sexo && faixa) return `${sexo} · ${faixa}`
  return sexo || faixa
}

export function valorGrafico(avaliacao: AvaliacaoHistorico): number | undefined {
  if (avaliacao.tipo === 'BIOIMPEDANCIA' && typeof avaliacao.detalhes.percentualGordura === 'number') {
    return avaliacao.detalhes.percentualGordura
  }
  return avaliacao.valor
}

export const TESTES_FUNCIONAIS: Record<string, { nome: string; campo: string; unidade: string }> = {
  SENTAR_LEVANTAR_30S: { nome: 'Sentar e levantar (30s)', campo: 'sentarLevantar30s', unidade: 'repetições' },
  FLEXAO_COTOVELO_30S: { nome: 'Flexão de cotovelo (30s)', campo: 'flexaoCotovelo30s', unidade: 'repetições' },
  MARCHA_ESTACIONARIA_2MIN: { nome: 'Marcha estacionária (2 min)', campo: 'marchaEstacionaria2Min', unidade: 'passos' },
  SENTAR_ALCANCAR_PES: { nome: 'Sentar e alcançar os pés', campo: 'sentarAlcancarPes', unidade: 'cm' },
  ALCANCAR_COSTAS: { nome: 'Alcançar as costas', campo: 'alcancarCostas', unidade: 'cm' },
  LEVANTAR_CAMINHAR_2M5: { nome: 'Levantar e caminhar (2,5 m)', campo: 'levantarCaminhar25m', unidade: 'segundos' },
}

function formatarTesteFuncional(valor: unknown): string | null {
  return typeof valor === 'number'
    ? valor.toLocaleString('pt-BR', { maximumFractionDigits: 1 })
    : null
}

export interface LinhaFuncional {
  nome: string
  valor: string | null
  percentil: string
  classificacao: string
  cor: string
}

export function linhasFuncional(avaliacao: AvaliacaoHistorico): LinhaFuncional[] {
  const d = avaliacao.detalhes
  const percentis =
    d.percentis && typeof d.percentis === 'object'
      ? (d.percentis as Record<string, unknown>)
      : null
  const classificacoes =
    d.classificacoes && typeof d.classificacoes === 'object'
      ? (d.classificacoes as Record<string, unknown>)
      : null

  const linhas: LinhaFuncional[] = []
  for (const [chave, def] of Object.entries(TESTES_FUNCIONAIS)) {
    const bruto = formatarTesteFuncional(d[def.campo])
    const temPercentil = percentis != null && chave in percentis
    const pct = percentis?.[chave]
    const codigo = classificacoes?.[chave]
    if (bruto == null && !temPercentil && typeof codigo !== 'string') continue
    linhas.push({
      nome: def.nome,
      valor: bruto != null ? `${bruto} ${def.unidade}` : null,
      percentil: temPercentil ? (typeof pct === 'number' ? `P${pct}` : 'P<5') : '—',
      classificacao: rotuloClassificacao(codigo),
      cor: corClassificacao(typeof codigo === 'string' ? codigo : undefined).texto,
    })
  }
  return linhas
}

export function detalhesLegiveis(avaliacao: AvaliacaoHistorico): { label: string; valor: string }[] {
  const d = avaliacao.detalhes
  const itens: { label: string; valor: string }[] = []

  if (avaliacao.tipo === 'VO2_MAX') {
    if (typeof d.velocidadeKmh === 'number') {
      itens.push({ label: 'Velocidade', valor: `${d.velocidadeKmh.toLocaleString('pt-BR')} km/h` })
    }
    if (typeof d.inclinacaoPercent === 'number') {
      itens.push({ label: 'Inclinação', valor: `${d.inclinacaoPercent.toLocaleString('pt-BR')} %` })
    }
    if (typeof d.distanciaMetros === 'number') {
      itens.push({ label: 'Distância', valor: `${d.distanciaMetros} m` })
    }
    if (typeof d.tempoSegundos === 'number') {
      itens.push({ label: 'Tempo', valor: `${d.tempoSegundos} s` })
    }
    if (typeof d.frequenciaCardiacaBpm === 'number') {
      itens.push({ label: 'Freq. cardíaca', valor: `${d.frequenciaCardiacaBpm} bpm` })
    }
  } else if (avaliacao.tipo === 'IMC') {
    if (typeof d.massaCorporalGramas === 'number') {
      itens.push({ label: 'Peso', valor: `${(d.massaCorporalGramas / 1000).toLocaleString('pt-BR')} kg` })
    }
    if (typeof d.alturaCm === 'number') {
      itens.push({ label: 'Altura', valor: `${d.alturaCm} cm` })
    }
  } else if (avaliacao.tipo === 'BIOIMPEDANCIA') {
    if (typeof d.percentualGordura === 'number') {
      itens.push({ label: 'Gordura', valor: `${d.percentualGordura.toLocaleString('pt-BR')} %` })
    }
    if (typeof d.massaMagraKg === 'number') {
      itens.push({ label: 'Massa magra', valor: `${d.massaMagraKg.toLocaleString('pt-BR')} kg` })
    }
    if (typeof d.massaGordaKg === 'number') {
      itens.push({ label: 'Massa gorda', valor: `${d.massaGordaKg.toLocaleString('pt-BR')} kg` })
    }
    if (typeof d.aguaCorporalPercentual === 'number') {
      itens.push({ label: 'Água corporal', valor: `${d.aguaCorporalPercentual.toLocaleString('pt-BR')} %` })
    }
    if (typeof d.idadeMetabolica === 'number') {
      itens.push({ label: 'Idade metabólica', valor: `${d.idadeMetabolica}` })
    }
  }

  if (typeof d.observacoes === 'string' && d.observacoes.trim()) {
    const observacao = d.observacoes.trim()
    const crua = /^wizard/i.test(observacao)
    if (!crua) {
      itens.push({ label: 'Observações', valor: observacao })
    }
  }

  return itens
}
