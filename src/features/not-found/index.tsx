import { useNavigate } from 'react-router-dom'
import { PageLayout } from '@/components/layout/page-layout'
import { BackButton } from '@/components/ui/back-button'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <PageLayout
      header={
        <div className="flex items-center gap-3">
          <BackButton onClick={() => navigate('/')} />
          <div className="flex-1">
            <h1 className="text-primary-foreground text-xl font-bold">Página não encontrada</h1>
            <p className="text-primary-foreground/80 mt-0.5 text-sm">O endereço não existe</p>
          </div>
        </div>
      }
    >
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <p className="text-foreground text-6xl font-black tabular-nums">404</p>
        <p className="text-muted-foreground text-sm">
          A página que você procura não foi encontrada ou foi movida.
        </p>
        <Button onClick={() => navigate('/')} className="mt-2">
          Voltar ao início
        </Button>
      </div>
    </PageLayout>
  )
}
