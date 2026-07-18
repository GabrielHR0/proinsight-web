import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg width="54" height="48" viewBox="0 0 54 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M1.93118 33.0434L26.5462 45.3688L51.1612 33.0434M1.93115 23.458L25.7515 35.3772C25.9921 35.4957 26.2568 35.5573 26.5252 35.5573C26.7936 35.5573 27.0584 35.4957 27.299 35.3772L51.1403 23.4372M3.30104 14.8208L26.086 26.2815C26.2292 26.3514 26.3867 26.3878 26.5462 26.3878C26.7057 26.3878 26.863 26.3514 27.0062 26.2815L49.8018 14.8208C49.9293 14.7564 50.0364 14.658 50.1112 14.5366C50.186 14.4153 50.2257 14.2756 50.2257 14.1332C50.2257 13.9907 50.186 13.851 50.1112 13.7297C50.0364 13.6083 49.9293 13.5099 49.8018 13.4455L27.0062 2.03688C26.863 1.96695 26.7057 1.9306 26.5462 1.9306C26.3867 1.9306 26.2292 1.96695 26.086 2.03688L3.30104 13.4976C3.18624 13.566 3.09118 13.663 3.0252 13.7789C2.95921 13.8949 2.92448 14.0259 2.92448 14.1592C2.92448 14.2925 2.95921 14.4235 3.0252 14.5395C3.09118 14.6554 3.18624 14.7524 3.30104 14.8208Z"
        stroke="currentColor"
        strokeWidth="3.86118"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M2.25 9L9 2.25L15.75 9M3.75 7.5V14.25C3.75 14.6642 4.08579 15 4.5 15H7.5V11.25H10.5V15H13.5C13.9142 15 14.25 14.6642 14.25 14.25V7.5M1.5 7.5L9 1.125L16.5 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function AnalysisIcon({ className }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M13.5 13.5L16.5 16.5M4 10.5V14.25M7.5 10.5V12M11.25 10.5V9.75M9 10.5V5.25M12.75 10.5V8.25M16.5 8.25C16.5 12.144 13.394 15.3 9.5 15.3C5.606 15.3 2.5 12.144 2.5 8.25C2.5 4.356 5.606 1.2 9.5 1.2C13.394 1.2 16.5 4.356 16.5 8.25Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function HistoryIcon({ className }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M2.25 9C2.25 12.728 5.272 15.75 9 15.75C12.728 15.75 15.75 12.728 15.75 9C15.75 5.272 12.728 2.25 9 2.25C6.81 2.25 4.875 3.263 3.75 4.875M3.75 2.25V4.875H6.375M14.25 15.75V13.125" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function CategoriesIcon({ className }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M1.5 9.5L9 13.5L16.5 9.5M1.5 6.5L8.25 10.125M1.5 6.5L8.25 2.875L16.5 6.5M1.5 6.5V11.5L8.25 15.125L16.5 11.5V6.5M8.25 2.875V7.875" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M1.5 14.625C1.5 14.625 3.375 12.75 9 12.75C14.625 12.75 16.5 14.625 16.5 14.625M9 12.75C6.515 12.75 4.5 10.735 4.5 8.25V3.375M9 12.75C11.485 12.75 13.5 10.735 13.5 8.25V3.375M9 12.75V15.375M4.5 3.375C4.5 2.006 5.631 0.875 7 0.875C8.369 0.875 9.5 2.006 9.5 3.375C9.5 4.744 8.369 5.875 7 5.875C5.631 5.875 4.5 4.744 4.5 3.375Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

const items = [
  { to: '/menu', icon: MenuIcon, label: 'Menu' },
  { to: '/', icon: HomeIcon, label: 'Home' },
  { to: '/avaliacoes', icon: AnalysisIcon, label: 'Protocolos' },
  { to: '/historico', icon: HistoryIcon, label: 'Histórico' },
  { to: '/categorias', icon: CategoriesIcon, label: 'Categorias' },
  { to: '/perfil', icon: UserIcon, label: 'Perfil' },
]

export function Sidebar() {
  return (
    <aside className="bg-surface hidden h-dvh w-64 shrink-0 flex-col overflow-y-auto border-r md:flex">
      <div className="flex h-14 items-center gap-2 border-b px-5">
        <div className="bg-primary size-3 rounded-full" />
        <span className="text-foreground text-lg font-bold">Proinsight</span>
      </div>

      <nav className="flex flex-col gap-1 p-3">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )
            }
          >
            <Icon />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
