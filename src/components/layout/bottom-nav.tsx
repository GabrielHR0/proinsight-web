import { Menu, Home, BarChart3, Clock, CircleUser } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useMenuDrawer } from '@/stores/menu-drawer'
import { cn } from '@/lib/utils'

export function BottomNav() {
  const { toggle } = useMenuDrawer()

  const items: { to?: string; icon: React.ComponentType<{ size?: number; className?: string }>; action?: () => void }[] = [
    { action: toggle, icon: Menu },
    { to: '/', icon: Home },
    { to: '/avaliacoes', icon: BarChart3 },
    { to: '/historico', icon: Clock },
    { to: '/perfil', icon: CircleUser },
  ]

  return (
    <nav className="bg-background fixed inset-x-0 bottom-0 z-[60] flex items-center justify-around rounded-t-[32px] border-t border-border/70 px-2 pt-2 pb-3 md:hidden" style={{ boxShadow: '0 -4px 20px rgba(0,0,0,0.08)' }}>
      {items.map((item, i) =>
        item.to ? (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className="flex items-center justify-center"
          >
            {({ isActive }) => (
              <div className="flex size-11 items-center justify-center rounded-2xl transition-colors duration-200">
                <item.icon
                  size={20}
                  className={cn(
                    'transition-colors duration-200',
                    isActive ? 'text-primary' : 'text-muted-foreground',
                  )}
                />
              </div>
            )}
          </NavLink>
        ) : (
          <button
            key={`action-${i}`}
            type="button"
            onClick={item.action}
            className="flex items-center justify-center"
          >
            <div className="flex size-11 items-center justify-center rounded-2xl transition-all duration-200">
              <item.icon size={20} className="text-muted-foreground transition-all duration-200" />
            </div>
          </button>
        ),
      )}
    </nav>
  )
}
