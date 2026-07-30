import { api } from '@/lib/api'
import type { HubResponse, ProtocoloDetalhe, ProtocoloResumo, ProtocolosListResponse, RawTabelaClassificacao, TabelaClassificacao } from '@/types/protocolo'
import { transformTabela } from '@/types/protocolo'

export const protocoloService = {
  async getHub(userId: string): Promise<HubResponse> {
    const { data } = await api.get<HubResponse>('/avaliacoes/hub', { params: { userId } })
    return data
  },

  async listarTodos(userId: string): Promise<ProtocoloResumo[] | ProtocolosListResponse> {
    const { data } = await api.get<ProtocoloResumo[] | ProtocolosListResponse>('/avaliacoes/protocolos', { params: { userId } })
    return data
  },

  async getDetalhe(id: string): Promise<ProtocoloDetalhe> {
    const { data } = await api.get<ProtocoloDetalhe>(`/avaliacoes/protocolos/${id}`)
    return data
  },

  async favoritar(userId: string, protocoloId: string): Promise<void> {
    await api.post('/avaliacoes/favoritos', null, { params: { userId, protocoloId } })
  },

  async desfavoritar(userId: string, protocoloId: string): Promise<void> {
    await api.delete('/avaliacoes/favoritos', { params: { userId, protocoloId } })
  },

  async listarFavoritos(userId: string): Promise<ProtocoloResumo[]> {
    const { data } = await api.get<ProtocoloResumo[]>('/avaliacoes/favoritos', { params: { userId } })
    return data
  },

  async getTabelaClassificacao(id: string): Promise<TabelaClassificacao> {
    const { data } = await api.get<RawTabelaClassificacao>(`/tabelas_classificacao/${id}`)
    return transformTabela(data)
  },

  async verificarFavorito(userId: string, protocoloId: string): Promise<boolean> {
    const { data } = await api.get<{ isFavorito: boolean }>('/avaliacoes/favoritos/verificar', {
      params: { userId, protocoloId },
    })
    return data.isFavorito
  },
}
