import { apiRequest } from './client'
import { useAuthStore } from '@/lib/stores/auth-store'

// ─── Shared types ─────────────────────────────────────────────────────────────

export interface TimeEntryParams {
  startDate?: string
  endDate?: string
  userId?: string
  projectId?: string
}

export interface CreateTimeEntryPayload {
  description: string
  projectId?: string
  taskId?: string
  tagIds?: string[]
  billable?: boolean
  startTime: string   // ISO 8601
  endTime?: string    // ISO 8601 — omit to start a live timer
}

export interface UpdateTimeEntryPayload {
  description?: string
  projectId?: string
  taskId?: string
  tagIds?: string[]
  billable?: boolean
  startTime?: string  // ISO 8601
  endTime?: string    // ISO 8601 — provide to stop a running timer
}

// ─── 5.1 Get Time Entries ─────────────────────────────────────────────────────
// GET /time-entries?startDate=...&endDate=...&userId=...&projectId=...
export function getTimeEntries(params?: TimeEntryParams) {
  const token = useAuthStore.getState().token
  return apiRequest<unknown>('/time-entries', {
    method: 'GET',
    token,
    query: params as Record<string, string | undefined>,
  })
}

// ─── 5.2 Add Manual Entry / Start Timer ──────────────────────────────────────
// POST /time-entries  (omit endTime to start a live timer)
export function createTimeEntry(payload: CreateTimeEntryPayload) {
  const token = useAuthStore.getState().token
  return apiRequest<{ id: string; description: string; duration?: number }>('/time-entries', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  })
}

// ─── 5.3 Edit Entry / Stop Timer ─────────────────────────────────────────────
// PUT /time-entries/:id
export function updateTimeEntry(id: string, payload: UpdateTimeEntryPayload) {
  const token = useAuthStore.getState().token
  return apiRequest<{ id: string; description?: string; endTime?: string }>(`/time-entries/${id}`, {
    method: 'PUT',
    token,
    body: JSON.stringify(payload),
  })
}

// ─── 5.4 Delete Entry ─────────────────────────────────────────────────────────
// DELETE /time-entries/:id
export function deleteTimeEntry(id: string) {
  const token = useAuthStore.getState().token
  return apiRequest<Record<string, never>>(`/time-entries/${id}`, {
    method: 'DELETE',
    token,
  })
}

// ─── 5.5 Bulk Delete Entries ──────────────────────────────────────────────────
// DELETE /time-entries/bulk  { ids: string[] }
export function bulkDeleteTimeEntries(ids: string[]) {
  const token = useAuthStore.getState().token
  return apiRequest<Record<string, never>>('/time-entries/bulk', {
    method: 'DELETE',
    token,
    body: JSON.stringify({ ids }),
  })
}

// ─── 5.6 Undo Delete Entries ─────────────────────────────────────────────────
// POST /time-entries/undo-delete  { ids: string[] }
export function undoDeleteTimeEntries(ids: string[]) {
  const token = useAuthStore.getState().token
  return apiRequest<Array<{ id: string }>>('/time-entries/undo-delete', {
    method: 'POST',
    token,
    body: JSON.stringify({ ids }),
  })
}