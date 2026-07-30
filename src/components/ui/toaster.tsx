import { Toaster as SonnerToaster } from 'sonner'
import { useTheme } from '@/stores/theme'

export function Toaster() {
  const { currentTheme } = useTheme()

  return (
    <SonnerToaster
      position="top-center"
      theme={currentTheme.toastTheme}
      richColors
      closeButton
      duration={4000}
      toastOptions={{
        className: 'gap-3',
        style: {
          borderRadius: '16px',
          padding: '12px 16px',
          fontSize: '14px',
          maxWidth: '340px',
        },
      }}
    />
  )
}