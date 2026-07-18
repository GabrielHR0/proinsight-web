import { api } from '@/lib/api'

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
  descricao: string
  valor_vo2max: number
}

export interface AvaliacaoVo2MaxResponse {
  avaliacao_id: string
  cliente_id: string
  avaliador_id: string
  classificacao: ClassificacaoVo2Max
  data_avaliacao: string
}

export const avaliacaoService = {
  async submitVo2Max(dados: AvaliacaoVo2MaxRequest): Promise<AvaliacaoVo2MaxResponse> {
    const { data } = await api.post<AvaliacaoVo2MaxResponse>('/avaliacoes/vo2max', dados)
    return data
  },
}
