import { useEffect, useState, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Users, ArrowLeft, UserPlus, Loader2 } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { ComboboxMobile } from '@/components/combobox-mobile'
import type { ComboboxMobileItem } from '@/components/combobox-mobile'
import { EmptyState } from '@/components/empty-state'
import { clienteService } from '@/services/cliente-service'
import { CadastroClienteForm } from './cadastro-cliente-form'
import type { Cliente } from '@/types/cliente'

type View = 'list' | 'cadastro'

export function AlunosPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const [view, setView] = useState<View>(
    (location.state as { openCadastro?: boolean })?.openCadastro ? 'cadastro' : 'list'
  )

  useEffect(() => {
    window.history.replaceState({}, document.title)
  }, [])

  const { data: clientes, isLoading } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => clienteService.listarTodos(),
  })

  const clientesList = Array.isArray(clientes) ? clientes : []

  const comboboxItems: ComboboxMobileItem<Cliente>[] = useMemo(() => {
    return clientesList.map((c) => ({
      data: c,
      icon: Users,
      label: c.fullName,
      subtitle: c.email,
      status: c.ativo ? 'active' : 'inactive',
    }))
  }, [clientesList])

  const handleCadastroSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['clientes'] })
    setView('list')
  }

  const handleSelectCliente = (cliente: Cliente) => {
    navigate(`/clientes/${cliente.id}`)
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      {/* Header */}
      <div className="flex flex-col bg-primary px-6 pt-12 pb-24">
        {view === 'list' ? (
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <h1 className="text-primary-foreground text-xl font-bold">Alunos</h1>
              <p className="text-primary-foreground/80 mt-0.5 text-sm">
                {clientes ? `${clientes.length} aluno(s) cadastrado(s)` : 'Gerencie seus alunos'}
              </p>
            </div>
            <button
              onClick={() => setView('cadastro')}
              className="bg-muted flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/80"
            >
              <UserPlus size={16} />
              Novo Aluno
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setView('list')}
              className="rounded-full border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20"
            >
              <ArrowLeft className="size-5" />
            </Button>
            <div>
              <h1 className="text-primary-foreground text-xl font-bold">Novo Aluno</h1>
              <p className="text-primary-foreground/80 mt-0.5 text-sm">Cadastre um novo aluno</p>
            </div>
          </div>
        )}
      </div>

      {/* Content card */}
      <div
        key={view}
        className="bg-background -mt-16 z-10 flex flex-1 flex-col rounded-t-[56px] px-6 pt-8 pb-8 shadow-sm animate-in slide-in-from-bottom fade-in duration-500"
      >
        {view === 'list' ? (
          <>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={20} className="text-muted-foreground animate-spin" />
              </div>
            ) : !clientes?.length ? (
              <EmptyState
                icon={<Users size={40} strokeWidth={1.5} />}
                title="Nenhum aluno cadastrado"
                description="Cadastre seu primeiro aluno para começar"
                action={
                  <Button onClick={() => setView('cadastro')}>
                    <UserPlus size={16} className="mr-1.5" />
                    Novo Aluno
                  </Button>
                }
              />
            ) : (
              <ComboboxMobile<Cliente>
                items={comboboxItems}
                onSelect={handleSelectCliente}
                searchPlaceholder="Buscar por nome ou e-mail..."
                pageSize={8}
              />
            )}
          </>
        ) : (
          <CadastroClienteForm
            onSuccess={handleCadastroSuccess}
            onCancel={() => setView('list')}
          />
        )}

        <div className="h-32 shrink-0 md:hidden" />
      </div>
    </div>
  )
}
