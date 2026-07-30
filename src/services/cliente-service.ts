import { api } from '@/lib/api'
import type { Cliente, ClienteFormData, ComImcRequest, ComImcResponse } from '@/types/cliente'

export const clienteService = {
  async listarTodos(): Promise<Cliente[]> {
    const { data } = await api.get<Cliente[]>('/clientes')
    return data
  },

  async criar(dados: ClienteFormData): Promise<Cliente> {
    const { data } = await api.post<Cliente>('/clientes', dados)
    return data
  },

  async criarComImc(dados: ComImcRequest): Promise<ComImcResponse> {
    const { data } = await api.post<ComImcResponse>('/clientes/com-imc', dados)
    return data
  },

  async atualizar(id: string, dados: Partial<ClienteFormData>): Promise<Cliente> {
    const { data } = await api.put<Cliente>(`/clientes/${id}`, dados)
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
