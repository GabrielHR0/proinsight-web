import { describe, expect, it } from 'vitest'
import type { AvaliacaoHistorico } from '@/types/avaliacao'
import {
  avaliacoesFuncionais,
  dominioValor,
  formatarNumero,
  rotuloPercentil,
  seriesFuncionais,
  variacaoPercentual,
} from '../components/funcional-graficos-utils'

function funcional(data: string, extras: Record<string, unknown>): AvaliacaoHistorico {
  return {
    id: `f-${data}`,
    cliente_id: 'c1',
    protocolo_id: 'protocolo_avaliacao_funcional_idoso',
    tipo: 'FUNCIONAL',
    data_avaliacao: data,
    detalhes: extras,
  }
}

const AVALIACAO_1 = funcional('2026-03-10T12:00:00Z', {
  sentarLevantar30s: 12,
  flexaoCotovelo30s: 10,
  percentis: { SENTAR_LEVANTAR_30S: 25, FLEXAO_COTOVELO_30S: 15 },
  classificacoes: { SENTAR_LEVANTAR_30S: 'NORMAL', FLEXAO_COTOVELO_30S: 'BAIXO' },
})

const AVALIACAO_2 = funcional('2026-06-10T12:00:00Z', {
  sentarLevantar30s: 15,
  flexaoCotovelo30s: 8,
  percentis: { SENTAR_LEVANTAR_30S: 55, FLEXAO_COTOVELO_30S: 10 },
  classificacoes: { SENTAR_LEVANTAR_30S: 'NORMAL', FLEXAO_COTOVELO_30S: 'BAIXO' },
})

const AVALIACAO_3 = funcional('2026-09-10T12:00:00Z', {
  sentarLevantar30s: 15,
  percentis: { SENTAR_LEVANTAR_30S: 90 },
  classificacoes: { SENTAR_LEVANTAR_30S: 'ELEVADO' },
})

describe('variacaoPercentual', () => {
  it('calcula variação percentual contra a base', () => {
    expect(variacaoPercentual(12, 15)).toBe(25)
    expect(variacaoPercentual(10, 8)).toBe(-20)
  })

  it('devolve null quando a base é zero', () => {
    expect(variacaoPercentual(0, 5)).toBeNull()
  })
})

describe('avaliacoesFuncionais', () => {
  it('mantém só funcionais em ordem cronológica', () => {
    const lista: AvaliacaoHistorico[] = [
      { ...AVALIACAO_3, tipo: 'FUNCIONAL' },
      { id: 'i1', cliente_id: 'c1', protocolo_id: 'p', tipo: 'IMC', data_avaliacao: '2026-05-01T10:00:00Z', detalhes: {} },
      { ...AVALIACAO_1, tipo: 'FUNCIONAL' },
      { ...AVALIACAO_2, tipo: 'FUNCIONAL' },
    ]
    const filtradas = avaliacoesFuncionais(lista)
    expect(filtradas).toHaveLength(3)
    expect(filtradas.map((a) => a.data_avaliacao)).toEqual([
      '2026-03-10T12:00:00Z',
      '2026-06-10T12:00:00Z',
      '2026-09-10T12:00:00Z',
    ])
  })
})

