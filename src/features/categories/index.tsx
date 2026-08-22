import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Activity, Loader2, SearchX } from 'lucide-react'
import { CATEGORY_ICON } from '@/components/category-icons'
import { PageLayout } from '@/components/layout/page-layout'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/empty-state'
import { BackButton } from '@/components/ui/back-button'
import { useProtocoloHub } from '@/hooks/use-protocolo-hub'

const CATEGORY_LABEL: Record<string, string> = {
  VO2_MAX: 'VO₂ Máx',
  IMC: 'IMC',
  BIOIMPEDANCIA: 'Bioimpedância',
  FORCA: 'Força',
  FLEXIBILIDADE: 'Flexibilidade',
}

export function CategoriesPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const { data: hub, isLoading } = useProtocoloHub()

  const sections = useMemo(() => {
    const porCategoria = hub?.porCategoria ?? {}
    const categorias = Object.keys(porCategoria).filter((cat) => (porCategoria[cat]?.length ?? 0) > 0)
    const term = search.trim().toLowerCase()

    return categorias
      .map((cat) => ({
        id: cat,
        label: CATEGORY_LABEL[cat] ?? cat,
        protocols: (porCategoria[cat] ?? []).filter(
          (p) =>
            term === '' ||
            p.nome.toLowerCase().includes(term) ||
            (p.descricao ?? '').toLowerCase().includes(term),
        ),
      }))
      .filter((sec) => sec.protocols.length > 0)
  }, [hub, search])

  return (
    <PageLayout
      header={
        <div className="flex items-center gap-3">
          <BackButton onClick={() => navigate('/')} />
          <div>
            <h1 className="text-primary-foreground text-2xl font-bold">Categorias</h1>
            <p className="text-primary-foreground/80 mt-0.5 text-sm">Explore protocolos por categoria</p>
          </div>
        </div>
      }
    >
      <div className="relative mb-6">
        <Search size={16} className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2" />
        <Input
          placeholder="Buscar protocolos..."
          className="bg-background pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="text-muted-foreground size-6 animate-spin" />
        </div>
      ) : sections.length === 0 ? (
        <EmptyState
          icon={<SearchX size={40} strokeWidth={1.5} />}
          title="Nenhum protocolo encontrado"
          description={search ? 'Ajuste a busca para ver resultados' : 'Nenhum protocolo disponível ainda'}
        />
      ) : (
        <div className="flex flex-col gap-8">
          {sections.map((cat) => {
            const Icon = CATEGORY_ICON[cat.id]
            return (
              <section key={cat.id}>
                <div className="mb-3 flex items-center gap-2.5">
                  {Icon && <Icon size={18} className="text-primary" />}
                  <h2 className="text-foreground text-lg font-semibold">{cat.label}</h2>
                </div>
                <div className="flex flex-col gap-2">
                  {cat.protocols.map((p) => (
                    <div
                      key={p.id}
                      className="border-border hover:bg-muted flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors"
                      onClick={() => navigate(`/avaliacoes/protocolo/${p.id}`)}
                    >
                      <Activity size={16} className="text-muted-foreground shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-foreground text-sm font-medium">{p.nome}</p>
                        {p.descricao && <p className="text-muted-foreground text-xs">{p.descricao}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </PageLayout>
  )
}