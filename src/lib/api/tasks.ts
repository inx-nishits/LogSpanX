import { apiRequest } from './client'
import { useAuthStore } from '@/lib/stores/auth-store'
import { ApiTask } from './mappers'

export function getProjectTasks(projectId: string) {
  const token = useAuthStore.getState().token
  return apiRequest<ApiTask[]>(`/projects/${projectId}/tasks`, { method: 'GET', token })
}

export function createTask(projectId: string, name: string) {
  const token = useAuthStore.getState().token
  return apiRequest<ApiTask>('/tasks', {
    method: 'POST',
    token,
    body: JSON.stringify({ name, projectId, completed: false }),
  })
}

export function updateTask(taskId: string, updates: { name?: string; completed?: boolean }) {
  const token = useAuthStore.getState().token
  return apiRequest<ApiTask>(`/tasks/${taskId}`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(updates),
  })
}

export function updateTaskAssignees(taskId: string, assignees: string[]) {
  const token = useAuthStore.getState().token
  return apiRequest<ApiTask>(`/tasks/${taskId}/assignees`, {
    method: 'PATCH',
    token,
    body: JSON.stringify({ assignees }),
  })
}

export function deleteTask(taskId: string) {
  const token = useAuthStore.getState().token
  return apiRequest(`/tasks/${taskId}`, { method: 'DELETE', token })
}
