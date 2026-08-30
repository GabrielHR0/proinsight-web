import { Menu, Home, Clock, Users, CalendarDays } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useMenuDrawer } from '@/stores/menu-drawer'
import { cn } from '@/lib/utils'

export function BottomNav() {
  const { toggle } = useMenuDrawer()

  const items: { to?: string; icon: React.ComponentType<{ size?: number; className?: string }>; label?: string; action?: () => void }[] = [
    { action: toggle, icon: Menu, label: 'Menu' },
    { to: '/', icon: Home, label: 'Início' },
    { to: '/clientes', icon: Users, label: 'Alunos' },
    { to: '/agenda', icon: CalendarDays, label: 'Agenda' },
    { to: '/historico', icon: Clock, label: 'Histórico' },
  ]

  return (
    <nav aria-label="Navegação mobile" className="bg-background fixed inset-x-0 bottom-0 z-[60] flex items-center justify-around rounded-t-[32px] border-t border-border/70 px-2 pt-2 pb-3 md:hidden" style={{ boxShadow: '0 -4px 20px rgba(0,0,0,0.08)' }}>
      {items.map((item, i) =>
        item.to ? (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className="flex flex-col items-center justify-center gap-0.5"
          >
            {({ isActive }) => (
              <>
                <div className="flex size-10 items-center justify-center rounded-2xl transition-colors duration-200">
                  <item.icon
                    size={20}
                    className={cn(
                      'transition-colors duration-200',
                      isActive ? 'text-primary' : 'text-muted-foreground',
                    )}
                  />
                </div>
                <span className={cn(
                  'text-[10px] font-medium transition-colors duration-200',
                  isActive ? 'text-primary' : 'text-muted-foreground',
                )}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ) : (
          <button
            key={`action-${i}`}
            type="button"
            onClick={item.action}
            aria-label={item.label}
            className="flex flex-col items-center justify-center gap-0.5"
          >
            <div className="flex size-10 items-center justify-center rounded-2xl transition-all duration-200">
              <item.icon size={20} className="text-muted-foreground transition-all duration-200" />
            </div>
            <span className="text-[10px] font-medium text-muted-foreground">{item.label}</span>
          </button>
        ),
      )}
    </nav>
  )
}
