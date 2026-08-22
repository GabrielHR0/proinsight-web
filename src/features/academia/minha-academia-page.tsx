import { useState, useEffect } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useMinhaAcademia, useAtualizarAcademia } from '@/hooks/use-minha-academia'
import { isAxiosError } from 'axios'
import {
  Building2, FileText, Phone, MapPin, AlertCircle, CheckCircle, Loader2, Pencil, X
} from 'lucide-react'
import { PageLayout } from '@/components/layout/page-layout'
import { BackButton } from '@/components/ui/back-button'
import { Button } from '@/components/ui/button'

const academiaSchema = z.object({
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

type AcademiaInput = z.infer<typeof academiaSchema>

export function MinhaAcademiaPage() {
  const navigate = useNavigate()
  const { data: academia, isLoading, error: loadError } = useMinhaAcademia()
  const atualizar = useAtualizarAcademia()
  const [editando, setEditando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AcademiaInput>()

  useEffect(() => {
    if (academia) {
      reset({
        nomeFantasia: academia.nomeFantasia,
        razaoSocial: academia.razaoSocial ?? '',
        cnpj: academia.cnpj ?? '',
        telefone: academia.telefone ?? '',
        endereco: academia.endereco ? {
          rua: academia.endereco.rua,
          numero: academia.endereco.numero ?? '',
          cidade: academia.endereco.cidade,
          estado: academia.endereco.estado,
          cep: academia.endereco.cep,
        } : undefined,
      })
    }
  }, [academia, reset])

  async function onSubmit(data: AcademiaInput) {
    setError(null)
    try {
      await atualizar.mutateAsync(data)
      setEditando(false)
    } catch (err) {
      if (isAxiosError(err) && err.response?.data) {
        const body = err.response.data as Record<string, unknown>
        setError(String(body.message ?? body.detail ?? 'Erro ao atualizar'))
      } else {
        setError('Erro de conexão. Tente novamente.')
      }
    }
  }

  if (isLoading) {
    return (
      <PageLayout header={<div className="flex items-center gap-3"><BackButton onClick={() => navigate(-1)} /><h1 className="text-primary-foreground text-xl font-bold">Minha Academia</h1></div>}>
        <div className="flex items-center justify-center py-12"><Loader2 size={20} className="text-muted-foreground animate-spin" /></div>
      </PageLayout>
    )
  }

  if (loadError || !academia) {
    return <Navigate to="/onboarding" replace />
  }

  return (
    <PageLayout
      header={
        <div className="flex items-center gap-3">
          <BackButton onClick={() => navigate(-1)} />
          <h1 className="text-primary-foreground flex-1 text-xl font-bold">Minha Academia</h1>
          <button
            type="button"
            onClick={() => setEditando(!editando)}
            className="bg-muted flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/80"
          >
            {editando ? <X size={16} /> : <Pencil size={16} />}
            {editando ? 'Cancelar' : 'Editar'}
          </button>
        </div>
      }
    >
      {editando ? (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="rounded-2xl border border-border/60 bg-background p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Building2 size={16} className="text-primary shrink-0" />
              <p className="text-foreground text-sm font-semibold">Dados da academia</p>
            </div>

            <div className="group mb-4">
              <label htmlFor="nomeFantasia" className="text-foreground mb-1.5 block text-sm font-medium">Nome fantasia</label>
              <div className="relative">
                <Building2 size={16} className="text-muted-foreground group-focus-within:text-primary absolute left-3 top-1/2 -translate-y-1/2 transition-colors" />
                <input id="nomeFantasia" className="bg-background text-foreground ring-border focus:ring-primary/30 w-full rounded-xl border border-border py-2.5 pl-10 pr-3 text-sm outline-none ring-0 transition-all focus:ring-2" {...register('nomeFantasia')} />
              </div>
              {errors.nomeFantasia && <p className="text-destructive mt-1 flex items-center gap-1 text-xs"><AlertCircle size={12} /> {errors.nomeFantasia.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="group">
                <label htmlFor="cnpj" className="text-foreground mb-1.5 block text-sm font-medium">CNPJ</label>
                <div className="relative">
                  <FileText size={16} className="text-muted-foreground group-focus-within:text-primary absolute left-3 top-1/2 -translate-y-1/2 transition-colors" />
                  <input id="cnpj" className="bg-background text-foreground ring-border focus:ring-primary/30 w-full rounded-xl border border-border py-2.5 pl-10 pr-3 text-sm outline-none ring-0 transition-all focus:ring-2" {...register('cnpj')} />
                </div>
              </div>
              <div className="group">
                <label htmlFor="telefone" className="text-foreground mb-1.5 block text-sm font-medium">Telefone</label>
                <div className="relative">
                  <Phone size={16} className="text-muted-foreground group-focus-within:text-primary absolute left-3 top-1/2 -translate-y-1/2 transition-colors" />
                  <input id="telefone" className="bg-background text-foreground ring-border focus:ring-primary/30 w-full rounded-xl border border-border py-2.5 pl-10 pr-3 text-sm outline-none ring-0 transition-all focus:ring-2" {...register('telefone')} />
                </div>
              </div>
            </div>

            <div className="group mt-3">
              <label htmlFor="razaoSocial" className="text-foreground mb-1.5 block text-sm font-medium">Razão social</label>
              <div className="relative">
                <FileText size={16} className="text-muted-foreground group-focus-within:text-primary absolute left-3 top-1/2 -translate-y-1/2 transition-colors" />
                <input id="razaoSocial" className="bg-background text-foreground ring-border focus:ring-primary/30 w-full rounded-xl border border-border py-2.5 pl-10 pr-3 text-sm outline-none ring-0 transition-all focus:ring-2" {...register('razaoSocial')} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-background p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <MapPin size={16} className="text-primary shrink-0" />
              <p className="text-foreground text-sm font-semibold">Endereço</p>
            </div>

            <div className="group mb-3">
              <label htmlFor="endereco.rua" className="text-foreground mb-1.5 block text-sm font-medium">Rua</label>
              <div className="relative">
                <MapPin size={16} className="text-muted-foreground group-focus-within:text-primary absolute left-3 top-1/2 -translate-y-1/2 transition-colors" />
                <input id="endereco.rua" className="bg-background text-foreground ring-border focus:ring-primary/30 w-full rounded-xl border border-border py-2.5 pl-10 pr-3 text-sm outline-none ring-0 transition-all focus:ring-2" {...register('endereco.rua')} />
              </div>
              {errors.endereco?.rua && <p className="text-destructive mt-1 flex items-center gap-1 text-xs"><AlertCircle size={12} /> {errors.endereco.rua.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="group">
                <label htmlFor="endereco.numero" className="text-foreground mb-1.5 block text-sm font-medium">Número</label>
                <input id="endereco.numero" className="bg-background text-foreground ring-border focus:ring-primary/30 w-full rounded-xl border border-border py-2.5 px-3 text-sm outline-none ring-0 transition-all focus:ring-2" {...register('endereco.numero')} />
              </div>
              <div className="group">
                <label htmlFor="endereco.cidade" className="text-foreground mb-1.5 block text-sm font-medium">Cidade</label>
                <input id="endereco.cidade" className="bg-background text-foreground ring-border focus:ring-primary/30 w-full rounded-xl border border-border py-2.5 px-3 text-sm outline-none ring-0 transition-all focus:ring-2" {...register('endereco.cidade')} />
                {errors.endereco?.cidade && <p className="text-destructive mt-1 flex items-center gap-1 text-xs"><AlertCircle size={12} /> {errors.endereco.cidade.message}</p>}
              </div>
              <div className="group">
                <label htmlFor="endereco.estado" className="text-foreground mb-1.5 block text-sm font-medium">Estado</label>
                <input id="endereco.estado" className="bg-background text-foreground ring-border focus:ring-primary/30 w-full rounded-xl border border-border py-2.5 px-3 text-sm outline-none ring-0 transition-all focus:ring-2" {...register('endereco.estado')} />
                {errors.endereco?.estado && <p className="text-destructive mt-1 flex items-center gap-1 text-xs"><AlertCircle size={12} /> {errors.endereco.estado.message}</p>}
              </div>
              <div className="group">
                <label htmlFor="endereco.cep" className="text-foreground mb-1.5 block text-sm font-medium">CEP</label>
                <input id="endereco.cep" className="bg-background text-foreground ring-border focus:ring-primary/30 w-full rounded-xl border border-border py-2.5 px-3 text-sm outline-none ring-0 transition-all focus:ring-2" {...register('endereco.cep')} />
                {errors.endereco?.cep && <p className="text-destructive mt-1 flex items-center gap-1 text-xs"><AlertCircle size={12} /> {errors.endereco.cep.message}</p>}
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Salvando...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <CheckCircle size={16} />
                Salvar alterações
              </span>
            )}
          </Button>
        </form>
      ) : (
        <div className="flex flex-col gap-6">
          <section className="flex items-center gap-4">
            <div className="bg-muted flex size-16 shrink-0 items-center justify-center rounded-2xl">
              <Building2 size={28} className="text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-muted-foreground text-[11px] font-semibold uppercase tracking-[0.14em]">
                Minha academia
              </p>
              <h2 className="text-foreground mt-0.5 truncate text-3xl font-black tracking-tight">{academia.nomeFantasia}</h2>
              {academia.cnpj && (
                <p className="text-muted-foreground mt-1 text-xs">CNPJ: {academia.cnpj}</p>
              )}
            </div>
          </section>

          <div className="flex flex-col divide-y divide-foreground/5">
            {academia.razaoSocial && (
              <div className="flex items-center justify-between gap-4 py-3.5">
                <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-[0.14em]">Razão social</span>
                <span className="text-foreground text-right text-sm font-semibold">{academia.razaoSocial}</span>
              </div>
            )}
            {academia.telefone && (
              <div className="flex items-center justify-between gap-4 py-3.5">
                <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-[0.14em]">Telefone</span>
                <span className="text-foreground text-sm font-semibold">{academia.telefone}</span>
              </div>
            )}
            {academia.endereco && (
              <div className="flex items-start justify-between gap-4 py-3.5">
                <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-[0.14em]">Endereço</span>
                <span className="text-foreground text-right text-sm font-semibold">
                  {academia.endereco.rua}{academia.endereco.numero ? `, ${academia.endereco.numero}` : ''}
                  <br />
                  {academia.endereco.cidade} — {academia.endereco.estado}
                  <br />
                  CEP: {academia.endereco.cep}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </PageLayout>
  )
}