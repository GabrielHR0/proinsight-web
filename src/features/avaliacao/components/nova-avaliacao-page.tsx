import { useState, useMemo, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Loader2, Search, Activity, User, ChevronRight } from 'lucide-react'
import { CATEGORY_ICON } from '@/components/category-icons'
import { useQuery } from '@tanstack/react-query'
import { Input } from '@/components/ui/input'
import { BackButton } from '@/components/ui/back-button'
import { Stepper } from '@/components/ui/stepper'
import { StarIcon } from '@/components/star-icon'
import { useAuth } from '@/stores/auth'
import { clienteService } from '@/services/cliente-service'
import { protocoloService } from '@/services/protocolo-service'
import { Vo2MaxWizard } from './vo2max-wizard'
import type { Cliente } from '@/types/cliente'
import type { ProtocoloResumo, HubResponse } from '@/types/protocolo'

const CATEGORY_LABEL: Record<string, string> = {
  VO2_MAX: 'Cardiorrespiratório',
  IMC: 'Composição corporal',
  BIOIMPEDANCIA: 'Composição corporal',
  FORCA: 'Força',
  FLEXIBILIDADE: 'Flexibilidade',
}

const CATEGORY_SEGMENTS = [
  { key: 'todos', label: 'Todos' },
  { key: 'favoritos', label: 'Favoritos' },
  { key: 'VO2_MAX', label: 'Cardio' },
  { key: 'IMC', label: 'Corpóreos' },
  { key: 'FORCA', label: 'Força' },
  { key: 'FLEXIBILIDADE', label: 'Flex.' },
]

const PROTOCOLO_RECOMENDADO_ID = 'protocolo_vo2max_esteira_incremental'

const ICON_BG = ['bg-secondary', 'bg-accent', 'bg-link'] as const

const STEPS = [
  { label: 'Aluno' },
  { label: 'Protocolo' },
  { label: 'Avaliação' },
  { label: 'Resultado' },
]

