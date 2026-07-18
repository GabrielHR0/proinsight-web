export interface ProtocoloResumo {
  id: string
  nome: string
  categoria: string
  padrao: boolean
  protocolo: string | null
  descricao: string | null
  unidadeMedida: string | null
}

export interface ProtocolosListResponse {
  favoritos: ProtocoloResumo[]
  outros: ProtocoloResumo[]
}

export interface ProtocoloDetalhe {
  id: string
  nome: string
  categoria: string
  padrao: boolean
  strategyKey: string
  tabelaClassificacaoId: string
  descricao: string | null
  comoRealizar: string | null
  calculadora: string | null
  referenciaBibliografica: string | null
  unidadeMedida: string | null
  tempoMinimoSegundos: number | null
  tempoMaximoSegundos: number | null
  equipamentoNecessario: string | null
  criteriosExclusao: string | null
  observacoes: string | null
  createdAt: string | null
}

export interface HubResponse {
  favoritos: ProtocoloResumo[]
  porCategoria: Record<string, ProtocoloResumo[]>
}

/* ── Friendly types (used by components) ── */

export interface TabelaClassificacao {
  id: string
  nome: string
  raiz: ClassificacaoComponent
}

export interface ClassificacaoComponent {
  tipo: string
  rotulo: string
  descricao?: string
  filhos?: ClassificacaoComponent[]
  unidade?: string
  valorMinimo?: number
  valorMaximo?: number
  classificacao?: string
  protocolo?: string
  sexo?: string
  idadeMin?: number
  idadeMax?: number
}

/* ── Raw types (exact API response shape) ── */

export interface RawTabelaClassificacao {
  id: string
  nome: string
  raiz: RawClassificacaoComponent
}

export interface RawClassificacaoComponent {
  _class: string
  componentes?: RawClassificacaoComponent[]
  sexo?: string
  idadeMin?: number
  idadeMax?: number
  equipamento?: string
  protocolo?: string
  classificacao?: string
  nome?: string
  nivel?: number
  min?: number | null
  max?: number | null
  tipoMin?: string | null
  tipoMax?: string | null
}

/* ── Transformer ── */

function parseTipo(_class: string): string {
  return _class.replace(/^persisted/, '')
}

function parseRotulo(node: RawClassificacaoComponent): string {
  if (node.sexo) return node.sexo === 'MASCULINO' ? 'Masculino' : 'Feminino'
  if (node.idadeMin !== undefined && node.idadeMax !== undefined) return `${node.idadeMin} - ${node.idadeMax} anos`
  if (node.equipamento) return node.equipamento.charAt(0) + node.equipamento.slice(1).toLowerCase()
  if (node.protocolo) return node.protocolo.charAt(0) + node.protocolo.slice(1).toLowerCase()
  if (node.classificacao) return node.classificacao
  if (node.nome) return node.nome
  return parseTipo(node._class)
}

function transformNode(raw: RawClassificacaoComponent): ClassificacaoComponent {
  const node: ClassificacaoComponent = {
    tipo: parseTipo(raw._class),
    rotulo: parseRotulo(raw),
    classificacao: raw.classificacao,
    valorMinimo: raw.min ?? undefined,
    valorMaximo: raw.max ?? undefined,
    sexo: raw.sexo,
    idadeMin: raw.idadeMin,
    idadeMax: raw.idadeMax,
    protocolo: raw.protocolo,
  }

  if (raw.componentes?.length) {
    node.filhos = raw.componentes.map(transformNode)
  }

  return node
}

export function transformTabela(raw: RawTabelaClassificacao): TabelaClassificacao {
  return {
    id: raw.id,
    nome: raw.nome,
    raiz: transformNode(raw.raiz),
  }
}
