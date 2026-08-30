import { Route, Routes, Navigate } from 'react-router-dom'
import { useAuth } from '@/stores/auth'
import { useCurrentUser } from '@/hooks/use-user'
import { RootLayout } from '@/components/layout/root-layout'
import { Skeleton } from '@/components/ui/skeleton'
import { LoginPage } from '@/features/auth/login-page'
import { RegisterPage } from '@/features/auth/register-page'
import { ForgotPasswordPage } from '@/features/auth/forgot-password-page'
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
import { NotFoundPage } from '@/features/not-found'
import { ProtectedFeature } from '@/components/auth/protected-feature'

function PageSkeleton() {
  return (
    <div className="flex min-h-dvh flex-col gap-4 p-6 pt-12">
      <Skeleton className="h-8 w-48 rounded-xl" />
      <Skeleton className="h-4 w-32 rounded-xl" />
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
      </div>
      <Skeleton className="mt-2 h-64 rounded-2xl" />
    </div>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) return <PageSkeleton />
  if (!isAuthenticated) return <Navigate to="/login" replace />
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
  if (meQuery.isLoading) return <PageSkeleton />
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
      <Route path="/esqueci-senha" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />

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
        <Route path="clientes" element={<ProtectedFeature perm="CLIENTES_LER"><AlunosPage /></ProtectedFeature>} />
        <Route path="clientes/:id" element={<ProtectedFeature perm="CLIENTES_LER"><ClienteDetailPage /></ProtectedFeature>} />
        <Route path="avaliacao/nova" element={<ProtectedFeature perm="AVALIACOES_CRIAR"><NovaAvaliacaoPage /></ProtectedFeature>} />
        <Route path="avaliacao/incremental" element={<ProtectedFeature perm="AVALIACOES_CRIAR"><AvaliacaoIncrementalPage /></ProtectedFeature>} />
        <Route path="avaliacao/vo2max-esteira" element={<ProtectedFeature perm="AVALIACOES_CRIAR"><Vo2MaxEsteiraPage /></ProtectedFeature>} />
        <Route path="agenda" element={<AgendaPage />} />
        <Route path="minha-academia" element={<ProtectedFeature perm="ACADEMIAS_LER"><MinhaAcademiaPage /></ProtectedFeature>} />
        <Route path="onboarding" element={<OnboardingPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
