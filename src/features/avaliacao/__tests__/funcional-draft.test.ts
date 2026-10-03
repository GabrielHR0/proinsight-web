import { describe, it, expect, beforeEach } from 'vitest'
import {
  FUNCIONAL_DRAFT_KEY,
  clearDraft,
  draftCompativel,
  formatarQuando,
  loadDraft,
  saveDraft,
  type FuncionalDraft,
} from '@/features/avaliacao/funcional-draft'

function draftBase(sobrescrever: Partial<FuncionalDraft> = {}): Omit<FuncionalDraft, 'v' | 'savedAt'> {
  return {
    clienteId: 'cliente-1',
    protocoloId: 'protocolo_avaliacao_funcional_idoso',
    step: 1,
    dados: { sexo: 'FEMININO', idade: '72' },
    valores: { SENTAR_LEVANTAR_30S: '12' },
    observacoes: 'aluno bem hidratado',
    ...sobrescrever,
  }
}

describe('funcional-draft', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('faz roundtrip save -> load', () => {
    saveDraft(draftBase())

    const carregado = loadDraft()

    expect(carregado).not.toBeNull()
    expect(carregado?.v).toBe(1)
    expect(carregado?.clienteId).toBe('cliente-1')
    expect(carregado?.dados.sexo).toBe('FEMININO')
    expect(carregado?.valores.SENTAR_LEVANTAR_30S).toBe('12')
    expect(carregado?.step).toBe(1)
    expect(Number.isFinite(Date.parse(carregado!.savedAt))).toBe(true)
  })

  it('retorna null e limpa storage para JSON corrompido', () => {
    window.localStorage.setItem(FUNCIONAL_DRAFT_KEY, '{nao é json')

    expect(loadDraft()).toBeNull()
    expect(window.localStorage.getItem(FUNCIONAL_DRAFT_KEY)).toBeNull()
  })

  it('retorna null para payload com versão ou step inválidos', () => {
    window.localStorage.setItem(
      FUNCIONAL_DRAFT_KEY,
      JSON.stringify({ ...draftBase(), v: 2, savedAt: new Date().toISOString() }),
    )
    expect(loadDraft()).toBeNull()

    window.localStorage.setItem(
      FUNCIONAL_DRAFT_KEY,
      JSON.stringify({ ...draftBase(), step: 2, v: 1, savedAt: new Date().toISOString() }),
    )
    expect(loadDraft()).toBeNull()
  })

  it('clearDraft remove o rascunho', () => {
    saveDraft(draftBase())
    clearDraft()

    expect(loadDraft()).toBeNull()
  })

  it('draftCompativel compara cliente e protocolo', () => {
    saveDraft(draftBase())
    const salvo = loadDraft()!

    expect(draftCompativel(salvo, 'cliente-1', 'protocolo_avaliacao_funcional_idoso')).toBe(true)
    expect(draftCompativel(salvo, 'cliente-2', 'protocolo_avaliacao_funcional_idoso')).toBe(false)
    expect(draftCompativel(salvo, 'cliente-1', 'protocolo_cooper')).toBe(false)
  })

  it('formatarQuando devolve texto relativo em português', () => {
    const texto = formatarQuando(new Date().toISOString())

    expect(texto).toBeTruthy()
    expect(texto).toMatch(/agora|segundo|minuto|hora|dia/i)
  })
})
