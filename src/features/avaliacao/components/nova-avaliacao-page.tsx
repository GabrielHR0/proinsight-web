import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardPlus, Loader2, Check, Search } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Input } from '@/components/ui/input'
import { StepperLayout, useStepper } from '@/components/stepper'
import { clienteService } from '@/services/cliente-service'
import { protocoloService } from '@/services/protocolo-service'
import type { Cliente } from '@/types/cliente'
import type { ProtocoloResumo } from '@/types/protocolo'
import { cn } from '@/lib/utils'

const STEPS = [
  { id: 'aluno', title: 'Aluno' },
  { id: 'protocolo', title: 'Protocolo' },
]

export function NovaAvaliacaoPage() {
  const navigate = useNavigate()
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [clienteBusca, setClienteBusca] = useState('')

  const { data: clientes } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => clienteService.listarTodos(),
  })

  const { data: protocolosResponse } = useQuery({
    queryKey: ['protocolos'],
    queryFn: () => protocoloService.listarTodos('user-1'),
  })

  const protocolos = useMemo(
    () => protocolosResponse ? [...(protocolosResponse.favoritos ?? []), ...(protocolosResponse.outros ?? [])] : [],
    [protocolosResponse],
  )

  const stepper = useStepper(STEPS, {})

  const clientesFiltrados = useMemo(
    () =>
      (clientes ?? []).filter(
        (c) =>
          c.fullName.toLowerCase().includes(clienteBusca.toLowerCase()) ||
          c.email.toLowerCase().includes(clienteBusca.toLowerCase()),
      ),
    [clientes, clienteBusca],
  )

  const handleSelectCliente = (cliente: Cliente) => {
    setSelectedCliente(cliente)
    stepper.goToNext()
  }

  const handleSubmit = async (protocolo: ProtocoloResumo) => {
    if (protocolo.id === 'protocolo_vo2max_esteira_incremental') {
      navigate('/avaliacao/incremental')
      return
    }
    if (!selectedCliente) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1000))
    setLoading(false)
    setSuccess(true)
    setTimeout(() => navigate('/avaliacoes'), 2000)
  }

  if (success) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-6">
        <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
          <Check size={32} />
        </div>
        <p className="text-foreground text-base font-semibold">Avaliação registrada!</p>
        <p className="text-muted-foreground mt-1 text-sm">Redirecionando...</p>
      </div>
    )
  }

  return (
    <StepperLayout
      title="Nova Avaliação"
      steps={STEPS}
      currentStep={stepper.currentStep}
      onBack={stepper.currentStep === 0 ? () => navigate('/') : stepper.goToBack}
      onNext={stepper.currentStepId === 'aluno' && selectedCliente ? stepper.goToNext : undefined}
      canNext={stepper.currentStepId === 'aluno' ? !!selectedCliente : true}
      nextLabel="Selecionar Protocolo"
      hideNavigation={stepper.isLastStep}
    >
      {stepper.currentStepId === 'aluno' && (
        <div>
          <div className="relative mb-4">
            <Search size={16} className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2" />
            <Input
              placeholder="Buscar aluno..."
              className="bg-background pl-9"
              value={clienteBusca}
              onChange={(e) => {
                setClienteBusca(e.target.value)
                stepper.setCanNext(false)
              }}
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-2">
            {clientesFiltrados.map((cliente) => (
              <button
                key={cliente.id}
                type="button"
                onClick={() => handleSelectCliente(cliente)}
                className={cn(
                  'flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all',
                  selectedCliente?.id === cliente.id
                    ? 'border-accent bg-accent/[0.04]'
                    : 'border-border hover:border-accent/50 hover:bg-accent/[0.02]',
                )}
              >
                <div className="bg-accent/10 text-accent flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold">
                  {cliente.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-foreground truncate text-sm font-medium">{cliente.fullName}</p>
                  <p className="text-muted-foreground truncate text-xs">{cliente.email}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {stepper.currentStepId === 'protocolo' && selectedCliente && (
        <div>
          <div className="mb-4 flex items-center gap-3 rounded-xl bg-muted px-4 py-3">
            <div className="bg-accent/10 text-accent flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold">
              {selectedCliente.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-foreground text-sm font-medium">{selectedCliente.fullName}</p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {protocolos?.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSubmit(p)}
                className="border-border hover:bg-muted flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors"
              >
                <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-full">
                  <ClipboardPlus size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-foreground text-sm font-medium">{p.nome}</p>
                  <p className="text-muted-foreground text-xs">{p.categoria}</p>
                </div>
              </button>
            ))}
          </div>

          {loading && (
            <div className="mt-6 flex items-center justify-center gap-2 py-4">
              <Loader2 size={18} className="animate-spin text-muted-foreground" />
              <span className="text-muted-foreground text-sm">Registrando avaliação...</span>
            </div>
          )}
        </div>
      )}
    </StepperLayout>
  )
}