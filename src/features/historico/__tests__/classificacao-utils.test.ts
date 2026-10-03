import { describe, expect, it } from 'vitest'
import type { AvaliacaoHistorico, NivelReferencia } from '@/types/avaliacao'
import {
  corClassificacao,
  detalhesLegiveis,
  formatarDataHora,
  formatarFaixa,
  formatarValor,
  linhasFuncional,
  rotuloClassificacao,
  rotuloReferencia,
  rotuloTipo,
} from '../components/classificacao-utils'

describe('formatarFaixa', () => {
  it('formata faixa aberta inferior com limite exclusivo', () => {
    const nivel: NivelReferencia = { classificacao: 'MUITO_RUIM', max: 35, tipo_max: 'EXCLUSIVO' }
    expect(formatarFaixa(nivel)).toBe('menos que 35')
  })

  it('formata faixa fechada', () => {
    const nivel: NivelReferencia = { classificacao: 'RUIM', min: 35, max: 44, tipo_max: 'EXCLUSIVO' }
    expect(formatarFaixa(nivel)).toBe('35 – 44')
  })

  it('formata faixa aberta superior', () => {
    const nivel: NivelReferencia = { classificacao: 'EXCELENTE', min: 55, tipo_min: 'INCLUSIVO' }
    expect(formatarFaixa(nivel)).toBe('≥ 55')
  })

  it('formata decimal IMC em pt-BR', () => {
    const nivel: NivelReferencia = { classificacao: 'NORMAL', min: 18.5, max: 25, tipo_max: 'EXCLUSIVO' }
    expect(formatarFaixa(nivel)).toBe('18,5 – 25')
  })
})

describe('formatarDataHora', () => {
  it('inclui hora e minuto', () => {
    const iso = '2026-08-16T18:54:05.157Z'
    const resultado = formatarDataHora(iso)
    expect(resultado).toMatch(/\d{2}:\d{2}/)
    expect(resultado).toContain('2026')
  })

  it('retorna em dash sem data', () => {
    expect(formatarDataHora()).toBe('—')
  })
})

describe('rotuloReferencia', () => {
  it('combina sexo e faixa etária', () => {
    expect(rotuloReferencia({ sexo: 'MASCULINO', idade_min: 20, idade_max: 29 })).toBe('Homem · 20–29 anos')
  })

  it('retorna vazio sem sexo e sem faixa (tabela universal)', () => {
    expect(rotuloReferencia({})).toBe('')
  })
})

describe('detalhesLegiveis', () => {
  it('omite observações cruas do wizard', () => {
    const avaliacao: AvaliacaoHistorico = {
      id: 'a1',
      cliente_id: 'c1',
      protocolo_id: 'p1',
      tipo: 'VO2_MAX',
      valor: 24,
      detalhes: { observacoes: 'Wizard: 1 estágios, 00:05 de duração. FC: 0 registros.' },
    }
    const itens = detalhesLegiveis(avaliacao)
    expect(itens.find((i) => i.label === 'Observações')).toBeUndefined()
  })

  it('mantém observações escritas pelo avaliador', () => {
    const avaliacao: AvaliacaoHistorico = {
      id: 'a1',
      cliente_id: 'c1',
      protocolo_id: 'p1',
      tipo: 'VO2_MAX',
      valor: 24,
      detalhes: { observacoes: 'Aluno evoluiu bem no teste' },
    }
    const itens = detalhesLegiveis(avaliacao)
    expect(itens.find((i) => i.label === 'Observações')?.valor).toBe('Aluno evoluiu bem no teste')
  })
})

describe('corClassificacao percentil', () => {
  it('mapeia PERCENTIL_ para faixas de cor', () => {
    expect(corClassificacao('PERCENTIL_3').texto).toBe('text-red-500 dark:text-red-400')
    expect(corClassificacao('PERCENTIL_15').texto).toBe('text-amber-600 dark:text-amber-400')
    expect(corClassificacao('PERCENTIL_40').texto).toBe('text-yellow-600 dark:text-yellow-400')
    expect(corClassificacao('PERCENTIL_55').texto).toBe('text-primary')
    expect(corClassificacao('PERCENTIL_80').texto).toBe('text-emerald-600 dark:text-emerald-400')
    expect(corClassificacao('PERCENTIL_95').texto).toBe('text-sky-500 dark:text-sky-400')
  })

  it('trata MENOR_QUE_P5 como muito ruim', () => {
    expect(corClassificacao('MENOR_QUE_P5').texto).toBe('text-red-500 dark:text-red-400')
  })

  it('mantém cores legadas e padrão desconhecido', () => {
    expect(corClassificacao('NORMAL').texto).toBe('text-primary')
    expect(corClassificacao('QUALQUER_COISA').texto).toBe('text-muted-foreground')
    expect(corClassificacao().texto).toBe('text-muted-foreground')
  })

  it('mapeia as faixas novas BAIXO e ELEVADO', () => {
    expect(corClassificacao('BAIXO').texto).toBe('text-amber-600 dark:text-amber-400')
    expect(corClassificacao('ELEVADO').texto).toBe('text-emerald-600 dark:text-emerald-400')
  })

  it('interpreta legenda legada "Percentil N"', () => {
    expect(corClassificacao('Percentil 40').texto).toBe('text-yellow-600 dark:text-yellow-400')
    expect(corClassificacao('Percentil 80').texto).toBe('text-emerald-600 dark:text-emerald-400')
    expect(corClassificacao('Percentil 90').texto).toBe('text-sky-500 dark:text-sky-400')
  })
})

