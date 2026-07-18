export interface Cliente {
  id: string
  fullName: string
  email: string
  phone: string
  cpf: string
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
  rua: string
  numero: string
  cidade: string
  estado: string
  cep: string
  ativo?: boolean
}
