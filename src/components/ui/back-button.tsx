import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface BackButtonProps {
  onClick: () => void
  className?: string
}

export function BackButton({ onClick, className }: BackButtonProps) {
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={onClick}
      aria-label="Voltar"
      className={cn(
        'rounded-full border-primary/30 text-primary hover:bg-primary/10',
        className,
      )}
    >
      <ArrowLeft className="size-5" />
    </Button>
  )
}