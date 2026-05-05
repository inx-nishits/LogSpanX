import { apiRequest } from './client'
import { useAuthStore } from '@/lib/stores/auth-store'
import { ApiUser } from './mappers'

export function getUsers() {
  const token = useAuthStore.getState().token
  return apiRequest<ApiUser[]>('/users', { method: 'GET', token })
}

export function getUserProfile() {
  const token = useAuthStore.getState().token
  return apiRequest<ApiUser>('/auth/me', { method: 'GET', token })
}

export function updateUser(id: string, updates: Partial<ApiUser>) {
  const token = useAuthStore.getState().token
  return apiRequest<ApiUser>(`/users/${id}`, {
    method: 'PUT',
    token,
    body: JSON.stringify(updates),
  })
}

export function toggleUserActive(id: string, isActive: boolean) {
  const token = useAuthStore.getState().token
  return apiRequest<ApiUser>(`/users/${id}/status`, {
    method: 'PATCH',
    token,
    body: JSON.stringify({ isActive }),
  })
}

export function deleteUser(id: string) {
  const token = useAuthStore.getState().token
  return apiRequest(`/users/${id}`, { method: 'DELETE', token })
}

export function inviteUser(email: string, role: string, billableRate?: number) {
  const token = useAuthStore.getState().token
  return apiRequest('/users/invite', {
    method: 'POST',
    token,
    body: JSON.stringify({ email, role, billableRate }),
  })
}
