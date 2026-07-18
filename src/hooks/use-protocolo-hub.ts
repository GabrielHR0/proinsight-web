import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { protocoloService } from '@/services/protocolo-service'
import type { HubResponse, ProtocoloDetalhe } from '@/types/protocolo'

export function useProtocoloHub(userId: string) {
  return useQuery<HubResponse>({
    queryKey: ['protocolo-hub', userId],
    queryFn: () => protocoloService.getHub(userId),
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

export function useFavoritar(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (protocoloId: string) => protocoloService.favoritar(userId, protocoloId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['protocolo-hub', userId] })
    },
  })
}

export function useDesfavoritar(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (protocoloId: string) => protocoloService.desfavoritar(userId, protocoloId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['protocolo-hub', userId] })
    },
  })
}
