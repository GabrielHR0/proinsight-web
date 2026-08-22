import { useAuth } from '@/stores/auth'
import { useMemo } from 'react'

export type Permissao =
  | 'CLIENTES_CRIAR' | 'CLIENTES_LER' | 'CLIENTES_ATUALIZAR' | 'CLIENTES_EXCLUIR'
  | 'AVALIACOES_CRIAR' | 'AVALIACOES_LER' | 'AVALIACOES_ATUALIZAR' | 'AVALIACOES_EXCLUIR'
  | 'AVALIADORES_CRIAR' | 'AVALIADORES_LER' | 'AVALIADORES_ATUALIZAR'
  | 'PROTOCOLOS_LER'
  | 'USUARIOS_CRIAR' | 'USUARIOS_LER' | 'USUARIOS_ATUALIZAR' | 'USUARIOS_EXCLUIR'
  | 'ACADEMIAS_CRIAR' | 'ACADEMIAS_LER' | 'ACADEMIAS_ATUALIZAR'
  | 'RELATORIOS_LER' | 'RELATORIOS_EXPORTAR'
  | 'SUPER_ADMIN'

export function usePermissions() {
  const { user } = useAuth()

  const academiaId = typeof window !== 'undefined' ? localStorage.getItem('proinsight_academia_id') : null

  return useMemo(() => {
    const permissoes = academiaId
      ? user?.academiaPermissoes?.[academiaId] ?? []
      : Object.values(user?.academiaPermissoes ?? {}).flat()

    return {
      hasPermission: (perm: Permissao) => permissoes.includes(perm),
      hasAnyPermission: (...perms: Permissao[]) => perms.some(p => permissoes.includes(p)),
      hasAllPermissions: (...perms: Permissao[]) => perms.every(p => permissoes.includes(p)),
      permissoes,
    }
  }, [user, academiaId])
}
