export interface ThemeDefinition {
  name: string
  label: string
  /** Sonner usa 'light' | 'dark' para estilizar toasts */
  toastTheme: 'light' | 'dark'
}

export const themes: ThemeDefinition[] = [
  { name: 'light', label: 'Claro', toastTheme: 'light' },
  { name: 'dark', label: 'Escuro', toastTheme: 'dark' },
]
