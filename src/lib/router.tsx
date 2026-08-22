import { Route, Routes, Navigate } from 'react-router-dom'
import { useAuth } from '@/stores/auth'
import { useCurrentUser } from '@/hooks/use-user'
import { RootLayout } from '@/components/layout/root-layout'
import { LoginPage } from '@/features/auth/login-page'
import { RegisterPage } from '@/features/auth/register-page'
import { OnboardingPage } from '@/features/onboarding/onboarding-page'
import { MinhaAcademiaPage } from '@/features/academia/minha-academia-page'
import { HomePage } from '@/features/home'
import { HubPage, ProtocoloDetailPage } from '@/features/avaliacoes'
import { AnalysisPage } from '@/features/analysis'
import { HistoryPage } from '@/features/history'
import { CategoriesPage } from '@/features/categories'
import { ProfilePage } from '@/features/profile'
import { SettingsPage } from '@/features/settings'
import { AlunosPage, ClienteDetailPage } from '@/features/clientes'
import { NovaAvaliacaoPage, AvaliacaoIncrementalPage, Vo2MaxEsteiraPage } from '@/features/avaliacao'
import { AgendaPage } from '@/features/agenda'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to="/" replace />
  return <>{children}</>
}

function SplashOrHome() {
  const { isAuthenticated } = useAuth()
  const meQuery = useCurrentUser()

  if (!isAuthenticated) return <Navigate to="/login" replace />

  if (meQuery.isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return <RootLayout><HomePage /></RootLayout>
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Raiz — valida login com /auth/me; não logado vai para /login */}
      <Route index element={<SplashOrHome />} />

      {/* Rotas públicas */}
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* Rotas protegidas */}
      <Route
        element={
          <ProtectedRoute>
            <RootLayout />
          </ProtectedRoute>
        }
      >
        <Route path="avaliacoes" element={<HubPage />} />
        <Route path="avaliacoes/protocolo/:id" element={<ProtocoloDetailPage />} />
        <Route path="analise" element={<AnalysisPage />} />
        <Route path="historico" element={<HistoryPage />} />
        <Route path="categorias" element={<CategoriesPage />} />
        <Route path="perfil" element={<ProfilePage />} />
        <Route path="configuracoes" element={<SettingsPage />} />
        <Route path="clientes" element={<AlunosPage />} />
        <Route path="clientes/:id" element={<ClienteDetailPage />} />
        <Route path="avaliacao/nova" element={<NovaAvaliacaoPage />} />
        <Route path="avaliacao/incremental" element={<AvaliacaoIncrementalPage />} />
        <Route path="avaliacao/vo2max-esteira" element={<Vo2MaxEsteiraPage />} />
        <Route path="agenda" element={<AgendaPage />} />
        <Route path="minha-academia" element={<MinhaAcademiaPage />} />
        <Route path="onboarding" element={<OnboardingPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
