import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Loader2, ChevronDown, Check, CalendarIcon, User, ClipboardPlus } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { PageLayout } from '@/components/layout/page-layout'
import { BackButton } from '@/components/ui/back-button'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EmptyState } from '@/components/empty-state'
import { clienteService } from '@/services/cliente-service'
import { useClienteAvaliacoes } from '@/hooks/use-cliente-avaliacoes'
import type { Sexo } from '@/types/cliente'
import { cn } from '@/lib/utils'
import { EvolucaoChart } from '@/features/historico/components/evolucao-chart'
import { DetalheMetrica } from '@/features/historico/components/detalhe-metrica'
import { ResumoEvolucao } from '@/features/historico/components/comparacao-avaliacoes'
import { HistoricoCards } from '@/features/historico/components/historico-cards'
import { formatarData, rotuloSexo } from '@/features/historico/components/classificacao-utils'
import { calcularIdade, iniciais, tempoAcompanhamento } from '@/features/historico/components/laudo-utils'
import type { Metrica } from '@/features/historico/components/laudo-utils'
import type { AvaliacaoHistorico } from '@/types/avaliacao'
import type { Cliente } from '@/types/cliente'

function FormField({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-foreground text-xs font-medium">{label}</label>
      <Input {...props} />
    </div>
  )
}

