export interface NivelReferencia {
  classificacao?: string
  classificacao_legivel?: string
  min?: number
  max?: number
  tipo_min?: string
  tipo_max?: string
}

export interface ReferenciaClassificacao {
  sexo?: string
  idade_min?: number
  idade_max?: number
  niveis: NivelReferencia[]
}

export interface AvaliacaoHistorico {
  id: string
  cliente_id: string
  protocolo_id: string
  protocolo_nome?: string
  tipo: string
  data_avaliacao?: string
  valor?: number
  classificacao?: string
  classificacao_legivel?: string
  detalhes: Record<string, unknown>
  referencias?: ReferenciaClassificacao
}