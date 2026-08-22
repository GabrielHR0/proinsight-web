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

export function corClassificacao(codigo?: string): CoresClassificacao {
  if (!codigo) return PADRAO
  return CORES[codigo] ?? PADRAO
}

export function formatarValor(valor?: number, tipo?: string): string {
  if (valor == null) return '—'
  if (tipo === 'IMC') {
    return valor.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
  }
  if (tipo === 'VO2_MAX') return String(Math.round(valor))
  return String(valor)
}

export function unidadeTipo(tipo?: string): string {
  if (tipo === 'VO2_MAX') return 'mL/kg/min'
  if (tipo === 'IMC') return 'kg/m²'
  return ''
}

export function rotuloTipo(tipo?: string): string {
  if (tipo === 'VO2_MAX') return 'VO2 Máx'
  if (tipo === 'IMC') return 'IMC'
  if (tipo === 'BIOIMPEDANCIA') return 'Bioimpedância'
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