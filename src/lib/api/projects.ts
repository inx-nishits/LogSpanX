import { apiRequest } from './client'
import { useAuthStore } from '@/lib/stores/auth-store'
import { ApiProject } from '@/lib/api/mappers'

export function getProjectById(id: string) {
  const token = useAuthStore.getState().token
  return apiRequest<ApiProject>(`/projects/${id}`, { method: 'GET', token })
}