function ClienteHeader({ cliente, avaliacoes }: { cliente: Cliente; avaliacoes: AvaliacaoHistorico[] }) {
  const desc = [...avaliacoes].sort((a, b) =>
    (b.data_avaliacao ?? '').localeCompare(a.data_avaliacao ?? ''),
  )
  const ultima = desc[0]
  const idade = calcularIdade(cliente.dataNascimento)
  const sexo = rotuloSexo(cliente.sexo)
  const identificacao = [sexo, idade != null ? `${idade} anos` : null].filter(Boolean).join(' \u00B7 ')
  const acompanhamento = tempoAcompanhamento(avaliacoes)

  return (
    <section className="border-b border-border/60 pb-6">
      <div className="flex items-center gap-4">
        <div className="bg-muted flex size-16 shrink-0 items-center justify-center rounded-2xl">
          <User size={28} className="text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-foreground mt-0.5 truncate text-2xl font-black tracking-tight">
            {cliente.fullName}
          </h2>
          <p className="text-muted-foreground mt-1 flex items-center gap-1.5 text-xs">
            <span className={cn('size-1.5 rounded-full', cliente.ativo ? 'bg-green-500' : 'bg-muted-foreground/40')} />
            {identificacao || 'Aluno'}
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-0.5">
          <p className="text-muted-foreground text-[11px] font-semibold uppercase leading-relaxed tracking-[0.12em]">
            {'\u00DA'}ltima avalia{'\u00E7'}{'\u00E3'}o
          </p>
          <p className="text-foreground text-base font-black tracking-tight">
            {formatarData(ultima?.data_avaliacao)}
          </p>
        </div>
        <div className="flex flex-col gap-0.5">
          <p className="text-muted-foreground text-[11px] font-semibold uppercase leading-relaxed tracking-[0.12em]">
            Avalia{'\u00E7'}{'\u00F5'}es
          </p>
          <p className="text-foreground text-base font-black tracking-tight">{avaliacoes.length}</p>
        </div>
        <div className="flex flex-col gap-0.5">
          <p className="text-muted-foreground text-[11px] font-semibold uppercase leading-relaxed tracking-[0.12em]">
            Acompanhamento
          </p>
          <p className="text-foreground text-base font-black tracking-tight">
            {acompanhamento ?? '\u2014'}
          </p>
        </div>
      </div>
    </section>
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

  const { data: avaliacoes, isLoading: carregandoAvaliacoes } = useClienteAvaliacoes(id)

  const [dadosOpen, setDadosOpen] = useState(false)
  const [laudoOpen, setLaudoOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [metricaAtiva, setMetricaAtiva] = useState<Metrica>('peso')
  const [metricasComparacao, setMetricasComparacao] = useState<Metrica[]>([])

  function handleMetricaChange(m: Metrica) {
    setMetricaAtiva(m)
    setMetricasComparacao((prev) => prev.filter((c) => c !== m))
  }

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    cpf: '',
    dataNascimento: '',
    sexo: '' as Sexo | '',
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
        sexo: cliente.sexo ?? '',
        rua: cliente.endereco?.rua ?? '',
        numero: cliente.endereco?.numero ?? '',
        cidade: cliente.endereco?.cidade ?? '',
        estado: cliente.endereco?.estado ?? '',
        cep: cliente.endereco?.cep ?? '',
        ativo: cliente.ativo,
      })
    }
  }, [cliente])

  const canSave = !!form.sexo

  const handleSave = async () => {
    if (!id || !canSave) return
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

  const temAvaliacoes = avaliacoes && avaliacoes.length > 0

  if (isLoading) {
    return (
      <PageLayout header={<div className="flex items-center gap-3"><BackButton onClick={() => navigate('/clientes')} /><h1 className="text-primary-foreground text-xl font-bold">Detalhes do aluno</h1></div>}>
        <div className="flex items-center justify-center py-12"><Loader2 size={20} className="text-muted-foreground animate-spin" /></div>
      </PageLayout>
    )
  }

  if (!cliente) {
    return (
      <PageLayout header={<div className="flex items-center gap-3"><BackButton onClick={() => navigate('/clientes')} /><h1 className="text-primary-foreground text-xl font-bold">Detalhes do aluno</h1></div>}>
        <p className="text-muted-foreground py-12 text-center text-sm">Aluno n{'\u00E3'}o encontrado</p>
      </PageLayout>
    )
  }

  return (
    <PageLayout
      header={
        <div className="flex items-center gap-3">
          <BackButton onClick={() => navigate('/clientes')} />
          <h1 className="text-primary-foreground flex-1 text-xl font-bold">Detalhes do aluno</h1>
          <Button
            onClick={() => navigate('/avaliacao/nova', { state: { clienteId: cliente.id } })}
            className="bg-muted rounded-xl px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/80 h-auto"
          >
            <ClipboardPlus size={16} />
            Avaliar
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        {temAvaliacoes && !carregandoAvaliacoes ? (
          <ClienteHeader cliente={cliente} avaliacoes={avaliacoes} />
        ) : (
          <div className="flex items-center gap-4 border-b border-border/60 pb-6">
            <div className="bg-muted flex size-16 shrink-0 items-center justify-center rounded-2xl">
              <User size={28} className="text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-foreground mt-0.5 truncate text-2xl font-black tracking-tight">
                {cliente.fullName}
              </h2>
              <p className="text-muted-foreground mt-1 flex items-center gap-1.5 text-xs">
                <span className={cn('size-1.5 rounded-full', cliente.ativo ? 'bg-green-500' : 'bg-muted-foreground/40')} />
                {cliente.ativo ? 'Ativo' : 'Inativo'}
              </p>
            </div>
          </div>
        )}

        <Collapsible open={dadosOpen} onOpenChange={setDadosOpen}>
          <div className="rounded-2xl border border-border/60 bg-background shadow-sm">
            <CollapsibleTrigger asChild>
              <button type="button" className="flex w-full items-center justify-between px-5 py-4 text-left">
                <div>
                  <p className="text-muted-foreground text-[11px] font-semibold uppercase tracking-[0.14em]">Cadastro</p>
                  <p className="text-foreground mt-0.5 text-base font-bold">Dados do cliente</p>
                </div>
                <ChevronDown size={16} className={cn('text-muted-foreground transition-transform duration-200', dadosOpen && 'rotate-180')} />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="flex flex-col gap-4 border-t border-foreground/5 px-5 py-4">
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
                    <Label className="text-foreground text-xs font-medium">Sexo</Label>
                    <Select
                      value={form.sexo}
                      onValueChange={(v) => setForm((p) => ({ ...p, sexo: v as Sexo }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MASCULINO">Masculino</SelectItem>
                        <SelectItem value="FEMININO">Feminino</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
                  <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Endere{'\u00E7'}o</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <FormField
                        label="Rua"
                        value={form.rua}
                        onChange={(e) => setForm((p) => ({ ...p, rua: e.target.value }))}
                      />
                    </div>
                    <FormField
                      label="N\u00FAmero"
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

                <div className="flex items-center justify-between rounded-xl bg-muted px-4 py-3">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Aluno ativo</Label>
                    <p className="text-muted-foreground text-xs">Desative para marcar como ex-aluno</p>
                  </div>
                  <Switch
                    checked={form.ativo}
                    onCheckedChange={(checked) => setForm((p) => ({ ...p, ativo: checked }))}
                  />
                </div>

                <Button className="w-full" onClick={handleSave} disabled={saving || !canSave}>
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

        <Collapsible open={laudoOpen} onOpenChange={setLaudoOpen}>
          <div className="rounded-2xl border border-border/60 bg-background shadow-sm">
            <CollapsibleTrigger asChild>
              <button type="button" className="flex w-full items-center justify-between px-5 py-4 text-left">
                <div>
                  <p className="text-muted-foreground text-[11px] font-semibold uppercase tracking-[0.14em]">Laudo</p>
                  <p className="text-foreground mt-0.5 text-base font-bold">Avalia{'\u00E7'}{'\u00F5'}es do aluno</p>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    Gr{'\u00E1'}ficos, evolu{'\u00E7'}{'\u00E3'}o e resultados por protocolo
                  </p>
                </div>
                <ChevronDown size={16} className={cn('text-muted-foreground transition-transform duration-200', laudoOpen && 'rotate-180')} />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="border-t border-foreground/5 px-5 py-4">
                {carregandoAvaliacoes ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 size={20} className="text-muted-foreground animate-spin" />
                  </div>
                ) : !temAvaliacoes ? (
                  <EmptyState
                    title="Nenhuma avalia\u00E7\u00E3o registrada"
                    description="As avalia\u00E7\u00F5es do aluno aparecer\u00E3o aqui em um relat\u00F3rio completo de evolu\u00E7\u00E3o."
                    action={
                      <Button onClick={() => navigate('/avaliacao/nova', { state: { clienteId: id } })}>
                        <ClipboardPlus size={16} />
                        Fazer primeira avalia{'\u00E7'}{'\u00E3'}o
                      </Button>
                    }
                  />
                ) : (
                  <div className="flex flex-col gap-8">
                    <EvolucaoChart
                      avaliacoes={avaliacoes}
                      metricaAtiva={metricaAtiva}
                      onMetricaChange={handleMetricaChange}
                      metricasComparacao={metricasComparacao}
                      onMetricasComparacaoChange={setMetricasComparacao}
                    />
                    <DetalheMetrica avaliacoes={avaliacoes} metrica={metricaAtiva} />
                    <ResumoEvolucao avaliacoes={avaliacoes} />
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        {temAvaliacoes && !carregandoAvaliacoes && (
          <HistoricoCards avaliacoes={avaliacoes} />
        )}
      </div>
    </PageLayout>
  )
}
