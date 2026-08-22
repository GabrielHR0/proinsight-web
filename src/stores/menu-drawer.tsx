import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

interface MenuDrawerContextType {
  open: boolean
  toggle: () => void
  close: () => void
}

const MenuDrawerContext = createContext<MenuDrawerContextType | null>(null)

export function MenuDrawerProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)

  const toggle = useCallback(() => setOpen((v) => !v), [])
  const close = useCallback(() => setOpen(false), [])

  return (
    <MenuDrawerContext.Provider value={{ open, toggle, close }}>
      {children}
    </MenuDrawerContext.Provider>
  )
}

export function useMenuDrawer(): MenuDrawerContextType {
  const ctx = useContext(MenuDrawerContext)
  if (!ctx) throw new Error('useMenuDrawer deve ser usado dentro de MenuDrawerProvider')
  return ctx
}
