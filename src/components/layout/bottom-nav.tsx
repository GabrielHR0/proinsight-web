import { Menu, Home, BarChart3, Clock, CircleUser } from 'lucide-react'
import { NavLink } from 'react-router-dom'

interface NavItem {
  to: string
  icon: React.ComponentType<{ size?: number; className?: string }>
}

const items: NavItem[] = [
  { to: '/menu', icon: Menu },
  { to: '/', icon: Home },
  { to: '/avaliacoes', icon: BarChart3 },
  { to: '/historico', icon: Clock },
  { to: '/perfil', icon: CircleUser },
]

export function BottomNav() {
  return (
    <nav className="bg-surface fixed inset-x-0 bottom-0 z-50 flex items-center justify-around rounded-t-[40px] px-4 pt-2 pb-6 shadow-lg md:hidden">
      {items.map(({ to, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className="relative flex min-h-[44px] min-w-[52px] items-center justify-center"
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <div className="absolute inset-0 mx-auto w-[52px] rounded-[22px] bg-primary shadow-lg shadow-primary/30" />
              )}
              <Icon size={24} className={`relative transition-all ${isActive ? 'text-primary-foreground scale-110' : 'text-muted-foreground'}`} />
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}