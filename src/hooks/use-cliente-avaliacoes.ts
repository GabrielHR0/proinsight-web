import { useQuery } from '@tanstack/react-query'
import { clienteService } from '@/services/cliente-service'
import type { AvaliacaoHistorico } from '@/types/avaliacao'

export function useClienteAvaliacoes(clienteId?: string) {
  return useQuery<AvaliacaoHistorico[]>({
    queryKey: ['cliente', clienteId, 'avaliacoes'],
    queryFn: () => clienteService.listarAvaliacoes(clienteId!),
    enabled: !!clienteId,
  })
}