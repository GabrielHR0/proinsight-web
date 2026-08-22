export interface AcademiaResponse {
  id: string
  ownerId: string
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
  createdAt: string
  updatedAt: string
}
