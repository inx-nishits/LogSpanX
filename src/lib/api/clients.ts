import { apiRequest } from './client'
import { useAuthStore } from '@/lib/stores/auth-store'
import { ApiClient } from './mappers'

export function getClients() {
  const token = useAuthStore.getState().token
  return apiRequest<ApiClient[]>('/clients', { method: 'GET', token })
}

export function createClient(client: Partial<ApiClient>) {
  const token = useAuthStore.getState().token
  return apiRequest<ApiClient>('/clients', {
    method: 'POST',
    token,
    body: JSON.stringify(client),
  })
}

export function updateClient(id: string, updates: Partial<ApiClient>) {
  const token = useAuthStore.getState().token
  return apiRequest<ApiClient>(`/clients/${id}`, {
    method: 'PUT',
    token,
    body: JSON.stringify(updates),
  })
}

export function deleteClient(id: string) {
  const token = useAuthStore.getState().token
  return apiRequest(`/clients/${id}`, { method: 'DELETE', token })
}
