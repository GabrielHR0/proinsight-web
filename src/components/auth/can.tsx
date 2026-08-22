import { usePermissions } from '@/hooks/use-permissions'
import type { Permissao } from '@/hooks/use-permissions'

interface CanProps {
  perm: Permissao
  fallback?: React.ReactNode
  children: React.ReactNode
}

export function Can({ perm, fallback = null, children }: CanProps) {
  const { hasPermission } = usePermissions()
  return hasPermission(perm) ? children : fallback
}
