import { api } from '@/lib/api'
import type { AcademiaResponse } from '@/types/academia'

export const academiaService = {
  getMinha() {
    return api.get<AcademiaResponse>('/auth/me/academia')
  },

  atualizar(data: {
    nomeFantasia: string
    razaoSocial?: string
    cnpj?: string
    telefone?: string
    endereco?: {
      rua: string
      numero?: string
      cidade: string
      estado: string
      cep: string
    }
  }) {
    return api.put<AcademiaResponse>('/auth/me/academia', data)
  },
}
