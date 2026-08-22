import { Navigate } from 'react-router-dom'
import { usePermissions } from '@/hooks/use-permissions'
import type { Permissao } from '@/hooks/use-permissions'

interface ProtectedFeatureProps {
  perm: Permissao
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ProtectedFeature({ perm, children, fallback }: ProtectedFeatureProps) {
  const { hasPermission } = usePermissions()
  if (!hasPermission(perm)) {
    return fallback ?? <Navigate to="/" replace />
  }
  return children
}
