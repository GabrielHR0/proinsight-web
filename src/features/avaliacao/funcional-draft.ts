import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export const FUNCIONAL_DRAFT_KEY = 'proinsight:funcional-draft'

export interface FuncionalDraft {
  v: 1
  clienteId: string
  protocoloId: string
  step: number
  dados: { sexo: '' | 'MASCULINO' | 'FEMININO'; idade: string }
  valores: Record<string, string>
  observacoes: string
  savedAt: string
}

export function draftCompativel(
  draft: FuncionalDraft,
  clienteId: string,
  protocoloId: string,
): boolean {
  return draft.clienteId === clienteId && draft.protocoloId === protocoloId
}

function ehDraftValida(value: unknown): value is FuncionalDraft {
  if (typeof value !== 'object' || value === null) return false
  const d = value as Partial<FuncionalDraft>
  if (d.v !== 1) return false
  if (typeof d.clienteId !== 'string' || typeof d.protocoloId !== 'string') return false
  if (typeof d.step !== 'number' || d.step < 0 || d.step > 1) return false
  if (typeof d.observacoes !== 'string' || typeof d.savedAt !== 'string') return false
  if (Number.isNaN(Date.parse(d.savedAt))) return false
  if (typeof d.dados !== 'object' || d.dados === null) return false
  const dados = d.dados as Partial<FuncionalDraft['dados']>
  if (dados.sexo !== '' && dados.sexo !== 'MASCULINO' && dados.sexo !== 'FEMININO') return false
  if (typeof dados.idade !== 'string') return false
  if (typeof d.valores !== 'object' || d.valores === null) return false
  return Object.values(d.valores).every((v) => typeof v === 'string')
}

export function loadDraft(): FuncionalDraft | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(FUNCIONAL_DRAFT_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (!ehDraftValida(parsed)) {
      clearDraft()
      return null
    }
    return parsed
  } catch {
    clearDraft()
    return null
  }
}

export function saveDraft(
  draft: Omit<FuncionalDraft, 'v' | 'savedAt'> & { savedAt?: string },
): void {
  if (typeof window === 'undefined') return
  try {
    const payload: FuncionalDraft = {
      ...draft,
      v: 1,
      savedAt: draft.savedAt ?? new Date().toISOString(),
    }
    window.localStorage.setItem(FUNCIONAL_DRAFT_KEY, JSON.stringify(payload))
  } catch {
    return
  }
}

export function clearDraft(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(FUNCIONAL_DRAFT_KEY)
  } catch {
    return
  }
}

export function formatarQuando(iso: string): string {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: ptBR })
  } catch {
    return ''
  }
}
