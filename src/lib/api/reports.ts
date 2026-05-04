import { apiRequest } from './client'
import { useAuthStore } from '@/lib/stores/auth-store'

export interface ReportQueryParams {
  startDate: string
  endDate: string
  teamId?: string
  userId?: string
  projectId?: string
  billable?: boolean | string
  tagId?: string
  page?: number
  limit?: number
}

function toQuery(params: ReportQueryParams): Record<string, string | number | boolean | undefined> {
  return { ...params }
}

export function getSummaryReport(params: ReportQueryParams) {
  const token = useAuthStore.getState().token
  return apiRequest<unknown>('/reports/summary', {
    method: 'GET',
    token,
    query: toQuery(params),
  })
}

export function getDetailedReport(params: ReportQueryParams) {
  const token = useAuthStore.getState().token
  return apiRequest<unknown>('/reports/detailed', {
    method: 'GET',
    token,
    query: toQuery(params),
  })
}
