import { AppRoutes } from '@/lib/router'
import { ErrorBoundary } from '@/components/error-boundary'

export default function App() {
  return (
    <ErrorBoundary>
      <AppRoutes />
    </ErrorBoundary>
  )
}
