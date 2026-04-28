import { apiRequest } from './client'

export function getTimeEntries(params?: {
  startDate?: string
  endDate?: string
  userId?: string
  projectId?: string
}) {
  return apiRequest<any[]>('/time-entries', {
    method: 'GET',
    query: params,
  })
}