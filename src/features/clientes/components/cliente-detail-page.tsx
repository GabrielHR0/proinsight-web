import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, Mail, Phone, MapPin, User } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { PageLayout } from '@/components/layout/page-layout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { clienteService } from '@/services/cliente-service'

export function ClienteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: cliente, isLoading } = useQuery({
    queryKey: ['cliente', id],
    queryFn: () => clienteService.buscarPorId(id!),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <PageLayout header={<div className="flex items-center gap-3"><Button variant="outline" size="icon" onClick={() => navigate('/clientes')} className="rounded-full"><ArrowLeft className="size-5" /></Button><h1 className="text-primary-foreground text-xl font-bold">Aluno</h1></div>}>
        <div className="flex items-center justify-center py-12"><Loader2 size={20} className="text-muted-foreground animate-spin" /></div>
      </PageLayout>
    )
  }

  if (!cliente) {
    return (
      <PageLayout header={<div className="flex items-center gap-3"><Button variant="outline" size="icon" onClick={() => navigate('/clientes')} className="rounded-full"><ArrowLeft className="size-5" /></Button><h1 className="text-primary-foreground text-xl font-bold">Aluno</h1></div>}>
        <p className="text-muted-foreground py-12 text-center text-sm">Aluno não encontrado</p>
      </PageLayout>
    )
  }

  return (
    <PageLayout
      header={
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => navigate('/clientes')} className="rounded-full">
            <ArrowLeft className="size-5" />
          </Button>
          <div>
            <h1 className="text-primary-foreground text-xl font-bold">{cliente.fullName}</h1>
            <p className="text-primary-foreground/80 mt-0.5 text-sm">Detalhes do aluno</p>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-accent/10 text-accent flex size-16 items-center justify-center rounded-full text-2xl font-bold">
            {cliente.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-foreground text-lg font-semibold">{cliente.fullName}</h2>
            <span className={`mt-1 inline-block rounded-full px-3 py-0.5 text-xs font-medium ${cliente.ativo ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-muted text-muted-foreground'}`}>
              {cliente.ativo ? 'Ativo' : 'Inativo'}
            </span>
          </div>
        </div>

        <Card className="p-4">
          <h3 className="text-foreground mb-3 text-sm font-semibold flex items-center gap-2"><User size={14} /> Dados Pessoais</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail size={14} className="text-muted-foreground shrink-0" />
              <span className="text-foreground text-sm">{cliente.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone size={14} className="text-muted-foreground shrink-0" />
              <span className="text-foreground text-sm">{cliente.phone}</span>
            </div>
          </div>
        </Card>

        {cliente.endereco && (
          <Card className="p-4">
            <h3 className="text-foreground mb-3 text-sm font-semibold flex items-center gap-2"><MapPin size={14} /> Endereço</h3>
            <p className="text-muted-foreground text-sm">
              {cliente.endereco.rua}, {cliente.endereco.numero}
              <br />
              {cliente.endereco.cidade} - {cliente.endereco.estado}
              <br />
              CEP: {cliente.endereco.cep}
            </p>
          </Card>
        )}
      </div>
    </PageLayout>
  )
}