function calcAge(birthDate?: string | null): number | null {
  if (!birthDate) return null
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

export function NovaAvaliacaoPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const preselectedClienteId = (location.state as { clienteId?: string } | null)?.clienteId
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)
  const [clienteBusca, setClienteBusca] = useState('')
  const [selectedProtocoloId, setSelectedProtocoloId] = useState<string | null>(null)
  const [avaliacaoBusca, setAvaliacaoBusca] = useState('')
  const [activeSegment, setActiveSegment] = useState('todos')
  const [avaliacaoIniciada, setAvaliacaoIniciada] = useState(false)

  const { data: clientesData, isLoading: loadingClientes } = useQuery<Cliente[]>({
    queryKey: ['clientes'],
    queryFn: () => clienteService.listarTodos(),
  })

  const { data: protocolosResponse } = useQuery({
    queryKey: ['protocolos', user?.id],
    queryFn: () => protocoloService.listarTodos(user!.id),
    enabled: !!user?.id,
  })

  const { data: hub } = useQuery<HubResponse>({
    queryKey: ['protocolo-hub', user?.id],
    queryFn: () => protocoloService.getHub(user!.id),
    enabled: !!user?.id,
  })

  const clientesList: Cliente[] = clientesData ?? []

  useEffect(() => {
    if (preselectedClienteId && clientesData) {
      const match = clientesData.find((c) => c.id === preselectedClienteId)
      if (match) setSelectedCliente(match)
    }
  }, [preselectedClienteId, clientesData])
  const allProtocolos: ProtocoloResumo[] = Array.isArray(protocolosResponse)
    ? protocolosResponse
    : protocolosResponse
      ? [...(protocolosResponse.favoritos ?? []), ...(protocolosResponse.outros ?? [])]
      : []

  const favoritoIds = useMemo(() => new Set(hub?.favoritos.map((f) => f.id) ?? []), [hub])

  const clientesFiltrados = clientesList.filter(
    (c) =>
      c.fullName.toLowerCase().includes(clienteBusca.toLowerCase()) ||
      c.email.toLowerCase().includes(clienteBusca.toLowerCase()),
  )

  const allProtocolosSorted = useMemo(() => {
    const favs = allProtocolos.filter((p) => favoritoIds.has(p.id))
    const rest = allProtocolos.filter((p) => !favoritoIds.has(p.id))
    return [...favs, ...rest.sort((a, b) => (b.padrao ? 1 : 0) - (a.padrao ? 1 : 0))]
  }, [allProtocolos, favoritoIds])

  const recommendedProtocolo = useMemo(
    () =>
      allProtocolosSorted.find((p) => p.id === PROTOCOLO_RECOMENDADO_ID) ??
      allProtocolosSorted.find((p) => p.padrao) ??
      allProtocolosSorted[0] ??
      null,
    [allProtocolosSorted],
  )

  const selectedProtocolo = useMemo(
    () => allProtocolosSorted.find((p) => p.id === selectedProtocoloId) ?? recommendedProtocolo ?? allProtocolosSorted[0] ?? null,
    [allProtocolosSorted, selectedProtocoloId, recommendedProtocolo],
  )

  const filteredProtocolos = useMemo(() => {
    let list = allProtocolosSorted.filter((p) => p.id !== recommendedProtocolo?.id)

    if (activeSegment === 'favoritos') {
      list = list.filter((p) => favoritoIds.has(p.id))
    } else if (activeSegment !== 'todos') {
      list = list.filter((p) => p.categoria === activeSegment)
    }

    if (avaliacaoBusca) {
      const q = avaliacaoBusca.toLowerCase()
      list = list.filter(
        (p) =>
          p.nome.toLowerCase().includes(q) ||
          p.descricao?.toLowerCase().includes(q) ||
          CATEGORY_LABEL[p.categoria]?.toLowerCase().includes(q),
      )
    }

    return list
  }, [allProtocolosSorted, recommendedProtocolo, activeSegment, avaliacaoBusca, favoritoIds])

  const handleProtocoloConfirm = (protocolo = selectedProtocolo) => {
    if (!selectedCliente || !protocolo) return
    if (protocolo.id === 'protocolo_vo2max_esteira_incremental') {
      setAvaliacaoIniciada(true)
      return
    }
    navigate('/avaliacoes')
  }

  const goBack = () => {
    if (avaliacaoIniciada) {
      setAvaliacaoIniciada(false)
      setSelectedProtocoloId(null)
      return
    }
    if (selectedCliente) {
      setSelectedCliente(null)
      setSelectedProtocoloId(null)
      setAvaliacaoBusca('')
      setActiveSegment('todos')
    } else {
      navigate(-1)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <div className="bg-primary px-6 pt-12 pb-24">
        <div className="flex items-center gap-3">
          <BackButton onClick={goBack} />
          <div>
            <h1 className="text-primary-foreground text-lg font-bold">
              {avaliacaoIniciada ? 'Iniciar avaliação' : selectedCliente ? 'Selecione a avaliação' : 'Nova Avaliação'}
            </h1>
            <p className="text-primary-foreground/70 text-xs">
              {selectedCliente ? selectedCliente.fullName : 'Selecione o aluno'}
            </p>
          </div>
        </div>
      </div>

      <div className={`bg-background -mt-16 flex flex-1 flex-col rounded-t-[56px] pt-6 ${selectedCliente && selectedProtocolo ? 'pb-44 md:pb-28' : 'pb-8'}`}>
        {!selectedCliente ? (
          <div className="flex flex-1 flex-col gap-4 px-6">
            <div className="relative">
              <Search size={16} className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2" />
              <Input
                placeholder="Buscar aluno..."
                className="bg-background pl-9"
                value={clienteBusca}
                onChange={(e) => setClienteBusca(e.target.value)}
                autoFocus
              />
            </div>

            {loadingClientes ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={20} className="text-muted-foreground animate-spin" />
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {clientesFiltrados.map((cliente, i) => {
                  const bg = ICON_BG[i % ICON_BG.length]
                  return (
                    <button
                      key={cliente.id}
                      type="button"
                      onClick={() => setSelectedCliente(cliente)}
                      className="flex items-center gap-4 text-left active:scale-[0.98] transition-all"
                    >
                      <div className={`${bg} flex size-12 shrink-0 items-center justify-center rounded-full`}>
                        <User size={20} className="text-background" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-foreground truncate text-sm font-semibold capitalize">{cliente.fullName}</p>
                        <p className="text-muted-foreground truncate text-xs">{cliente.email}</p>
                      </div>
                      <ChevronRight size={16} className="text-muted-foreground shrink-0" />
                    </button>
                  )
                })}
                {clientesFiltrados.length === 0 && clientesList.length > 0 && (
                  <p className="text-muted-foreground py-8 text-center text-sm">Nenhum aluno encontrado</p>
                )}
              </div>
            )}
          </div>
        ) : avaliacaoIniciada ? (
          <div className="flex flex-1 flex-col">
            <Stepper steps={STEPS} currentStep={2} className="px-6 mb-5" />

            <Vo2MaxWizard
              clienteId={selectedCliente.id}
              clienteNome={selectedCliente.fullName}
              protocoloId={selectedProtocolo?.id ?? ''}
              onExit={() => {
                setAvaliacaoIniciada(false)
                setSelectedProtocoloId(null)
              }}
              onDone={() => {
                if (window.confirm('Deseja realizar outra avaliação para este aluno?')) {
                  setAvaliacaoIniciada(false)
                  setSelectedProtocoloId(null)
                } else {
                  navigate('/avaliacoes')
                }
              }}
            />
          </div>
        ) : (
          <div className="flex flex-1 flex-col">
            <Stepper steps={STEPS} currentStep={1} className="px-6 mb-5" />

            <div className="flex flex-1 flex-col gap-5 px-6">
              <ProfileSummaryCard cliente={selectedCliente} />

              {recommendedProtocolo && (
                <FeaturedCard
                  protocolo={recommendedProtocolo}
                  isFavorite={favoritoIds.has(recommendedProtocolo.id)}
                  onSelect={() => setSelectedProtocoloId(recommendedProtocolo.id)}
                  onStart={handleProtocoloConfirm}
                />
              )}

              <div className="relative">
                <Search size={16} className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2" />
                <Input
                  placeholder="Buscar avaliação..."
                  className="bg-background pl-9"
                  value={avaliacaoBusca}
                  onChange={(e) => setAvaliacaoBusca(e.target.value)}
                />
              </div>

              <SegmentedControl
                segments={CATEGORY_SEGMENTS}
                active={activeSegment}
                onChange={setActiveSegment}
              />

              {filteredProtocolos.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {filteredProtocolos.map((p) => (
                    <SelectableCard
                      key={p.id}
                      protocolo={p}
                      isSelected={p.id === selectedProtocolo?.id}
                      isFavorite={favoritoIds.has(p.id)}
                      onClick={() => setSelectedProtocoloId(p.id)}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground py-8 text-center text-sm">Nenhum protocolo encontrado</p>
              )}
            </div>
          </div>
        )}
      </div>

      {selectedCliente && selectedProtocolo && !avaliacaoIniciada && (
        <StickyBottomAction
          protocolo={selectedProtocolo}
          onStart={handleProtocoloConfirm}
        />
      )}
    </div>
  )
}

function ProfileSummaryCard({ cliente }: { cliente: Cliente }) {
  const age = calcAge(cliente.dataNascimento)

  return (
    <div className="bg-card flex items-center gap-4 rounded-2xl p-4 shadow-sm">
      <div className="bg-secondary flex size-14 shrink-0 items-center justify-center rounded-full">
        <User size={22} className="text-background" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-foreground truncate text-sm font-bold capitalize">{cliente.fullName}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
          {age !== null && (
            <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
              <span className="text-foreground font-medium">{age}</span> anos
            </span>
          )}
          <span className="text-muted-foreground truncate text-[11px]">{cliente.email}</span>
        </div>
      </div>
    </div>
  )
}

function FeaturedCard({
  protocolo,
  isFavorite,
  onSelect,
  onStart,
}: {
  protocolo: ProtocoloResumo
  isFavorite: boolean
  onSelect: () => void
  onStart: () => void
}) {
  const Icon = CATEGORY_ICON[protocolo.categoria] ?? Activity

  return (
    <button
      type="button"
      onClick={onSelect}
      className="bg-card ring-border/60 flex flex-col items-center gap-4 rounded-3xl p-5 text-center shadow-sm ring-1 active:scale-[0.98] transition-transform"
    >
      <div className="flex items-center gap-2 self-start">
        <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-link">
          Recomendado
        </span>
        {isFavorite && <StarIcon filled className="size-3.5 text-link" />}
      </div>

      <Icon size={32} className="text-link" />

      <div>
        <p className="text-foreground text-base font-bold capitalize">{protocolo.nome}</p>
        {protocolo.descricao && (
          <p className="text-muted-foreground mt-1 text-xs leading-relaxed">{protocolo.descricao}</p>
        )}
      </div>

      <div
        onClick={(e) => {
          e.stopPropagation()
          onStart()
        }}
        className="bg-primary w-full rounded-2xl py-3 text-sm font-bold text-primary-foreground"
      >
        Iniciar avaliação
      </div>
    </button>
  )
}

function SegmentedControl({
  segments,
  active,
  onChange,
}: {
  segments: { key: string; label: string }[]
  active: string
  onChange: (key: string) => void
}) {
  return (
    <div className="bg-muted flex gap-1 rounded-2xl p-1">
      {segments.map((seg) => (
        <button
          key={seg.key}
          type="button"
          onClick={() => onChange(seg.key)}
          className={`flex-1 rounded-xl px-2 py-2 text-[11px] font-semibold transition-all ${
            active === seg.key
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground'
          }`}
        >
          {seg.label}
        </button>
      ))}
    </div>
  )
}

function SelectableCard({
  protocolo,
  isSelected,
  isFavorite,
  onClick,
}: {
  protocolo: ProtocoloResumo
  isSelected: boolean
  isFavorite: boolean
  onClick: () => void
}) {
  const Icon = CATEGORY_ICON[protocolo.categoria] ?? Activity

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex flex-col items-center gap-2.5 rounded-2xl border p-3 text-center transition-colors active:scale-[0.95] ${
        isSelected
          ? 'border-primary bg-card text-foreground'
          : 'border-border/70 bg-card text-muted-foreground'
      }`}
    >
      {isFavorite && (
        <StarIcon filled className="text-link absolute top-2 right-2 size-3" />
      )}

      <Icon size={18} className={isSelected ? 'text-primary' : 'text-secondary'} />

      <p className={`w-full truncate text-xs font-semibold capitalize ${isSelected ? '' : 'text-muted-foreground'}`}>
        {protocolo.nome}
      </p>

      {protocolo.descricao && (
        <p className={`line-clamp-2 w-full text-[10px] leading-tight ${isSelected ? 'text-muted-foreground' : 'text-muted-foreground/70'}`}>
          {protocolo.descricao}
        </p>
      )}

      <div className="flex items-center gap-2">
        <span className={`text-[9px] ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
          {CATEGORY_LABEL[protocolo.categoria] ?? protocolo.categoria}
        </span>
      </div>
    </button>
  )
}

function StickyBottomAction({
  protocolo,
  onStart,
}: {
  protocolo: ProtocoloResumo
  onStart: () => void
}) {
  return (
    <div className="bg-background border-border fixed inset-x-0 z-[55] border-t px-6 py-4 pb-8 bottom-[72px] md:bottom-0">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-foreground truncate text-sm font-bold capitalize">{protocolo.nome}</p>
          <p className="text-muted-foreground text-[11px]">Pronto para iniciar</p>
        </div>
        <button
          type="button"
          onClick={onStart}
          className="bg-primary shrink-0 rounded-2xl px-6 py-3 text-sm font-bold text-primary-foreground shadow-sm active:scale-[0.97] transition-transform"
        >
          Iniciar avaliação
        </button>
      </div>
    </div>
  )
}
