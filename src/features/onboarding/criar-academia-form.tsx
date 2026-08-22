import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { isAxiosError } from 'axios'
import { useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { authService } from '@/services/auth-service'
import { tokenStorage } from '@/lib/token'
import { useAuth } from '@/stores/auth'
import { Building2, FileText, Phone, MapPin, AlertCircle, CheckCircle } from 'lucide-react'

const criarAcademiaSchema = z.object({
  nomeFantasia: z.string().min(2, 'Nome é obrigatório'),
  cnpj: z.string().optional(),
  razaoSocial: z.string().optional(),
  telefone: z.string().optional(),
  endereco: z.object({
    rua: z.string().min(1, 'Rua é obrigatória'),
    numero: z.string().optional(),
    cidade: z.string().min(1, 'Cidade é obrigatória'),
    estado: z.string().min(1, 'Estado é obrigatório'),
    cep: z.string().min(1, 'CEP é obrigatório'),
  }).optional(),
})

type CriarAcademiaInput = z.infer<typeof criarAcademiaSchema>

interface CriarAcademiaFormProps {
  onSuccess: () => void
}

export function CriarAcademiaForm({ onSuccess }: CriarAcademiaFormProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CriarAcademiaInput>({
    resolver: zodResolver(criarAcademiaSchema),
  })

  async function onSubmit(data: CriarAcademiaInput) {
    setError(null)
    try {
      const { data: academia } = await api.post<{ id: string }>('/academias', { ...data, ownerId: user?.id })
      localStorage.setItem('proinsight_academia_id', academia.id)
      try {
        const refreshToken = tokenStorage.getRefreshToken()
        if (refreshToken) {
          const { data: refreshed } = await authService.refresh(refreshToken)
          tokenStorage.set(refreshed.token, refreshed.refreshToken)
        }
      } catch {
        // fallback: token antigo continua válido para a academia recém-criada
      }
      onSuccess()
      navigate('/', { replace: true })
    } catch (err) {
      if (isAxiosError(err) && err.response?.data) {
        const body = err.response.data as Record<string, unknown>
        setError(String(body.message ?? body.detail ?? 'Erro ao criar academia'))
      } else {
        setError('Erro de conexão. Tente novamente.')
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <div className="mb-4 flex items-center gap-2">
          <Building2 size={16} className="text-primary shrink-0" />
          <p className="text-foreground text-sm font-semibold">Dados da academia</p>
        </div>

        <div className="group mb-4">
          <label htmlFor="nomeFantasia" className="text-foreground mb-1.5 block text-sm font-medium">Nome fantasia</label>
          <div className="relative">
            <Building2 size={16} className="text-muted-foreground group-focus-within:text-primary absolute left-3 top-1/2 -translate-y-1/2 transition-colors" />
            <input
              id="nomeFantasia"
              className="bg-background text-foreground ring-border focus:ring-primary/30 w-full rounded-xl border border-border py-2.5 pl-10 pr-3 text-sm outline-none ring-0 transition-all focus:ring-2"
              {...register('nomeFantasia')}
            />
          </div>
          {errors.nomeFantasia && (
            <p className="text-destructive mt-1 flex items-center gap-1 text-xs">
              <AlertCircle size={12} /> {errors.nomeFantasia.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="group">
            <label htmlFor="cnpj" className="text-foreground mb-1.5 block text-sm font-medium">CNPJ <span className="text-muted-foreground font-normal">(opcional)</span></label>
            <div className="relative">
              <FileText size={16} className="text-muted-foreground group-focus-within:text-primary absolute left-3 top-1/2 -translate-y-1/2 transition-colors" />
              <input id="cnpj" className="bg-background text-foreground ring-border focus:ring-primary/30 w-full rounded-xl border border-border py-2.5 pl-10 pr-3 text-sm outline-none ring-0 transition-all focus:ring-2" {...register('cnpj')} />
            </div>
          </div>
          <div className="group">
            <label htmlFor="telefone" className="text-foreground mb-1.5 block text-sm font-medium">Telefone <span className="text-muted-foreground font-normal">(opcional)</span></label>
            <div className="relative">
              <Phone size={16} className="text-muted-foreground group-focus-within:text-primary absolute left-3 top-1/2 -translate-y-1/2 transition-colors" />
              <input id="telefone" className="bg-background text-foreground ring-border focus:ring-primary/30 w-full rounded-xl border border-border py-2.5 pl-10 pr-3 text-sm outline-none ring-0 transition-all focus:ring-2" {...register('telefone')} />
            </div>
          </div>
        </div>

        <div className="group mt-3">
          <label htmlFor="razaoSocial" className="text-foreground mb-1.5 block text-sm font-medium">Razão social <span className="text-muted-foreground font-normal">(opcional)</span></label>
          <div className="relative">
            <FileText size={16} className="text-muted-foreground group-focus-within:text-primary absolute left-3 top-1/2 -translate-y-1/2 transition-colors" />
            <input id="razaoSocial" className="bg-background text-foreground ring-border focus:ring-primary/30 w-full rounded-xl border border-border py-2.5 pl-10 pr-3 text-sm outline-none ring-0 transition-all focus:ring-2" {...register('razaoSocial')} />
          </div>
        </div>
      </div>

      <div className="border-border/50 border-t pt-6">
        <div className="mb-4 flex items-center gap-2">
          <MapPin size={16} className="text-primary shrink-0" />
          <p className="text-foreground text-sm font-semibold">Endereço <span className="text-muted-foreground font-normal">(opcional)</span></p>
        </div>

        <div className="group mb-3">
          <label htmlFor="endereco.rua" className="text-foreground mb-1.5 block text-sm font-medium">Rua</label>
          <div className="relative">
            <MapPin size={16} className="text-muted-foreground group-focus-within:text-primary absolute left-3 top-1/2 -translate-y-1/2 transition-colors" />
            <input id="endereco.rua" className="bg-background text-foreground ring-border focus:ring-primary/30 w-full rounded-xl border border-border py-2.5 pl-10 pr-3 text-sm outline-none ring-0 transition-all focus:ring-2" {...register('endereco.rua')} />
          </div>
          {errors.endereco?.rua && (
            <p className="text-destructive mt-1 flex items-center gap-1 text-xs">
              <AlertCircle size={12} /> {errors.endereco.rua.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="group">
            <label htmlFor="endereco.numero" className="text-foreground mb-1.5 block text-sm font-medium">Número</label>
            <input id="endereco.numero" className="bg-background text-foreground ring-border focus:ring-primary/30 w-full rounded-xl border border-border py-2.5 px-3 text-sm outline-none ring-0 transition-all focus:ring-2" {...register('endereco.numero')} />
          </div>
          <div className="group">
            <label htmlFor="endereco.cidade" className="text-foreground mb-1.5 block text-sm font-medium">Cidade</label>
            <input id="endereco.cidade" className="bg-background text-foreground ring-border focus:ring-primary/30 w-full rounded-xl border border-border py-2.5 px-3 text-sm outline-none ring-0 transition-all focus:ring-2" {...register('endereco.cidade')} />
            {errors.endereco?.cidade && (
              <p className="text-destructive mt-1 flex items-center gap-1 text-xs">
                <AlertCircle size={12} /> {errors.endereco.cidade.message}
              </p>
            )}
          </div>
          <div className="group">
            <label htmlFor="endereco.estado" className="text-foreground mb-1.5 block text-sm font-medium">Estado</label>
            <input id="endereco.estado" className="bg-background text-foreground ring-border focus:ring-primary/30 w-full rounded-xl border border-border py-2.5 px-3 text-sm outline-none ring-0 transition-all focus:ring-2" {...register('endereco.estado')} />
            {errors.endereco?.estado && (
              <p className="text-destructive mt-1 flex items-center gap-1 text-xs">
                <AlertCircle size={12} /> {errors.endereco.estado.message}
              </p>
            )}
          </div>
          <div className="group">
            <label htmlFor="endereco.cep" className="text-foreground mb-1.5 block text-sm font-medium">CEP</label>
            <input id="endereco.cep" className="bg-background text-foreground ring-border focus:ring-primary/30 w-full rounded-xl border border-border py-2.5 px-3 text-sm outline-none ring-0 transition-all focus:ring-2" {...register('endereco.cep')} />
            {errors.endereco?.cep && (
              <p className="text-destructive mt-1 flex items-center gap-1 text-xs">
                <AlertCircle size={12} /> {errors.endereco.cep.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm">
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-primary text-primary-foreground hover:bg-primary/90 flex w-full items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold shadow-sm transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Criando...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <CheckCircle size={16} />
            Criar academia
          </span>
        )}
      </button>
    </form>
  )
}
