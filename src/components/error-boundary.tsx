import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  handleReload = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-6 text-center">
          <AlertTriangle size={48} className="text-destructive mb-4" />
          <h1 className="text-foreground text-xl font-bold">Algo deu errado</h1>
          <p className="text-muted-foreground mt-2 max-w-sm text-sm">
            Ocorreu um erro inesperado. Tente novamente ou volte ao início.
          </p>
          {this.state.error?.message && (
            <p className="text-muted-foreground mt-3 max-w-md break-all font-mono text-xs opacity-60">
              {this.state.error.message}
            </p>
          )}
          <div className="mt-6 flex gap-3">
            <Button variant="outline" onClick={this.handleReset}>
              <RefreshCw size={16} />
              Tentar novamente
            </Button>
            <Button onClick={this.handleReload}>
              Voltar ao início
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
