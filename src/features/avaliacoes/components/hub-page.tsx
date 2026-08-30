import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, Activity, Search } from 'lucide-react'
import { CATEGORY_ICON } from '@/components/category-icons'
import { PageLayout } from '@/components/layout/page-layout'
import { BackButton } from '@/components/ui/back-button'
import { EmptyState } from '@/components/empty-state'
import { ComboboxMobile } from '@/components/combobox-mobile'
import type { ComboboxMobileItem } from '@/components/combobox-mobile'
import { useProtocoloHub, useFavoritar, useDesfavoritar } from '@/hooks/use-protocolo-hub'
import { cn } from '@/lib/utils'
import type { ProtocoloResumo } from '@/types/protocolo'

import { StarIcon } from '@/components/star-icon'

const CATEGORY_LABEL: Record<string, string> = {
  VO2_MAX: 'VO₂ Máx',
  IMC: 'IMC',
  BIOIMPEDANCIA: 'Bioimpedância',
  FORCA: 'Força',
  FLEXIBILIDADE: 'Flexibilidade',
}

const KNOWN_CATEGORIES = ['VO2_MAX', 'IMC', 'BIOIMPEDANCIA', 'FORCA', 'FLEXIBILIDADE']

function getProtocolIcon(categoria: string) {
  return CATEGORY_ICON[categoria] ?? Activity
}

function SectionIcon({ categoria, className }: { categoria: string; className?: string }) {
  const Icon = CATEGORY_ICON[categoria] ?? Activity
  return <Icon size={18} className={className} />
}

