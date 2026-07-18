import { api } from '@/lib/api'
import type { Cliente, ClienteFormData } from '@/types/cliente'

export const clienteService = {
  async listarTodos(): Promise<Cliente[]> {
    const { data } = await api.get<Cliente[]>('/clientes')
    return data
  },

  async criar(dados: ClienteFormData): Promise<Cliente> {
    const { data } = await api.post<Cliente>('/clientes', dados)
    return data
  },

  async buscarPorId(id: string): Promise<Cliente> {
    const { data } = await api.get<Cliente>(`/clientes/${id}`)
    return data
  },

  async listarPorAcademia(academiaId: string): Promise<Cliente[]> {
    const { data } = await api.get<Cliente[]>(`/clientes/por-academia/${academiaId}`)
    return data
  },

  async listarPorAvaliador(avaliadorId: string): Promise<Cliente[]> {
    const { data } = await api.get<Cliente[]>(`/clientes/por-avaliador/${avaliadorId}`)
    return data
  },
}
