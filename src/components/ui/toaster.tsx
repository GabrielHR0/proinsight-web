import { Toaster as SonnerToaster } from 'sonner'
import { useTheme } from '@/stores/theme'

export function Toaster() {
  const { currentTheme } = useTheme()

  return (
    <SonnerToaster
      position="top-right"
      theme={currentTheme.toastTheme}
      richColors
      closeButton
      duration={4000}
    />
  )
}
