import { type ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './sidebar'
import { BottomNav } from './bottom-nav'
import { MenuDrawer } from './menu-drawer'

export function RootLayout({ children }: { children?: ReactNode }) {
  return (
    <div className="flex h-dvh">
      <MenuDrawer />
      <Sidebar />

      <main className="bg-background flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
        {children ?? <Outlet />}
      </main>

      <BottomNav />
    </div>
  )
}
