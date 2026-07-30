import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, ChevronDown, Check, CalendarIcon, User } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { PageLayout } from '@/components/layout/page-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { clienteService } from '@/services/cliente-service'
import { cn } from '@/lib/utils'

function FormField({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-foreground text-xs font-medium">{label}</label>
      <Input {...props} />
    </div>
  )
}

export function ClienteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: cliente, isLoading } = useQuery({
    queryKey: ['cliente', id],
    queryFn: () => clienteService.buscarPorId(id!),
    enabled: !!id,
  })

  const [dadosOpen, setDadosOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    cpf: '',
    dataNascimento: '',
    rua: '',
    numero: '',
    cidade: '',
    estado: '',
    cep: '',
    ativo: true,
  })

  useEffect(() => {
    if (cliente) {
      setForm({
        fullName: cliente.fullName,
        email: cliente.email,
        phone: cliente.phone,
        cpf: cliente.cpf,
        dataNascimento: cliente.dataNascimento ?? '',
        rua: cliente.endereco?.rua ?? '',
        numero: cliente.endereco?.numero ?? '',
        cidade: cliente.endereco?.cidade ?? '',
        estado: cliente.endereco?.estado ?? '',
        cep: cliente.endereco?.cep ?? '',
        ativo: cliente.ativo,
      })
    }
  }, [cliente])

  const handleSave = async () => {
    if (!id) return
    setSaving(true)
    try {
      await clienteService.atualizar(id, form)
      queryClient.invalidateQueries({ queryKey: ['cliente', id] })
    } catch {
      // handled by api.ts toast
    } finally {
      setSaving(false)
    }
  }

  const selectedDate = form.dataNascimento ? new Date(form.dataNascimento + 'T00:00:00') : undefined

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
          <div className="bg-muted flex size-14 items-center justify-center rounded-full">
            <User size={24} className="text-muted-foreground" />
          </div>
          <div className="flex-1">
            <h2 className="text-foreground text-lg font-semibold">{cliente.fullName}</h2>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={cn('size-2 rounded-full', cliente.ativo ? 'bg-green-500' : 'bg-muted-foreground/40')} />
            <span className="text-muted-foreground text-xs">{cliente.ativo ? 'Ativo' : 'Inativo'}</span>
          </div>
        </div>

        <Collapsible open={dadosOpen} onOpenChange={setDadosOpen}>
          <div className="rounded-xl border border-border">
            <CollapsibleTrigger asChild>
              <button type="button" className="text-foreground flex w-full items-center justify-between px-4 py-3 text-sm font-medium">
                Dados do cliente
                <ChevronDown size={16} className={cn('text-muted-foreground transition-transform duration-200', dadosOpen && 'rotate-180')} />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="flex flex-col gap-4 border-t border-border px-4 py-4">
                <div className="flex flex-col gap-3">
                  <FormField
                    label="Nome completo"
                    value={form.fullName}
                    onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      label="E-mail"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    />
                    <FormField
                      label="Telefone"
                      value={form.phone}
                      onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                    />
                  </div>
                  <FormField
                    label="CPF"
                    value={form.cpf}
                    onChange={(e) => setForm((p) => ({ ...p, cpf: e.target.value }))}
                  />
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-foreground text-xs font-medium">Data de nascimento</Label>
                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className={cn(
                            'flex h-10 w-full items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                            !selectedDate && 'text-muted-foreground',
                          )}
                        >
                          <CalendarIcon size={16} className="shrink-0 text-muted-foreground" />
                          <span className="flex-1 text-left">
                            {selectedDate
                              ? format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })
                              : 'Selecione a data'}
                          </span>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => {
                            if (date) {
                              setForm((p) => ({ ...p, dataNascimento: format(date, 'yyyy-MM-dd') }))
                              setCalendarOpen(false)
                            }
                          }}
                          disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                          captionLayout="dropdown"
                          startMonth={new Date(1940, 0)}
                          endMonth={new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Endereço</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <FormField
                        label="Rua"
                        value={form.rua}
                        onChange={(e) => setForm((p) => ({ ...p, rua: e.target.value }))}
                      />
                    </div>
                    <FormField
                      label="Número"
                      value={form.numero}
                      onChange={(e) => setForm((p) => ({ ...p, numero: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      label="Cidade"
                      value={form.cidade}
                      onChange={(e) => setForm((p) => ({ ...p, cidade: e.target.value }))}
                    />
                    <FormField
                      label="Estado"
                      value={form.estado}
                      onChange={(e) => setForm((p) => ({ ...p, estado: e.target.value }))}
                    />
                  </div>
                  <FormField
                    label="CEP"
                    value={form.cep}
                    onChange={(e) => setForm((p) => ({ ...p, cep: e.target.value }))}
                  />
                </div>

                <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Aluno ativo</Label>
                    <p className="text-muted-foreground text-xs">Desative para marcar como ex-aluno</p>
                  </div>
                  <Switch
                    checked={form.ativo}
                    onCheckedChange={(checked) => setForm((p) => ({ ...p, ativo: checked }))}
                  />
                </div>

                <Button className="w-full" onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      Salvando...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Check size={16} />
                      Salvar
                    </span>
                  )}
                </Button>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      </div>
    </PageLayout>
  )
}