describe('seriesFuncionais', () => {
  const series = seriesFuncionais([AVALIACAO_3, AVALIACAO_1, AVALIACAO_2])

  it('monta uma série por teste com dados, na ordem da bateria', () => {
    expect(series.map((s) => s.teste)).toEqual([
      'SENTAR_LEVANTAR_30S',
      'FLEXAO_COTOVELO_30S',
    ])
  })

  it('usa a unidade correta de cada teste', () => {
    const completas = seriesFuncionais([
      funcional('2026-03-10T12:00:00Z', {
        sentarLevantar30s: 12,
        flexaoCotovelo30s: 10,
        marchaEstacionaria2Min: 90,
        sentarAlcancarPes: 15,
        alcancarCostas: 10,
        levantarCaminhar25m: 8,
        percentis: {
          SENTAR_LEVANTAR_30S: 25,
          FLEXAO_COTOVELO_30S: 15,
          MARCHA_ESTACIONARIA_2MIN: 30,
          SENTAR_ALCANCAR_PES: 35,
          ALCANCAR_COSTAS: 40,
          LEVANTAR_CAMINHAR_2M5: 45,
        },
      }),
    ])
    expect(completas.map((s) => s.unidade)).toEqual([
      'repetições',
      'repetições',
      'passos',
      'cm',
      'cm',
      'segundos',
    ])
  })

  it('omite testes sem nenhum dado', () => {
    const parcial = seriesFuncionais([
      funcional('2026-03-10T12:00:00Z', {
        sentarLevantar30s: 12,
        percentis: { SENTAR_LEVANTAR_30S: 25 },
      }),
    ])
    expect(parcial.map((s) => s.teste)).toEqual(['SENTAR_LEVANTAR_30S'])
  })

  it('extrai valor, percentil e classificação de cada avaliação', () => {
    const pontos = series[0].pontos
    expect(pontos).toHaveLength(3)
    expect(pontos[0].valor).toBe(12)
    expect(pontos[0].percentil).toBe(25)
    expect(pontos[0].classificacao).toBe('NORMAL')
    expect(pontos[2].percentil).toBe(90)
    expect(pontos[2].classificacao).toBe('ELEVADO')
  })

  it('encurta a data do eixo quando todas as avaliações são do mesmo ano', () => {
    const mesmoAno = seriesFuncionais([
      AVALIACAO_1,
      AVALIACAO_2,
      AVALIACAO_3,
    ])[0].pontos
    expect(mesmoAno.map((p) => p.dataCurta)).toEqual(['10/03', '10/06', '10/09'])
  })

  it('mantém o ano no eixo quando as avaliações cruzam anos', () => {
    const variosAnos = seriesFuncionais([
      AVALIACAO_1,
      funcional('2027-02-10T12:00:00Z', {
        sentarLevantar30s: 16,
        percentis: { SENTAR_LEVANTAR_30S: 60 },
      }),
    ])[0].pontos
    expect(variosAnos.map((p) => p.dataCurta)).toEqual(['10/03/26', '10/02/27'])
  })

  it('calcula variação contra a primeira avaliação do teste', () => {
    const pontos = series[0].pontos
    expect(pontos[0].variacao).toBe(0)
    expect(pontos[1].variacao).toBe(25)
    expect(pontos[2].variacao).toBe(25)
  })

  it('usa a primeira avaliação com valor como base quando há lacunas', () => {
    const comLacuna = seriesFuncionais([
      funcional('2026-01-10T12:00:00Z', { percentis: { SENTAR_LEVANTAR_30S: 30 } }),
      funcional('2026-04-10T12:00:00Z', {
        sentarLevantar30s: 10,
        percentis: { SENTAR_LEVANTAR_30S: 45 },
      }),
      funcional('2026-07-10T12:00:00Z', {
        sentarLevantar30s: 12,
        percentis: { SENTAR_LEVANTAR_30S: 60 },
      }),
    ])[0].pontos

    expect(comLacuna[0].valor).toBeNull()
    expect(comLacuna[0].variacao).toBeNull()
    expect(comLacuna[1].variacao).toBe(0)
    expect(comLacuna[2].variacao).toBe(20)
  })
})

describe('dominioValor', () => {
  const pontos = seriesFuncionais([AVALIACAO_1, AVALIACAO_2, AVALIACAO_3])[0].pontos

  it('inclui folga em torno dos valores no modo absoluto', () => {
    const [min, max] = dominioValor(pontos, 'absoluto')
    expect(min).toBeLessThan(12)
    expect(max).toBeGreaterThan(15)
  })

  it('ancora em zero no modo evolução', () => {
    const [min, max] = dominioValor(pontos, 'evolucao')
    expect(min).toBeLessThan(0)
    expect(max).toBeGreaterThan(25)
  })
})

describe('formatarNumero e rotuloPercentil', () => {
  it('formata números em pt-BR', () => {
    expect(formatarNumero(32.5)).toBe('32,5')
    expect(formatarNumero(8, 0)).toBe('8')
    expect(formatarNumero(null)).toBe('—')
  })

  it('rotula percentil e abaixo do P5', () => {
    expect(rotuloPercentil(45)).toBe('P45')
    expect(rotuloPercentil(null)).toBe('P<5')
  })
})