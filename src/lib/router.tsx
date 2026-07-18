import { Route, Routes, Navigate } from 'react-router-dom'
import { RootLayout } from '@/components/layout/root-layout'
import { HomePage } from '@/features/home'
import { HubPage, ProtocoloDetailPage } from '@/features/avaliacoes'
import { AnalysisPage } from '@/features/analysis'
import { HistoryPage } from '@/features/history'
import { CategoriesPage } from '@/features/categories'
import { ProfilePage } from '@/features/profile'
import { SettingsPage } from '@/features/settings'
import { AlunosPage, ClienteDetailPage } from '@/features/clientes'
import { NovaAvaliacaoPage, AvaliacaoIncrementalPage } from '@/features/avaliacao'
import { AgendaPage } from '@/features/agenda'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<HomePage />} />
        <Route path="menu" element={<Navigate to="/" replace />} />
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
        <Route path="agenda" element={<AgendaPage />} />
      </Route>
    </Routes>
  )
}
