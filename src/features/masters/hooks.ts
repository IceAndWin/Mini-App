import { useQuery } from '@tanstack/react-query'
import { fetchMasterById, fetchMasters } from '@/shared/api/endpoints'

export function useMasters() {
  return useQuery({
    queryKey: ['masters'],
    queryFn: fetchMasters,
  })
}

export function useMasterById(id: string) {
  return useQuery({
    queryKey: ['masters', id],
    queryFn: () => fetchMasterById(id),
    enabled: !!id,
  })
}
