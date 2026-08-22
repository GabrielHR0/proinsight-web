import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, Activity } from 'lucide-react'
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

  const favoritoItems = useMemo(() => buildItems(favoritos), [buildItems, favoritos])

  const sections = useMemo(() => {
    const known = KNOWN_CATEGORIES.filter((k) => (porCategoria[k]?.length ?? 0) > 0).map((k) => ({
      key: k,
      label: CATEGORY_LABEL[k] ?? k,
      items: buildItems(porCategoria[k]),
    }))
    const unknown = Object.keys(porCategoria)
      .filter((k) => !KNOWN_CATEGORIES.includes(k) && (porCategoria[k]?.length ?? 0) > 0)
    if (unknown.length > 0) {
      known.push({
        key: 'sem_categoria',
        label: 'Sem categoria',
        items: unknown.flatMap((k) => buildItems(porCategoria[k])),
      })
    }
    return known
  }, [porCategoria, buildItems])

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
            <h1 className="text-foreground text-2xl font-bold">Protocolos</h1>
            <p className="text-muted-foreground text-sm">Selecione um protocolo para realizar</p>
          </div>
        </div>
      }
    >
      {!temConteudo ? (
        <EmptyState title="Nenhum protocolo disponível" />
      ) : (
        <div className="flex flex-col gap-8">
          {/* Favoritos */}
          {favoritoItems.length > 0 && (
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
          )}

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
        </div>
      )}
    </PageLayout>
  )
}
