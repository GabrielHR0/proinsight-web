import { Outlet } from 'react-router-dom'
import { Sidebar } from './sidebar'
import { BottomNav } from './bottom-nav'

export function RootLayout() {
  return (
    <div className="flex h-dvh">
      <Sidebar />

      <main className="bg-background flex flex-1 flex-col overflow-y-auto">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  )
}
