import { describe, expect, it } from 'vitest'
import type { AvaliacaoHistorico } from '@/types/avaliacao'
import {
  calcularIdade,
  compararAvaliacoes,
  iniciais,
  montarIndicadores,
  serieDaMetrica,
  tempoAcompanhamento,
  valorMetrica,
} from '../components/laudo-utils'

function avaliacao(parcial: Partial<AvaliacaoHistorico>): AvaliacaoHistorico {
  return {
    id: 'a1',
    cliente_id: 'c1',
    protocolo_id: 'p1',
    protocolo_nome: 'Protocolo',
    tipo: 'IMC',
    data_avaliacao: '2026-08-11T15:00:00Z',
    valor: 23.765,
    classificacao: 'NORMAL',
    classificacao_legivel: 'Normal',
    detalhes: {},
    ...parcial,
  }
}

describe('valorMetrica', () => {
  it('extrai VO2 apenas de avaliação VO2_MAX', () => {
    const a = avaliacao({ tipo: 'VO2_MAX', valor: 24 })
    expect(valorMetrica(a, 'vo2')).toBe(24)
    expect(valorMetrica(avaliacao({}), 'vo2')).toBeNull()
  })

  it('extrai IMC apenas de avaliação IMC', () => {
    expect(valorMetrica(avaliacao({}), 'imc')).toBe(23.765)
    expect(valorMetrica(avaliacao({ tipo: 'VO2_MAX', valor: 24 }), 'imc')).toBeNull()
  })

  it('extrai peso de bioimpedância via pesoKg', () => {
    const a = avaliacao({ tipo: 'BIOIMPEDANCIA', detalhes: { pesoKg: 77.5 } })
    expect(valorMetrica(a, 'peso')).toBe(77.5)
  })

  it('extrai peso de IMC via massaCorporalGramas', () => {
    const a = avaliacao({ detalhes: { massaCorporalGramas: 77000 } })
    expect(valorMetrica(a, 'peso')).toBe(77)
  })

  it('extrai gordura e massa magra de bioimpedância', () => {
    const a = avaliacao({ tipo: 'BIOIMPEDANCIA', detalhes: { percentualGordura: 18.4, massaMagraKg: 62.1 } })
    expect(valorMetrica(a, 'gordura')).toBe(18.4)
    expect(valorMetrica(a, 'massaMagra')).toBe(62.1)
  })
})

describe('serieDaMetrica', () => {
  it('ordena pontos por data e ignora avaliações sem a métrica', () => {
    const antiga = avaliacao({ id: 'old', tipo: 'VO2_MAX', valor: 24, data_avaliacao: '2026-08-11T15:00:00Z' })
    const recente = avaliacao({ id: 'new', tipo: 'VO2_MAX', valor: 26, data_avaliacao: '2026-08-16T15:00:00Z' })
    const imc = avaliacao({ id: 'imc' })
    const serie = serieDaMetrica([imc, recente, antiga], 'vo2')
    expect(serie.pontos.map((p) => p.id)).toEqual(['old', 'new'])
  })
})

describe('montarIndicadores', () => {
  it('calcula valor atual, variação absoluta e percentual vs primeira', () => {
    const antiga = avaliacao({ id: 'old', detalhes: { massaCorporalGramas: 80000 }, data_avaliacao: '2026-08-01T15:00:00Z' })
    const recente = avaliacao({ id: 'new', detalhes: { massaCorporalGramas: 77000 }, data_avaliacao: '2026-08-16T15:00:00Z' })
    const indicadores = montarIndicadores([recente, antiga])
    const peso = indicadores.find((i) => i.metrica === 'peso')
    expect(peso).toBeDefined()
    expect(peso!.atual).toBe(77)
    expect(peso!.primeira).toBe(80)
    expect(peso!.variacaoAbs).toBe(-3)
    expect(peso!.variacaoPct).toBeCloseTo(-3.75)
    expect(peso!.melhorQuandoSubir).toBe(false)
  })

  it('retorna variacaoPct null quando a primeira avaliação é zero', () => {
    const antiga = avaliacao({ id: 'old', tipo: 'VO2_MAX', valor: 0, data_avaliacao: '2026-08-01T15:00:00Z' })
    const recente = avaliacao({ id: 'new', tipo: 'VO2_MAX', valor: 24, data_avaliacao: '2026-08-16T15:00:00Z' })
    const indicadores = montarIndicadores([antiga, recente])
    const vo2 = indicadores.find((i) => i.metrica === 'vo2')
    expect(vo2!.variacaoAbs).toBe(24)
    expect(vo2!.variacaoPct).toBeNull()
  })

  it('ignora métricas com menos de duas avaliações', () => {
    const unica = avaliacao({ id: 'new', detalhes: { massaCorporalGramas: 77000 } })
    const indicadores = montarIndicadores([unica])
    expect(indicadores.length).toBe(0)
  })
})

describe('compararAvaliacoes', () => {
  it('inclui apenas métricas presentes em ao menos uma avaliação', () => {
    const a = avaliacao({ id: 'a', tipo: 'VO2_MAX', valor: 24, detalhes: { massaCorporalGramas: 80000 } })
    const b = avaliacao({ id: 'b', tipo: 'VO2_MAX', valor: 26, detalhes: { massaCorporalGramas: 77000 } })
    const linhas = compararAvaliacoes(a, b)
    const vo2 = linhas.find((l) => l.metrica === 'vo2')
    const peso = linhas.find((l) => l.metrica === 'peso')
    expect(vo2).toBeDefined()
    expect(vo2!.valorA).toBe(24)
    expect(vo2!.valorB).toBe(26)
    expect(vo2!.variacaoPct).toBeCloseTo(8.33)
    expect(peso).toBeDefined()
    expect(linhas.find((l) => l.metrica === 'imc')).toBeUndefined()
  })
})

describe('helpers', () => {
  it('calcula idade por anos completos', () => {
    const nascimento = new Date()
    nascimento.setFullYear(nascimento.getFullYear() - 22)
    nascimento.setMonth(nascimento.getMonth() - 3)
    expect(calcularIdade(nascimento.toISOString())).toBe(22)
    expect(calcularIdade(undefined)).toBeNull()
  })

  it('gera iniciais das duas primeiras palavras', () => {
    expect(iniciais('Gabriel Henrique Oliveira')).toBe('GH')
    expect(iniciais('Maria')).toBe('M')
    expect(iniciais('')).toBe('?')
  })

  it('formata tempo de acompanhamento em dias, meses e anos', () => {
    const base = avaliacao({ data_avaliacao: '2026-08-11T15:00:00Z' })
    const cincoDias = avaliacao({ data_avaliacao: '2026-08-16T15:00:00Z' })
    expect(tempoAcompanhamento([base, cincoDias])).toBe('5 dias')
    const mesmoDia = avaliacao({ data_avaliacao: '2026-08-11T16:00:00Z' })
    expect(tempoAcompanhamento([base, mesmoDia])).toBe('0 dias')
    const doisMeses = avaliacao({ data_avaliacao: '2026-10-20T15:00:00Z' })
    expect(tempoAcompanhamento([base, doisMeses])).toBe('2 meses')
    const umAno = avaliacao({ data_avaliacao: '2027-09-01T15:00:00Z' })
    expect(tempoAcompanhamento([base, umAno])).toBe('1 ano')
  })
})