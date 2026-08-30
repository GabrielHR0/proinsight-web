import { NavLink, useLocation } from 'react-router-dom'
import { useMenuDrawer } from '@/stores/menu-drawer'
import { cn } from '@/lib/utils'
import { Menu, Home, BarChart3, Clock, CircleUser, Users, CalendarDays, Settings } from 'lucide-react'

const sections = [
  {
    label: 'Navegação',
    items: [
      { to: '/', icon: Home, label: 'Início' },
      { to: '/clientes', icon: Users, label: 'Alunos' },
      { to: '/avaliacoes', icon: BarChart3, label: 'Protocolos' },
      { to: '/agenda', icon: CalendarDays, label: 'Agenda' },
      { to: '/historico', icon: Clock, label: 'Histórico' },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { to: '/configuracoes', icon: Settings, label: 'Configurações' },
      { to: '/perfil', icon: CircleUser, label: 'Perfil' },
    ],
  },
]

export function Sidebar() {
  const { toggle } = useMenuDrawer()
  const location = useLocation()

  function isActive(to: string) {
    if (to === '/') return location.pathname === '/'
    return location.pathname.startsWith(to)
  }

  return (
    <aside aria-label="Menu lateral" className="bg-background hidden h-dvh w-64 shrink-0 flex-col border-r border-border/70 md:flex">
      <div className="flex h-16 items-center gap-3 border-b border-border/70 px-5">
        <span className="text-foreground text-lg font-bold tracking-tight">Proinsight</span>
        <div className="ml-auto">
          <div className="h-2 w-2 rounded-full bg-emerald-400" />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-4">
        <section>
          <button
            type="button"
            onClick={toggle}
            aria-label="Abrir menu de navegação"
            className={cn(
              'relative flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-sm transition-colors duration-200',
              isActive('/')
                ? 'bg-muted/40 text-foreground'
                : 'text-muted-foreground hover:bg-muted/40',
            )}
          >
            <Menu
              size={18}
              className={cn('shrink-0', isActive('/') ? 'text-primary' : 'text-muted-foreground')}
            />
            <div className="flex flex-col items-start leading-tight">
              <span className={cn(isActive('/') ? 'font-semibold' : 'font-medium')}>Menu</span>
              {!isActive('/') && <span className="text-[10px] opacity-50">Navegação rápida</span>}
            </div>
          </button>
        </section>

        {sections.map((section) => (
          <section key={section.label}>
            <h2 className="text-muted-foreground mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.12em] opacity-60">
              {section.label}
            </h2>
            <div className="flex flex-col gap-0.5">
              {section.items.map(({ to, icon: Icon, label }) => {
                const active = isActive(to)
                return (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === '/'}
                    className={cn(
                      'relative flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm transition-colors duration-200',
                      active
                        ? 'bg-muted/40 text-foreground'
                        : 'text-muted-foreground hover:bg-muted/40',
                    )}
                  >
                    <Icon
                      size={18}
                      className={cn('shrink-0', active ? 'text-primary' : 'text-muted-foreground')}
                    />
                    <div className="flex flex-col items-start leading-tight">
                      <span className={cn(active ? 'font-semibold' : 'font-medium')}>{label}</span>
                      {!active && (
                        <span className="text-[10px] opacity-50">
                          Acessar {label.toLowerCase()}
                        </span>
                      )}
                    </div>
                  </NavLink>
                )
              })}
            </div>
          </section>
        ))}
      </div>

      <div className="border-t border-border/70 p-4">
        <p className="text-muted-foreground text-center text-[10px] uppercase tracking-[0.2em] opacity-40">
          Proinsight v1.0
        </p>
      </div>
    </aside>
  )
}