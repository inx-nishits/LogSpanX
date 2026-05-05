import { apiRequest } from './client'
import { useAuthStore } from '@/lib/stores/auth-store'
import { ApiTask } from './mappers'

export function getProjectTasks(projectId: string) {
  const token = useAuthStore.getState().token
  // The documentation says /tasks/project/{projectId}
  // But the existing code used /projects/{id}/tasks
  // We'll follow the documentation but provide a fallback if needed
  return apiRequest<ApiTask[]>(`/tasks/project/${projectId}`, { method: 'GET', token })
    .catch(() => apiRequest<ApiTask[]>(`/projects/${projectId}/tasks`, { method: 'GET', token }))
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
    method: 'PUT',
    token,
    body: JSON.stringify(updates),
  })
}

export function deleteTask(taskId: string) {
  const token = useAuthStore.getState().token
  return apiRequest(`/tasks/${taskId}`, { method: 'DELETE', token })
}
