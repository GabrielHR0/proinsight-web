import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface BackButtonProps {
  onClick?: () => void
  fallbackTo?: string
  className?: string
}

export function BackButton({ onClick, fallbackTo = '/', className }: BackButtonProps) {
  const navigate = useNavigate()

  function voltar() {
    if (onClick) {
      onClick()
      return
    }
    if (window.history.length > 1) {
      navigate(-1)
      return
    }
    navigate(fallbackTo)
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={voltar}
      aria-label="Voltar"
      className={cn(
        'rounded-full border-primary/30 text-primary hover:bg-primary/25 hover:brightness-75',
        className,
      )}
    >
      <ArrowLeft className="size-5" />
    </Button>
  )
}