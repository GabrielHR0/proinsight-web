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
      className={cn(
        'rounded-full border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20',
        className,
      )}
    >
      <ArrowLeft className="size-5" />
    </Button>
  )
}