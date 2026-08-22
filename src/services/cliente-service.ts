import { api } from '@/lib/api'
import type { Cliente, ClienteFormData, ComImcRequest, ComImcResponse } from '@/types/cliente'
import type { AvaliacaoHistorico } from '@/types/avaliacao'

function getAcademiaId(): string | undefined {
  return localStorage.getItem('proinsight_academia_id') ?? undefined
}

export const clienteService = {
  async listarTodos(): Promise<Cliente[]> {
    const { data } = await api.get<Cliente[]>('/clientes')
    return data
  },

  async criar(dados: ClienteFormData): Promise<Cliente> {
    const { data } = await api.post<Cliente>('/clientes', { ...dados, academiaId: getAcademiaId() })
    return data
  },

  async criarComImc(dados: ComImcRequest): Promise<ComImcResponse> {
    const { data } = await api.post<ComImcResponse>('/clientes/com-imc', { ...dados, academiaId: dados.academiaId ?? getAcademiaId() })
    return data
  },

  async atualizar(id: string, dados: Partial<ClienteFormData>): Promise<Cliente> {
    const { data } = await api.put<Cliente>(`/clientes/${id}`, { ...dados, academiaId: getAcademiaId() })
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

  async listarAvaliacoes(clienteId: string): Promise<AvaliacaoHistorico[]> {
    const { data } = await api.get<AvaliacaoHistorico[]>(`/clientes/${clienteId}/avaliacoes`)
    return data
  },
}
