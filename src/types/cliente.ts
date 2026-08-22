export type Sexo = 'MASCULINO' | 'FEMININO'

export interface Cliente {
  id: string
  fullName: string
  email: string
  phone: string
  cpf: string
  dataNascimento?: string
  sexo?: Sexo
  endereco?: Endereco
  academiaId?: string
  avaliadorId?: string
  ativo: boolean
}

export interface Endereco {
  rua: string
  numero: string
  cidade: string
  estado: string
  cep: string
}

export interface ClienteFormData {
  fullName: string
  email: string
  phone: string
  cpf: string
  dataNascimento: string
  sexo?: Sexo
  rua: string
  numero: string
  cidade: string
  estado: string
  cep: string
  ativo?: boolean
}

export interface ComImcRequest {
  fullName: string
  email: string
  phone: string
  cpf: string
  dataNascimento: string
  sexo: Sexo
  rua?: string
  numero?: string
  cidade?: string
  estado?: string
  cep?: string
  academiaId?: string
  avaliadorId?: string
  protocoloId?: string
  pesoGramas?: number
  alturaCm?: number
}

export interface AvaliacaoResult {
  classificacao: string
  protocolo_nome: string
  protocolo_id: string
  avaliador_id: string
  cliente_id: string
  avaliacao_id: string
  status: string
  extras: {
    imc?: number
    peso_gramas?: number
    altura_cm?: number
  }
}

export interface ComImcResponse {
  cliente: Cliente
  avaliacao?: AvaliacaoResult
}