import { apiRequest } from './client'
import { useAuthStore } from '@/lib/stores/auth-store'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiTeamMember {
  _id: string
  name: string
  email: string
  avatar: string | null
  role?: string
}

export interface ApiTeam {
  _id: string
  name: string
  members: ApiTeamMember[]
  createdBy: ApiTeamMember
  createdAt: string
  updatedAt: string
}

export interface ApiTeamsResponse {
  items: ApiTeam[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiGroup {
  _id: string
  name: string
  memberIds: string[]
  createdAt: string
  updatedAt: string
}

function token() { return useAuthStore.getState().token }

// ─── Teams ────────────────────────────────────────────────────────────────────

export function getTeams(page = 1, limit = 100) {
  return apiRequest<ApiTeamsResponse>('/teams', { method: 'GET', token: token(), query: { page, limit } })
}

export function createTeam(name: string, members: string[] = []) {
  return apiRequest<ApiTeam>('/teams', { method: 'POST', token: token(), body: JSON.stringify({ name, members }) })
}

export function updateTeam(id: string, data: { name?: string; members?: string[] }) {
  return apiRequest<ApiTeam>(`/teams/${id}`, { method: 'PATCH', token: token(), body: JSON.stringify(data) })
}

export function deleteTeam(id: string) {
  return apiRequest<Record<string, never>>(`/teams/${id}`, { method: 'DELETE', token: token() })
}

export function addTeamMember(teamId: string, userId: string) {
  return apiRequest<ApiTeam>(`/teams/${teamId}/members`, { method: 'POST', token: token(), body: JSON.stringify({ userId }) })
}

export function removeTeamMember(teamId: string, userId: string) {
  return apiRequest<Record<string, never>>(`/teams/${teamId}/members/${userId}`, { method: 'DELETE', token: token() })
}

// ─── Groups ───────────────────────────────────────────────────────────────────

export function getGroups() {
  return apiRequest<ApiGroup[]>('/groups', { method: 'GET', token: token() })
}

export function createGroup(name: string, memberIds: string[] = []) {
  return apiRequest<ApiGroup>('/groups', { method: 'POST', token: token(), body: JSON.stringify({ name, memberIds }) })
}

export function updateGroup(id: string, data: { name?: string; memberIds?: string[] }) {
  return apiRequest<ApiGroup>(`/groups/${id}`, { method: 'PUT', token: token(), body: JSON.stringify(data) })
}

export function deleteGroup(id: string) {
  return apiRequest<Record<string, never>>(`/groups/${id}`, { method: 'DELETE', token: token() })
}

// ─── Users ────────────────────────────────────────────────────────────────

export function updateUserRole(userId: string, role: string) {
  return apiRequest<{ _id: string; role: string }>(`/users/${userId}/role`, {
    method: 'PATCH',
    token: token(),
    body: JSON.stringify({ role }),
  })
}
