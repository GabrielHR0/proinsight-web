import { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { UserPlus, Loader2, Check, CalendarIcon, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { clienteService } from '@/services/cliente-service'
import { useAuth } from '@/stores/auth'
import type { ClienteFormData, ComImcResponse, Sexo } from '@/types/cliente'
import { cn } from '@/lib/utils'

interface FormData extends ClienteFormData {
  peso: string
  altura: string
  sexo: Sexo | undefined
}

const INITIAL_FORM: FormData = {
  fullName: '',
  email: '',
  phone: '',
  cpf: '',
  dataNascimento: '',
  sexo: undefined,
  rua: '',
  numero: '',
  cidade: '',
  estado: '',
  cep: '',
  ativo: true,
  peso: '',
  altura: '',
}

function FormField({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-foreground text-xs font-medium">{label}</label>
      <Input {...props} />
    </div>
  )
}

interface CadastroClienteFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function CadastroClienteForm({ onSuccess, onCancel }: CadastroClienteFormProps) {
  const { user } = useAuth()
  const [form, setForm] = useState<FormData>(INITIAL_FORM)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [medidasOpen, setMedidasOpen] = useState(false)
  const [imcResult, setImcResult] = useState<ComImcResponse | null>(null)

  const updateField = (field: keyof FormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const hasPesoAltura = form.peso !== '' && form.altura !== ''
  const canSubmit = !!form.sexo

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (hasPesoAltura) {
        const pesoGramas = Math.round(parseFloat(form.peso.replace(',', '.')) * 1000)
        const alturaCm = Math.round(parseFloat(form.altura.replace(',', '.')))
        const response = await clienteService.criarComImc({
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          cpf: form.cpf,
          dataNascimento: form.dataNascimento,
          sexo: form.sexo!,
          avaliadorId: user?.id,
          rua: form.rua || undefined,
          numero: form.numero || undefined,
          cidade: form.cidade || undefined,
          estado: form.estado || undefined,
          cep: form.cep || undefined,
          pesoGramas,
          alturaCm,
        })
        setImcResult(response)
      } else {
        await clienteService.criar({
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          cpf: form.cpf,
          dataNascimento: form.dataNascimento,
          sexo: form.sexo!,
          rua: form.rua,
          numero: form.numero,
          cidade: form.cidade,
          estado: form.estado,
          cep: form.cep,
        })
      }
      setSuccess(true)
      setTimeout(() => onSuccess?.(), 2500)
    } catch {
      setLoading(false)
    }
  }

  const selectedDate = form.dataNascimento ? new Date(form.dataNascimento + 'T00:00:00') : undefined

  if (success) {
    const imc = imcResult?.avaliacao?.extras?.imc
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
          <Check size={32} />
        </div>
        <p className="text-foreground text-base font-semibold">Aluno cadastrado!</p>
        {imc !== undefined && imc !== null && (
          <div className="mt-3 rounded-xl border border-border px-4 py-3">
            <p className="text-muted-foreground text-xs">IMC calculado</p>
            <p className="text-foreground text-2xl font-bold">{imc.toFixed(1)}</p>
            <p className="text-muted-foreground text-xs">
              {imcResult?.avaliacao?.classificacao}
            </p>
          </div>
        )}
        <p className="text-muted-foreground mt-2 text-sm">Redirecionando...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Dados Pessoais</h2>
        <div className="flex flex-col gap-3">
          <FormField
            label="Nome completo"
            placeholder="Nome do aluno"
            value={form.fullName}
            onChange={(e) => updateField('fullName', e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <FormField
              label="E-mail"
              type="email"
              placeholder="email@exemplo.com"
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
              required
            />
            <FormField
              label="Telefone"
              placeholder="(11) 99999-9999"
              value={form.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              required
            />
          </div>
          <FormField
            label="CPF"
            placeholder="000.000.000-00"
            value={form.cpf}
            onChange={(e) => updateField('cpf', e.target.value)}
            required
          />
          <div className="flex flex-col gap-1.5">
            <Label className="text-foreground text-xs font-medium">Sexo</Label>
            <Select
              value={form.sexo ?? ''}
              onValueChange={(v) => updateField('sexo', v as Sexo)}
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
                      updateField('dataNascimento', format(date, 'yyyy-MM-dd'))
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
      </div>

      <Collapsible open={medidasOpen} onOpenChange={setMedidasOpen}>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="text-foreground flex w-full items-center justify-between rounded-xl border border-border px-4 py-3 text-sm font-medium"
          >
            Medidas corporais
            <ChevronDown
              size={16}
              className={cn(
                'text-muted-foreground transition-transform duration-200',
                medidasOpen && 'rotate-180',
              )}
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="flex flex-col gap-3 px-4 py-3">
            <div className="grid grid-cols-2 gap-3">
              <FormField
                label="Peso (kg)"
                type="number"
                inputMode="decimal"
                step="0.1"
                min="1"
                placeholder="Ex: 75.5"
                value={form.peso}
                onChange={(e) => updateField('peso', e.target.value)}
              />
              <FormField
                label="Altura (cm)"
                type="number"
                inputMode="decimal"
                step="0.1"
                min="1"
                placeholder="Ex: 175"
                value={form.altura}
                onChange={(e) => updateField('altura', e.target.value)}
              />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Endereço</h2>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <FormField
                label="Rua"
                placeholder="Rua"
                value={form.rua}
                onChange={(e) => updateField('rua', e.target.value)}
              />
            </div>
            <FormField
              label="Número"
              placeholder="Nº"
              value={form.numero}
              onChange={(e) => updateField('numero', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField
              label="Cidade"
              placeholder="Cidade"
              value={form.cidade}
              onChange={(e) => updateField('cidade', e.target.value)}
            />
            <FormField
              label="Estado"
              placeholder="Estado"
              value={form.estado}
              onChange={(e) => updateField('estado', e.target.value)}
            />
          </div>
          <FormField
            label="CEP"
            placeholder="00000-000"
            value={form.cep}
            onChange={(e) => updateField('cep', e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
        <div className="space-y-0.5">
          <Label className="text-sm font-medium">Aluno ativo</Label>
          <p className="text-muted-foreground text-xs">Desative para marcar como ex-aluno</p>
        </div>
        <Switch
          checked={form.ativo ?? true}
          onCheckedChange={(checked) => updateField('ativo', checked)}
        />
      </div>

      <div className="flex gap-3">
        {onCancel && (
          <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={loading || !canSubmit} className="flex-1">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              Cadastrando...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <UserPlus size={16} />
              Cadastrar
            </span>
          )}
        </Button>
      </div>
    </form>
  )
}
