import { describe, expect, it } from 'vitest'
import type { AvaliacaoHistorico, NivelReferencia } from '@/types/avaliacao'
import {
  detalhesLegiveis,
  formatarDataHora,
  formatarFaixa,
  rotuloReferencia,
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