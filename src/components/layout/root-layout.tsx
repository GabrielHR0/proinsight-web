import { type ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './sidebar'
import { BottomNav } from './bottom-nav'
import { MenuDrawer } from './menu-drawer'

export function RootLayout({ children }: { children?: ReactNode }) {
  return (
    <div className="flex h-dvh">
      <a
        href="#main-content"
        className="sr-only z-[100] rounded-br-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-lg focus:not-sr-only focus:absolute focus:top-0 focus:left-0"
      >
        Pular para o conteúdo
      </a>
      <MenuDrawer />
      <Sidebar />

      <main
        id="main-content"
        tabIndex={-1}
        className="bg-background flex flex-1 flex-col overflow-x-hidden overflow-y-auto outline-none"
      >
        {children ?? <Outlet />}
      </main>

      <BottomNav />
    </div>
  )
}
