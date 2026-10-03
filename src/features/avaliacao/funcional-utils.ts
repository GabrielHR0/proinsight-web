export interface Violation {
  field: string
  message: string
}

export interface FuncionalErrorParsed {
  status: number | null
  resumo: string | null
  global: string[]
  porTeste: Record<string, string[]>
  voltarAoDados: boolean
}

const TESTE_FIELD_PATTERN = /^testes\[(.+)\](?:\..+)?$/
const CAMPOS_DE_DADOS = ['idade', 'sexo']

function isEmptyParsed(): FuncionalErrorParsed {
  return {
    status: null,
    resumo: null,
    global: [],
    porTeste: {},
    voltarAoDados: false,
  }
}

export function parseFuncionalError(error: unknown, ordemChaves: string[] = []): FuncionalErrorParsed {
  const err = error as
    | { response?: { status?: number; data?: Record<string, unknown> } }
    | undefined

  if (!err?.response) return isEmptyParsed()

  const data = err.response.data ?? {}
  const parsed: FuncionalErrorParsed = {
    status: err.response.status ?? null,
    resumo: typeof data.detail === 'string' ? data.detail : null,
    global: [],
    porTeste: {},
    voltarAoDados: false,
  }

  const violations = Array.isArray(data.violations) ? (data.violations as Violation[]) : []

  for (const violation of violations) {
    const match = TESTE_FIELD_PATTERN.exec(violation.field)

    if (match) {
      const chave = match[1]
      const chaveResolvida = /^\d+$/.test(chave) ? ordemChaves[Number(chave)] : chave

      if (chaveResolvida) {
        ;(parsed.porTeste[chaveResolvida] ??= []).push(violation.message)
        continue
      }
    }

    if (CAMPOS_DE_DADOS.includes(violation.field)) {
      parsed.voltarAoDados = true
    }
    parsed.global.push(violation.message)
  }

  return parsed
}
