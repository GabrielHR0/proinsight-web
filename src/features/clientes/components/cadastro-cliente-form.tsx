import { useState } from 'react'
import { UserPlus, Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { clienteService } from '@/services/cliente-service'
import type { ClienteFormData } from '@/types/cliente'

const INITIAL_FORM: ClienteFormData = {
  fullName: '',
  email: '',
  phone: '',
  cpf: '',
  rua: '',
  numero: '',
  cidade: '',
  estado: '',
  cep: '',
  ativo: true,
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
  const [form, setForm] = useState<ClienteFormData>(INITIAL_FORM)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const updateField = (field: keyof ClienteFormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await clienteService.criar(form)
      setSuccess(true)
      setTimeout(() => onSuccess?.(), 1500)
    } catch {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
          <Check size={32} />
        </div>
        <p className="text-foreground text-base font-semibold">Aluno cadastrado!</p>
        <p className="text-muted-foreground mt-1 text-sm">Redirecionando...</p>
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
        </div>
      </div>

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
        <Button type="submit" disabled={loading} className="flex-1">
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
