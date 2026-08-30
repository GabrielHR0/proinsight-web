import { api } from '@/lib/api'
import type { ReferenciaClassificacao } from '@/types/avaliacao'

export interface DadosPreAvaliacao {
  protocolo_id: string
  protocolo_imc_id?: string
  sexo: 'MASCULINO' | 'FEMININO'
  idade?: number
  peso_kg: number
  altura_cm: number
  data_ultima_avaliacao_imc?: string
}

export interface AvaliacaoVo2MaxRequest {
  cliente_id: string
  protocolo_id: string
  avaliador_id: string
  resultado: number
  inclinacao_percent?: number
  frequencia_cardiaca?: number
  peso_kg?: number
  idade?: number
  sexo?: 'MASCULINO' | 'FEMININO'
  observacoes?: string
}

export interface ClassificacaoVo2Max {
  nome: string
  nome_legivel: string
  descricao: string
  valor_vo2max: number
  mets_calculado: number
}

export interface AvaliacaoVo2MaxResponse {
  avaliacao_id: string
  cliente_id: string
  avaliador_id: string
  classificacao: ClassificacaoVo2Max
  referencias?: ReferenciaClassificacao
  data_avaliacao: string
}

export interface AvaliacaoImcRequest {
  cliente_id: string
  protocolo_id: string
  avaliador_id: string
  peso_gramas: number
  altura_cm: number
}

export interface AvaliacaoImcResponse {
  avaliacao_id: string
  cliente_id: string
  classificacao: string
  extras?: Record<string, unknown>
}

export const avaliacaoService = {
  async buscarDadosPreAvaliacao(protocoloId: string, clienteId: string): Promise<DadosPreAvaliacao> {
    const { data } = await api.get<DadosPreAvaliacao>(`/avaliacoes/${protocoloId}/dados-pre-avaliacao/${clienteId}`)
    return data
  },

  async submitVo2Max(dados: AvaliacaoVo2MaxRequest): Promise<AvaliacaoVo2MaxResponse> {
    const { data } = await api.post<AvaliacaoVo2MaxResponse>('/avaliacoes/vo2max', dados)
    return data
  },

  async submitImc(dados: AvaliacaoImcRequest): Promise<AvaliacaoImcResponse> {
    const { data } = await api.post<AvaliacaoImcResponse>('/avaliacoes/imc', dados)
    return data
  },
}
