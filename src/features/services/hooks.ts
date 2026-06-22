import { useQuery } from '@tanstack/react-query'
import { fetchCategories, fetchServices } from '@/shared/api/endpoints'

export function useServices(params?: { category?: string; search?: string }) {
  return useQuery({
    queryKey: ['services', params],
    queryFn: () => fetchServices(params),
  })
}

export function useCategories() {
  return useQuery({
    queryKey: ['services', 'categories'],
    queryFn: fetchCategories,
  })
}
