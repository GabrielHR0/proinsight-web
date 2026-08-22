import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { academiaService } from '@/services/academia-service'

export function useMinhaAcademia(enabled = true) {
  return useQuery({
    queryKey: ['auth', 'me', 'academia'],
    queryFn: async () => {
      const { data } = await academiaService.getMinha()
      return data
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
    enabled,
  })
}

export function useAtualizarAcademia() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (data: Parameters<typeof academiaService.atualizar>[0]) =>
      academiaService.atualizar(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['auth', 'me', 'academia'] })
    },
  })
}
