import { describe, it, expect } from 'vitest'
import { parseFuncionalError } from '@/features/avaliacao/funcional-utils'

const ORDEM = [
  'SENTAR_LEVANTAR_30S',
  'FLEXAO_COTOVELO_30S',
  'MARCHA_ESTACIONARIA_2MIN',
  'SENTAR_ALCANCAR_PES',
  'ALCANCAR_COSTAS',
  'LEVANTAR_CAMINHAR_2M5',
]

function erroFuncional(status: number, detail: string, violations?: unknown[]) {
  return {
    response: {
      status,
      data: {
        type: 'proinsight://problems/validation-error',
        detail,
        ...(violations ? { violations } : {}),
      },
    },
  }
}

describe('parseFuncionalError', () => {
  it('retorna vazio quando não há resposta (erro de rede)', () => {
    const parsed = parseFuncionalError(new Error('network down'))

    expect(parsed.status).toBeNull()
    expect(parsed.resumo).toBeNull()
    expect(parsed.global).toEqual([])
    expect(parsed.porTeste).toEqual({})
    expect(parsed.voltarAoDados).toBe(false)
  })

  it('agrupa violações por chave de teste', () => {
    const parsed = parseFuncionalError(
      erroFuncional(400, 'Um ou mais testes estão inválidos ou incompletos.', [
        { field: 'testes[MARCHA_ESTACIONARIA_2MIN]', message: 'Teste obrigatório não informado: Marcha Estacionária 2min' },
        { field: 'testes[SENTAR_LEVANTAR_30S]', message: 'Valor do teste deve ser numérico' },
      ]),
      ORDEM,
    )

    expect(parsed.status).toBe(400)
    expect(parsed.resumo).toContain('inválidos')
    expect(parsed.porTeste).toEqual({
      MARCHA_ESTACIONARIA_2MIN: ['Teste obrigatório não informado: Marcha Estacionária 2min'],
      SENTAR_LEVANTAR_30S: ['Valor do teste deve ser numérico'],
    })
    expect(parsed.global).toEqual([])
    expect(parsed.voltarAoDados).toBe(false)
  })

  it('resolve índice numérico de Bean Validation para a chave do teste', () => {
    const parsed = parseFuncionalError(
      erroFuncional(400, 'Um ou mais campos estão inválidos.', [
        { field: 'testes[2].valor', message: 'valor é obrigatório' },
      ]),
      ORDEM,
    )

    expect(parsed.porTeste).toEqual({
      MARCHA_ESTACIONARIA_2MIN: ['valor é obrigatório'],
    })
  })

  it('marca voltarAoDados para violações de idade e sexo', () => {
    const parsed = parseFuncionalError(
      erroFuncional(422, 'Dados inválidos', [
        { field: 'idade', message: 'Aluno sem idade cadastrada' },
      ]),
      ORDEM,
    )

    expect(parsed.voltarAoDados).toBe(true)
    expect(parsed.global).toEqual(['Aluno sem idade cadastrada'])
    expect(parsed.porTeste).toEqual({})
  })

  it('agrega violações globais desconhecidas em global', () => {
    const parsed = parseFuncionalError(
      erroFuncional(400, 'Falha na validação', [
        { field: 'protocolo_id', message: 'protocoloId é obrigatório' },
        { field: 'testes[ALCANCAR_COSTAS]', message: 'Teste duplicado: ALCANCAR_COSTAS' },
      ]),
      ORDEM,
    )

    expect(parsed.global).toEqual(['protocoloId é obrigatório'])
    expect(parsed.porTeste).toEqual({ ALCANCAR_COSTAS: ['Teste duplicado: ALCANCAR_COSTAS'] })
  })

  it('ignora índice numérico fora do range quando ordem não informada', () => {
    const parsed = parseFuncionalError(
      erroFuncional(400, 'Falha', [
        { field: 'testes[0].valor', message: 'valor é obrigatório' },
      ]),
      [],
    )

    expect(parsed.porTeste).toEqual({})
    expect(parsed.global).toEqual(['valor é obrigatório'])
  })
})