describe('rotuloClassificacao', () => {
  it('humaniza faixas e códigos legados', () => {
    expect(rotuloClassificacao('BAIXO')).toBe('Baixo')
    expect(rotuloClassificacao('NORMAL')).toBe('Normal')
    expect(rotuloClassificacao('ELEVADO')).toBe('Elevado')
    expect(rotuloClassificacao('PERCENTIL_45')).toBe('Percentil 45')
    expect(rotuloClassificacao('Percentil 45')).toBe('Percentil 45')
    expect(rotuloClassificacao('BOM')).toBe('Bom')
  })

  it('retorna dash sem código', () => {
    expect(rotuloClassificacao(undefined)).toBe('—')
    expect(rotuloClassificacao('')).toBe('—')
  })
})

describe('rotuloTipo e formatarValor funcional', () => {
  it('rotula FUNCIONAL como Funcional', () => {
    expect(rotuloTipo('FUNCIONAL')).toBe('Funcional')
  })

  it('arredonda valor funcional para inteiro', () => {
    expect(formatarValor(50.6, 'FUNCIONAL')).toBe('51')
    expect(formatarValor(45, 'FUNCIONAL')).toBe('45')
  })
})

describe('linhasFuncional', () => {
  const avaliacao: AvaliacaoHistorico = {
    id: 'f1',
    cliente_id: 'c1',
    protocolo_id: 'protocolo_avaliacao_funcional_idoso',
    tipo: 'FUNCIONAL',
    valor: 49.5,
    detalhes: {
      percentis: {
        SENTAR_LEVANTAR_30S: 55,
        FLEXAO_COTOVELO_30S: 45,
        MARCHA_ESTACIONARIA_2MIN: 60,
        SENTAR_ALCANCAR_PES: 40,
        ALCANCAR_COSTAS: 50,
        LEVANTAR_CAMINHAR_2M5: null,
      },
      classificacoes: {
        SENTAR_LEVANTAR_30S: 'ELEVADO',
        FLEXAO_COTOVELO_30S: 'NORMAL',
        MARCHA_ESTACIONARIA_2MIN: 'ELEVADO',
        SENTAR_ALCANCAR_PES: 'NORMAL',
        ALCANCAR_COSTAS: 'NORMAL',
        LEVANTAR_CAMINHAR_2M5: 'BAIXO',
      },
      sentarLevantar30s: 14,
      marchaEstacionaria2Min: 96,
      sentarAlcancarPes: 32.5,
      observacoes: 'Aluno participou de toda a bateria',
    },
  }

  it('monta as 6 linhas na ordem da bateria', () => {
    expect(linhasFuncional(avaliacao)).toHaveLength(6)
    expect(linhasFuncional(avaliacao)[0].nome).toBe('Sentar e levantar (30s)')
  })

  it('formata valor bruto, percentil e faixa por teste', () => {
    const linhas = linhasFuncional(avaliacao)
    const sentar = linhas.find((l) => l.nome === 'Sentar e levantar (30s)')
    expect(sentar?.valor).toBe('14 repetições')
    expect(sentar?.percentil).toBe('P55')
    expect(sentar?.classificacao).toBe('Elevado')
    expect(linhas.find((l) => l.nome === 'Marcha estacionária (2 min)')?.valor).toBe('96 passos')
    expect(linhas.find((l) => l.nome === 'Sentar e alcançar os pés')?.valor).toBe('32,5 cm')
  })

  it('usa P<5 quando o percentil vem nulo (abaixo do P5)', () => {
    const linha = linhasFuncional(avaliacao).find((l) => l.nome === 'Levantar e caminhar (2,5 m)')
    expect(linha?.percentil).toBe('P<5')
    expect(linha?.classificacao).toBe('Baixo')
    expect(linha?.valor).toBeNull()
  })

  it('omite linha sem valor, sem percentil e sem classificação', () => {
    const semDados: AvaliacaoHistorico = { ...avaliacao, detalhes: {} }
    expect(linhasFuncional(semDados)).toHaveLength(0)
  })

  it('mantém observações do avaliador em detalhesLegiveis', () => {
    const itens = detalhesLegiveis(avaliacao)
    expect(itens.find((i) => i.label === 'Observações')?.valor).toBe('Aluno participou de toda a bateria')
  })
})
