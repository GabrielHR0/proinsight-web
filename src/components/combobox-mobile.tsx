import { useState, useMemo } from 'react'
import { Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ListFilter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type SortDirection = 'asc' | 'desc'

type SearchableField = 'label' | 'subtitle' | 'value'

export interface FilterOption {
  label: string
  value: string
}

export interface ComboboxMobileItem<T> {
  data: T
  icon: React.ComponentType<{ size?: number; className?: string }>
  label: string
  subtitle?: string
  value?: string
  meta?: string
}

interface ComboboxMobileProps<T> {
  items: ComboboxMobileItem<T>[]
  onSelect: (item: T) => void
  pageSize?: number
  renderActions?: (item: T) => React.ReactNode

  showSearch?: boolean
  searchPlaceholder?: string
  searchFields?: SearchableField[]

  showSort?: boolean

  filterOptions?: FilterOption[]
  filterValue?: string
  onFilterChange?: (value: string) => void
  filterPlaceholder?: string

  hidePagination?: boolean
}

const BG_CYCLE = ['bg-secondary', 'bg-accent', 'bg-link'] as const
const DEFAULT_SEARCH_FIELDS: SearchableField[] = ['label', 'subtitle', 'value']

export function ComboboxMobile<T>({
  items,
  onSelect,
  pageSize = 10,
  renderActions,

  showSearch = true,
  searchPlaceholder = 'Buscar...',
  searchFields = DEFAULT_SEARCH_FIELDS,

  showSort = true,

  filterOptions,
  filterValue = '',
  onFilterChange,
  filterPlaceholder = 'Filtrar...',

  hidePagination = false,
}: ComboboxMobileProps<T>) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [sortDir, setSortDir] = useState<SortDirection>('asc')

  const filtered = useMemo(() => {
    let result = items
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((item) =>
        searchFields.some((field) => {
          const value = item[field]
          return value ? value.toLowerCase().includes(q) : false
        }),
      )
    }
    return [...result].sort((a, b) => {
      const cmp = a.label.localeCompare(b.label)
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [items, search, sortDir, searchFields])

  const totalPages = Math.ceil(filtered.length / pageSize)
  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize)

  const hasSearch = showSearch
  const hasFilter = !!filterOptions && filterOptions.length > 0
  const hasSort = showSort
  const hasToolbar = hasSearch || hasFilter || hasSort

  return (
    <div className="flex flex-col gap-4">
      {(hasToolbar) && (
        <>
          {hasFilter && (
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <ListFilter size={16} className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 pointer-events-none" />
                <select
                  value={filterValue}
                  onChange={(e) => {
                    onFilterChange?.(e.target.value)
                    setPage(0)
                  }}
                  className="bg-background w-full appearance-none rounded-xl border border-input py-2 pl-9 pr-9 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  <option value="">{filterPlaceholder}</option>
                  {filterOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none" />
              </div>
              {!hasSearch && hasSort && (
                <button
                  onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
                  className="bg-surface flex size-10 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-surface/80"
                  type="button"
                >
                  {sortDir === 'asc' ? <ChevronUp size={18} className="text-foreground" /> : <ChevronDown size={18} className="text-foreground" />}
                </button>
              )}
            </div>
          )}
          {hasSearch && (
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search size={16} className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2" />
                <Input
                  placeholder={searchPlaceholder}
                  className="bg-background pl-9"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(0) }}
                />
              </div>
              {hasSort && (
                <button
                  onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
                  className="bg-surface flex size-10 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-surface/80"
                  type="button"
                >
                  {sortDir === 'asc' ? <ChevronUp size={18} className="text-foreground" /> : <ChevronDown size={18} className="text-foreground" />}
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* list */}
      <div className="flex flex-col gap-6">
        {paged.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-sm">
            Nenhum item encontrado
          </p>
        ) : (
          paged.map((item, i) => {
            const Icon = item.icon
            const bg = BG_CYCLE[i % BG_CYCLE.length]
            return (
              <button
                key={`${item.label}-${i}`}
                type="button"
                onClick={() => onSelect(item.data)}
                className="flex items-start gap-4 text-left"
              >
                <div
                  className={`${bg} flex size-14 shrink-0 items-center justify-center rounded-3xl`}
                >
                  <Icon size={22} className="text-background" />
                </div>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className="min-w-0 truncate text-left text-base font-medium text-foreground capitalize"
                        title={item.label}
                      >
                        {item.label}
                      </span>
                      <div className="flex shrink-0 items-center gap-2">
                        {item.value && (
                          <span className="text-link text-base font-medium">
                            {item.value}
                          </span>
                        )}
                        {item.meta && (
                          <>
                            <div className="h-0 w-[9px] rotate-90 border-t border-primary" />
                            <span className="text-foreground text-xs font-light leading-4">
                              {item.meta}
                            </span>
                          </>
                        )}
                        {renderActions && (
                          <div onClick={(e) => e.stopPropagation()}>
                            {renderActions(item.data)}
                          </div>
                        )}
                      </div>
                    </div>
                    {item.subtitle && (
                      <span
                        className="mt-0.5 truncate text-left text-xs font-semibold text-link capitalize"
                        title={item.subtitle}
                      >
                        {item.subtitle}
                      </span>
                    )}
                  </div>
              </button>
            )
          })
        )}
      </div>

      {/* pagination */}
      {!hidePagination && totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-2">
          <Button
            variant="outline"
            size="icon"
            className="size-8 rounded-full"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            type="button"
          >
            <ChevronLeft size={14} />
          </Button>
          <span className="text-muted-foreground text-sm tabular-nums">
            {page + 1} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="size-8 rounded-full"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
            type="button"
          >
            <ChevronRight size={14} />
          </Button>
        </div>
      )}
    </div>
  )
}
