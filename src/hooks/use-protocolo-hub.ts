import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/stores/auth'
import { protocoloService } from '@/services/protocolo-service'
import type { HubResponse, ProtocoloDetalhe } from '@/types/protocolo'

export function useProtocoloHub() {
  const { user } = useAuth()

  return useQuery<HubResponse>({
    queryKey: ['protocolo-hub', user?.id],
    queryFn: () => protocoloService.getHub(user!.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  })
}

export function useProtocoloDetalhe(id: string) {
  return useQuery<ProtocoloDetalhe>({
    queryKey: ['protocolo-detalhe', id],
    queryFn: () => protocoloService.getDetalhe(id),
    enabled: !!id,
  })
}

export function useFavoritar() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (protocoloId: string) => protocoloService.favoritar(user!.id, protocoloId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['protocolo-hub', user?.id] })
    },
  })
}

export function useDesfavoritar() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (protocoloId: string) => protocoloService.desfavoritar(user!.id, protocoloId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['protocolo-hub', user?.id] })
    },
  })
}