export function HubPage() {
  const navigate = useNavigate()

  const [busca, setBusca] = useState('')

  const { data: hub, isLoading } = useProtocoloHub()
  const favoritarMutation = useFavoritar()
  const desfavoritarMutation = useDesfavoritar()

  const favoritoIds = new Set(hub?.favoritos.map((f) => f.id) ?? [])

  const handleFavoritar = (protocoloId: string) => {
    favoritarMutation.mutate(protocoloId)
  }

  const handleDesfavoritar = (protocoloId: string) => {
    desfavoritarMutation.mutate(protocoloId)
  }

  const handleProtocoloClick = (protocolo: ProtocoloResumo) => {
    navigate(`/avaliacoes/protocolo/${protocolo.id}`)
  }

  const buildItems = useMemo(
    () =>
      (protocolos: ProtocoloResumo[]): ComboboxMobileItem<ProtocoloResumo>[] =>
        protocolos.map((p) => ({
          data: p,
          icon: getProtocolIcon(p.categoria),
          label: p.nome,
          subtitle: p.descricao ?? undefined,
          value: p.padrao ? 'Padrão' : undefined,
        })),
    [],
  )

  const renderStarAction = (protocolo: ProtocoloResumo) => (
    <button
      type="button"
      onClick={() =>
        favoritoIds.has(protocolo.id)
          ? handleDesfavoritar(protocolo.id)
          : handleFavoritar(protocolo.id)
      }
      className="flex size-8 items-center justify-center"
    >
      <StarIcon
        filled={favoritoIds.has(protocolo.id)}
        className={cn(
          'size-5',
          favoritoIds.has(protocolo.id) ? 'text-link' : 'text-muted-foreground',
        )}
      />
    </button>
  )

  const favoritos = hub?.favoritos ?? []
  const porCategoria = hub?.porCategoria ?? {}

  const matchesBusca = (p: ProtocoloResumo) => {
    if (!busca) return true
    const q = busca.toLowerCase()
    return (
      p.nome.toLowerCase().includes(q) ||
      p.descricao?.toLowerCase().includes(q) ||
      (CATEGORY_LABEL[p.categoria] ?? p.categoria).toLowerCase().includes(q)
    )
  }

  const favoritosFiltered = useMemo(() => favoritos.filter(matchesBusca), [favoritos, busca])
  const porCategoriaFiltered = useMemo(() => {
    const result: Record<string, ProtocoloResumo[]> = {}
    for (const [key, items] of Object.entries(porCategoria)) {
      const filtered = items.filter(matchesBusca)
      if (filtered.length > 0) result[key] = filtered
    }
    return result
  }, [porCategoria, busca])

  const favoritoItems = useMemo(() => buildItems(favoritosFiltered), [buildItems, favoritosFiltered])

  const sections = useMemo(() => {
    const known = KNOWN_CATEGORIES.filter((k) => (porCategoriaFiltered[k]?.length ?? 0) > 0).map((k) => ({
      key: k,
      label: CATEGORY_LABEL[k] ?? k,
      items: buildItems(porCategoriaFiltered[k]),
    }))
    const unknown = Object.keys(porCategoriaFiltered)
      .filter((k) => !KNOWN_CATEGORIES.includes(k) && (porCategoriaFiltered[k]?.length ?? 0) > 0)
    if (unknown.length > 0) {
      known.push({
        key: 'sem_categoria',
        label: 'Sem categoria',
        items: unknown.flatMap((k) => buildItems(porCategoriaFiltered[k])),
      })
    }
    return known
  }, [porCategoriaFiltered, buildItems])

  if (isLoading) {
    return (
      <PageLayout
        header={
          <div className="flex items-center gap-3">
            <h1 className="text-foreground text-2xl font-bold">Protocolos</h1>
          </div>
        }
      >
        <div className="flex items-center justify-center py-12">
          <Loader2 className="text-muted-foreground size-6 animate-spin" />
        </div>
      </PageLayout>
    )
  }

  const temConteudo = favoritoItems.length > 0 || sections.length > 0

  return (
    <PageLayout
      header={
        <div className="flex items-center gap-3">
          <BackButton onClick={() => navigate('/')} />
          <div>
            <h1 className="text-primary-foreground text-2xl font-bold">Protocolos</h1>
            <p className="text-primary-foreground/80 mt-0.5 text-sm">Consulte, favorite e encontre protocolos</p>
          </div>
        </div>
      }
    >
      {!temConteudo ? (
        <EmptyState title="Nenhum protocolo disponível" />
      ) : (
        <div className="flex flex-col gap-8">
          {/* Busca global */}
          <div className="relative">
            <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar protocolos..."
              className="bg-muted text-foreground placeholder:text-muted-foreground w-full rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Favoritos */}
          {favoritoItems.length > 0 ? (
            <section>
              <div className="mb-4 flex items-center gap-2">
                <StarIcon filled className="size-5 text-link" />
                <h2 className="text-foreground text-lg font-semibold">Favoritos</h2>
              </div>
              <ComboboxMobile<ProtocoloResumo>
                items={favoritoItems}
                onSelect={handleProtocoloClick}
                showSearch={false}
                showSort={false}
                hidePagination
                renderActions={renderStarAction}
              />
            </section>
          ) : favoritos.length === 0 && !busca ? (
            <section className="rounded-2xl border border-dashed border-border/60 bg-muted/30 px-6 py-8 text-center">
              <StarIcon className="text-muted-foreground mx-auto mb-3 size-8 opacity-40" />
              <p className="text-foreground text-sm font-medium">Nenhum favorito ainda</p>
              <p className="text-muted-foreground mt-1 text-xs">Toque na estrela de um protocolo para encontrá-lo rápido aqui</p>
            </section>
          ) : null}

          {/* Categorias */}
          {sections.map((section) => (
            <section key={section.key}>
              <div className="mb-4 flex items-center gap-2">
                <SectionIcon categoria={section.key} className="text-link" />
                <h2 className="text-foreground text-lg font-semibold">{section.label}</h2>
              </div>
              <ComboboxMobile<ProtocoloResumo>
                items={section.items}
                onSelect={handleProtocoloClick}
                showSearch={false}
                showSort={false}
                hidePagination
                renderActions={renderStarAction}
              />
            </section>
          ))}

          {/* Sem resultados na busca */}
          {busca && favoritoItems.length === 0 && sections.length === 0 && (
            <p className="text-muted-foreground py-8 text-center text-sm">
              Nenhum protocolo encontrado para "{busca}"
            </p>
          )}
        </div>
      )}
    </PageLayout>
  )
}
