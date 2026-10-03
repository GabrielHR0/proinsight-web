import { describe, it, expect } from 'vitest'
import { GUIA_TESTS, TESTES_COM_CONTADOR } from '@/features/avaliacao/funcional-guide'

const TODAS_AS_CHAVES = [
  'SENTAR_LEVANTAR_30S',
  'FLEXAO_COTOVELO_30S',
  'MARCHA_ESTACIONARIA_2MIN',
  'SENTAR_ALCANCAR_PES',
  'ALCANCAR_COSTAS',
  'LEVANTAR_CAMINHAR_2M5',
]

describe('funcional-guide', () => {
  it('cobre todas as chaves de teste da bateria', () => {
    for (const chave of TODAS_AS_CHAVES) {
      expect(GUIA_TESTS[chave], `guia ausente: ${chave}`).toBeDefined()
    }
  })

  it('cada guia tem ao menos 3 passos não vazios', () => {
    for (const chave of TODAS_AS_CHAVES) {
      const guia = GUIA_TESTS[chave]
      expect(guia.passos.length).toBeGreaterThanOrEqual(3)
      for (const passo of guia.passos) {
        expect(passo.trim().length).toBeGreaterThan(0)
      }
    }
  })

  it('todo teste com contador possui guia', () => {
    for (const chave of TESTES_COM_CONTADOR) {
      expect(GUIA_TESTS[chave], `contador sem guia: ${chave}`).toBeDefined()
    }
  })

  it('contador só cobre testes de repetição/passo cronometrados', () => {
    expect(TESTES_COM_CONTADOR.has('SENTAR_ALCANCAR_PES')).toBe(false)
    expect(TESTES_COM_CONTADOR.has('ALCANCAR_COSTAS')).toBe(false)
    expect(TESTES_COM_CONTADOR.has('LEVANTAR_CAMINHAR_2M5')).toBe(false)
    expect(TESTES_COM_CONTADOR.size).toBe(3)
  })
})
