import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { themes, type ThemeDefinition } from '@/types/theme'

interface ThemeContextValue {
  theme: string
  setTheme: (name: string) => void
  toggleTheme: () => void
  themes: ThemeDefinition[]
  currentTheme: ThemeDefinition
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function getInitialTheme(): string {
  if (typeof window === 'undefined') return themes[0].name
  const stored = localStorage.getItem('theme')
  if (stored && themes.some((t) => t.name === stored)) return stored
  return 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<string>(getInitialTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const setTheme = useCallback(
    (name: string) => {
      if (themes.some((t) => t.name === name)) setThemeState(name)
    },
    [],
  )

  const toggleTheme = useCallback(() => {
    const idx = themes.findIndex((t) => t.name === theme)
    setThemeState(themes[(idx + 1) % themes.length].name)
  }, [theme])

  const currentTheme = themes.find((t) => t.name === theme) ?? themes[0]

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme, toggleTheme, themes, currentTheme }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
