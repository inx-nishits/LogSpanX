import { create } from 'zustand'
import { apiRequest } from '@/lib/api/client'
import { useAuthStore } from '@/lib/stores/auth-store'
import {
  ApiClient,
  ApiGroup,
  ApiProject,
  ApiTag,
  ApiTask,
  ApiTimeEntry,
  ApiUser,
  mapApiClient,
  mapApiGroup,
  mapApiProject,
  mapApiTag,
  mapApiTask,
  mapApiTimeEntry,
  mapApiUser,
  serializeTimeEntryPatch,
  serializeTimeEntryCreate,
} from '@/lib/api/mappers'
import { Client, Group, Project, Tag, Task, TimeEntry, User, ReportFilters } from '@/lib/types'

export interface SummaryReportData {
  totalAmount: number
  totalDuration: number
  groupings: { groupName: string; duration: number; amount: number }[]
}

export interface DetailedReportData {
  entries: { id: string; duration: number }[]
  totalDuration: number
  totalAmount: number
}

export interface WeeklyReportData {
  days: { date: string; duration: number }[]
  totalDuration: number
}

export interface SharedReport {
  id: string
  name: string
  token: string
  type: 'summary' | 'detailed' | 'weekly'
  filters: unknown
}

export interface SharedReportData {
  reportDetails: { name: string }
  data: { totalDuration: number; groupings: unknown[] }
}

export interface DashboardStats {
  todayHours: number
  weekHours: number
  activeProjects: number
  topProject: string
  teamActivity: unknown[]
}

interface DataStore {
  timeEntries: TimeEntry[]
  projects: Project[]
  clients: Client[]
  tasks: Task[]
  users: User[]
  tags: Tag[]
  groups: Group[]
  lastDeletedEntries: TimeEntry[]
  isLoading: boolean
  isInitialized: boolean
  error: string | null
  initialize: () => Promise<void>
  reset: () => void

  addTimeEntry: (entry: Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateTimeEntry: (id: string, updates: Partial<TimeEntry>) => Promise<void>
  deleteTimeEntry: (id: string) => Promise<void>
  deleteTimeEntries: (ids: string[]) => Promise<void>
  updateTimeEntries: (ids: string[], updates: Partial<TimeEntry>) => Promise<void>
  undoDelete: () => Promise<void>

  getTimeEntriesByUser: (userId: string) => TimeEntry[]
  getTimeEntriesByProject: (projectId: string) => TimeEntry[]

  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>
  updateProjects: (ids: string[], updates: Partial<Project>) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  toggleProjectArchive: (id: string) => Promise<void>
  assignMember: (projectId: string, userId: string, role?: string, hourlyRate?: number) => Promise<void>
  unassignMember: (projectId: string, userId: string) => Promise<void>

  createTask: (projectId: string, name: string) => Promise<void>
  updateTask: (taskId: string, updates: { name?: string; completed?: boolean }) => Promise<void>
  deleteTask: (taskId: string) => Promise<void>

  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateClient: (id: string, updates: Partial<Client>) => Promise<void>
  deleteClient: (id: string) => Promise<void>

  createTag: (name: string) => Promise<void>
  updateTag: (id: string, updates: Partial<Tag>) => Promise<void>
  deleteTag: (id: string) => Promise<void>

  createGroup: (name: string, memberIds: string[]) => Promise<void>
  updateGroup: (id: string, updates: { name?: string; memberIds?: string[] }) => Promise<void>
  deleteGroup: (id: string) => Promise<void>

  inviteUser: (email: string, role: User['role'], billableRate?: number) => Promise<void>
  updateUserRecord: (id: string, updates: Partial<User>) => Promise<void>
  deleteUserRecord: (id: string) => Promise<void>

  getSummaryReport: (filters: ReportFilters) => Promise<SummaryReportData>
  getDetailedReport: (filters: ReportFilters) => Promise<DetailedReportData>
  getWeeklyReport: (filters: ReportFilters) => Promise<WeeklyReportData>
  shareReport: (name: string, type: 'summary' | 'detailed' | 'weekly', filters: ReportFilters) => Promise<{ token: string; url: string }>
  getSharedReports: () => Promise<SharedReport[]>
  getSharedReport: (token: string) => Promise<SharedReportData>
  getDashboardStats: () => Promise<DashboardStats>
}

function initialState() {
  return {
    timeEntries: [] as TimeEntry[],
    projects: [] as Project[],
    clients: [] as Client[],
    tasks: [] as Task[],
    users: [] as User[],
    tags: [] as Tag[],
    groups: [] as Group[],
    lastDeletedEntries: [] as TimeEntry[],
    isLoading: false,
    isInitialized: false,
    error: null as string | null,
  }
}

function extractArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (!payload || typeof payload !== 'object') return []

  const obj = payload as Record<string, unknown>

  if (Array.isArray(obj.data)) return obj.data as T[]

  const arrayKeys = Object.keys(obj).filter((key) => Array.isArray(obj[key]))
  if (arrayKeys.length === 1) {
    return obj[arrayKeys[0]] as T[]
  }

  const receiver = obj as Record<string, T[]>
  return Object.values(receiver).find(Array.isArray) ?? []
}

async function fetchProjectTasks(projects: Project[]) {
  const token = useAuthStore.getState().token
  const CONCURRENCY = 5
  const results: Task[] = []

  for (let i = 0; i < projects.length; i += CONCURRENCY) {
    const batch = projects.slice(i, i + CONCURRENCY)
    const batchResults = await Promise.all(
      batch.map(async (project) => {
        try {
          const tasksRaw = await apiRequest<ApiTask[]>(`/projects/${project.id}/tasks`, { method: 'GET', token })
          const tasks = extractArray<ApiTask>(tasksRaw)
          return tasks.map((task) => mapApiTask(task, project.id))
        } catch {
          return []
        }
      })
    )
    results.push(...batchResults.flat())
  }

  return results
}

export const useDataStore = create<DataStore>((set, get) => ({
  ...initialState(),

  initialize: async () => {
    if (get().isLoading || get().isInitialized) return
    const token = useAuthStore.getState().token
    if (!token) {
      set({ ...initialState(), isInitialized: false })
      return
    }

    // Resolve the current user — may be null on first load if auth hasn't
    // finished initializing yet, so fall back to fetching /auth/me directly.
    let currentUser = useAuthStore.getState().user
    if (!currentUser) {
      try {
        const profile = await apiRequest<ApiUser>('/auth/me', { method: 'GET', token })
        currentUser = mapApiUser(profile)
        useAuthStore.getState().setToken(token)
        // Use set with a function to merge safely without overwriting persisted fields
        const resolvedUser = currentUser
        useAuthStore.setState((s) => ({ ...s, user: resolvedUser, authStatus: 'authenticated' as const }))
      } catch {
        set({ ...initialState(), isInitialized: false })
        return
      }
    }

    set({ isLoading: true, error: null })

    try {
      const [usersRaw, groupsRaw, clientsRaw, projectsRaw, tagsRaw, timeEntriesResult] = await Promise.all([
        apiRequest<unknown>('/users', { method: 'GET', token }).catch(() => []),
        apiRequest<unknown>('/groups', { method: 'GET', token }).catch(() => []),
        apiRequest<unknown>('/clients', { method: 'GET', token }),
        apiRequest<unknown>('/projects', { method: 'GET', token }),
        apiRequest<unknown>('/tags', { method: 'GET', token }),
        apiRequest<unknown>('/time-entries', {
          method: 'GET',
          token,
        }),
      ])

      const usersRawArray = extractArray<ApiUser>(usersRaw)
      // If /users returned empty or was forbidden, fall back to just the current user
      const users = usersRawArray.length > 0 ? usersRawArray : [currentUser as unknown as ApiUser]
      const groups = extractArray<ApiGroup>(groupsRaw)
      const clients = extractArray<ApiClient>(clientsRaw)
      const projects = extractArray<ApiProject>(projectsRaw)
      const tags = extractArray<ApiTag>(tagsRaw)
      const normalizedProjects = projects.map(mapApiProject)
      const tasks = await fetchProjectTasks(normalizedProjects)

      const timeEntriesRaw = Array.isArray(timeEntriesResult)
        ? timeEntriesResult
        : (timeEntriesResult && typeof timeEntriesResult === 'object' && 'items' in timeEntriesResult && Array.isArray((timeEntriesResult as Record<string, unknown>).items))
          ? (timeEntriesResult as { items: ApiTimeEntry[] }).items
          : (timeEntriesResult && typeof timeEntriesResult === 'object' && 'entries' in timeEntriesResult && Array.isArray((timeEntriesResult as Record<string, unknown>).entries))
            ? (timeEntriesResult as { entries: ApiTimeEntry[] }).entries
            : extractArray<ApiTimeEntry>(timeEntriesResult)

      set({
        users: users.map(mapApiUser),
        groups: groups.map(mapApiGroup),
        clients: clients.map(mapApiClient),
        projects: normalizedProjects,
        tags: tags.map(mapApiTag),
        timeEntries: timeEntriesRaw.map(mapApiTimeEntry),
        tasks,
        isLoading: false,
        isInitialized: true,
        error: null,
      })
    } catch (error) {
      console.error('Failed to initialize data store:', error instanceof Error ? error.message : String(error))
      set({
        isLoading: false,
        isInitialized: false,
        error: error instanceof Error ? error.message : 'Failed to load application data',
      })
    }
  },

  reset: () => {
    set(initialState())
  },

  addTimeEntry: async (entry) => {
    const token = useAuthStore.getState().token
    const payload = await apiRequest<{ id: string; description?: string; duration?: number; userId?: string }>('/time-entries', {
      method: 'POST',
      token,
      body: JSON.stringify(serializeTimeEntryCreate(entry)),
    })

    const now = new Date()
    const createdEntry: TimeEntry = {
      id: payload.id,
      description: payload.description ?? entry.description,
      projectId: entry.projectId,
      taskId: entry.taskId,
      tagIds: entry.tagIds ?? [],
      billable: entry.billable,
      userId: payload.userId ?? entry.userId,
      startTime: entry.startTime instanceof Date ? entry.startTime : new Date(entry.startTime),
      endTime: entry.endTime ? (entry.endTime instanceof Date ? entry.endTime : new Date(entry.endTime)) : undefined,
      duration: payload.duration ?? entry.duration,
      createdAt: now,
      updatedAt: now,
    }
    set((state) => ({
      timeEntries: [createdEntry, ...state.timeEntries],
    }))
  },

  updateTimeEntry: async (id, updates) => {
    try {
      const token = useAuthStore.getState().token
      const payload = await apiRequest<ApiTimeEntry>(`/time-entries/${id}`, {
        method: 'PATCH',
        token,
        body: JSON.stringify(serializeTimeEntryPatch(updates)),
      })

      const synced = mapApiTimeEntry(payload)
      set((state) => ({
        timeEntries: state.timeEntries.map((entry) =>
          entry.id !== id ? entry : { ...entry, ...updates, ...synced }
        ),
      }))
    } catch (err) {
      console.error('Update failed:', err instanceof Error ? err.message : String(err))
    }
  },

  deleteTimeEntry: async (id) => {
    try {
      const token = useAuthStore.getState().token
      const entryToDelete = get().timeEntries.find((entry) => entry.id === id)
      if (!entryToDelete) return

      await apiRequest(`/time-entries/${id}`, { method: 'DELETE', token })

      set((state) => ({
        lastDeletedEntries: [entryToDelete],
        timeEntries: state.timeEntries.filter((entry) => entry.id !== id),
      }))
    } catch (err) {
      console.error('Delete failed:', err instanceof Error ? err.message : String(err))
      const message = err instanceof Error ? err.message : 'An error occurred'
      if (typeof window !== 'undefined') window.alert(message)
    }
  },

  deleteTimeEntries: async (ids) => {
    try {
      const token = useAuthStore.getState().token
      const entriesToDelete = get().timeEntries.filter((entry) => ids.includes(entry.id))
      if (entriesToDelete.length === 0) return

      await apiRequest('/time-entries/bulk', {
        method: 'DELETE',
        token,
        body: JSON.stringify({ ids }),
      })

      set((state) => ({
        lastDeletedEntries: entriesToDelete,
        timeEntries: state.timeEntries.filter((entry) => !ids.includes(entry.id)),
      }))
    } catch (err) {
      console.error('Bulk delete failed:', err instanceof Error ? err.message : String(err))
      const message = err instanceof Error ? err.message : 'An error occurred'
      if (typeof window !== 'undefined') window.alert(message)
    }
  },

  updateTimeEntries: async (ids, updates) => {
    await Promise.all(ids.map((id) => get().updateTimeEntry(id, updates)))
  },

  undoDelete: async () => {
    const token = useAuthStore.getState().token
    const lastDeletedEntries = get().lastDeletedEntries
    if (lastDeletedEntries.length === 0) return

    await apiRequest<{ id: string }[]>('/time-entries/undo-delete', {
      method: 'POST',
      token,
      body: JSON.stringify({ ids: lastDeletedEntries.map((entry) => entry.id) }),
    })

    // Re-add the locally cached entries (API only returns ids, full data is in lastDeletedEntries)
    set((state) => ({
      timeEntries: [...lastDeletedEntries, ...state.timeEntries],
      lastDeletedEntries: [],
    }))
  },

  getTimeEntriesByUser: (userId) => get().timeEntries.filter((entry) => entry.userId === userId),
  getTimeEntriesByProject: (projectId) => get().timeEntries.filter((entry) => entry.projectId === projectId),

  addProject: async (project) => {
    const token = useAuthStore.getState().token
    const payload = await apiRequest<ApiProject>('/projects', {
      method: 'POST',
      token,
      body: JSON.stringify({
        name: project.name,
        color: project.color,
        clientName: project.clientName || undefined,
        leadId: project.leadId || undefined,
        billable: project.billable,
        members: project.members.map((m) => (typeof m === 'string' ? m : m.userId)),
      }),
    })

    const createdProject = mapApiProject(payload)
    set((state) => ({
      projects: [...state.projects, createdProject],
    }))
  },

  toggleProjectArchive: async (id) => {
    const token = useAuthStore.getState().token
    const payload = await apiRequest<{ success: boolean; data: ApiProject }>(`/projects/${id}/archive`, {
      method: 'PATCH',
      token,
    })

    if (payload.data) {
      const updatedProject = mapApiProject(payload.data)
      set((state) => ({
        projects: state.projects.map((project) => (project.id === id ? updatedProject : project)),
      }))
    }
  },

  updateProject: async (id, updates) => {
    const token = useAuthStore.getState().token
    const existing = get().projects.find(p => p.id === id)
    const payload = await apiRequest<ApiProject>(`/projects/${id}`, {
      method: 'PATCH',
      token,
      body: JSON.stringify({
        name: updates.name,
        color: updates.color,
        clientName: updates.clientName,
        leadId: updates.leadId,
        billable: updates.billable,
        archived: updates.archived,
        members: updates.members?.map((m) => (typeof m === 'string' ? m : m.userId)),
      }),
    })

    const updatedProject = mapApiProject(payload)
    set((state) => ({
      projects: state.projects.map((project) => (project.id === id ? updatedProject : project)),
    }))
  },

  updateProjects: async (ids, updates) => {
    const token = useAuthStore.getState().token
    const payload = await apiRequest<unknown>('/projects/bulk', {
      method: 'PUT',
      token,
      body: JSON.stringify({
        ids,
        updates: {
          name: updates.name,
          archived: updates.archived,
          leadId: updates.leadId,
          billable: updates.billable,
        },
      }),
    })

    const projectsArray = extractArray<ApiProject>(payload)
    const updatedProjects = new Map(projectsArray.map((project) => [project.id ?? project._id, mapApiProject(project)]))
    set((state) => ({
      projects: state.projects.map((project) => updatedProjects.get(project.id) ?? project),
    }))
  },

  deleteProject: async (id) => {
    const token = useAuthStore.getState().token
    await apiRequest(`/projects/${id}`, { method: 'DELETE', token })
    set((state) => ({
      projects: state.projects.filter((project) => project.id !== id),
      tasks: state.tasks.filter((task) => task.projectId !== id),
    }))
  },

  assignMember: async (projectId, userId, role = 'member', hourlyRate) => {
    const token = useAuthStore.getState().token
    const payload = await apiRequest<ApiProject>(`/projects/${projectId}/members`, {
      method: 'POST',
      token,
      body: JSON.stringify({ userId, role, hourlyRate }),
    })

    const updatedProject = mapApiProject(payload)
    set((state) => ({
      projects: state.projects.map((p) => (p.id === projectId ? updatedProject : p)),
    }))
  },

  unassignMember: async (projectId, userId) => {
    const token = useAuthStore.getState().token
    const payload = await apiRequest<ApiProject>(`/projects/${projectId}/members/${userId}`, {
      method: 'DELETE',
      token,
    })

    const updatedProject = mapApiProject(payload)
    set((state) => ({
      projects: state.projects.map((p) => (p.id === projectId ? updatedProject : p)),
    }))
  },

  createTask: async (projectId, name) => {
    const token = useAuthStore.getState().token
    const payload = await apiRequest<ApiTask>(`/projects/${projectId}/tasks`, {
      method: 'POST',
      token,
      body: JSON.stringify({ name, completed: false }),
    })

    const createdTask = mapApiTask(payload, projectId)
    set((state) => ({
      tasks: [...state.tasks, createdTask],
    }))
  },

  updateTask: async (taskId, updates) => {
    const token = useAuthStore.getState().token
    const payload = await apiRequest<ApiTask>(`/tasks/${taskId}`, {
      method: 'PUT',
      token,
      body: JSON.stringify(updates),
    })

    const updatedTask = mapApiTask(payload)
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === taskId ? { ...updatedTask, projectId: t.projectId } : t)),
    }))
  },

  deleteTask: async (taskId) => {
    const token = useAuthStore.getState().token
    await apiRequest(`/tasks/${taskId}`, { method: 'DELETE', token })
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== taskId),
    }))
  },

  createTag: async (name) => {
    const token = useAuthStore.getState().token
    const payload = await apiRequest<ApiTag>('/tags', {
      method: 'POST',
      token,
      body: JSON.stringify({ name }),
    })

    set((state) => ({
      tags: [...state.tags, mapApiTag(payload)],
    }))
  },

  updateTag: async (id, updates) => {
    const token = useAuthStore.getState().token
    const payload = await apiRequest<ApiTag>(`/tags/${id}`, {
      method: 'PUT',
      token,
      body: JSON.stringify({
        name: updates.name,
        archived: updates.archived,
      }),
    })

    const updatedTag = mapApiTag(payload)
    set((state) => ({
      tags: state.tags.map((tag) => (tag.id === id ? updatedTag : tag)),
    }))
  },

  deleteTag: async (id) => {
    await apiRequest(`/tags/${id}`, {
      method: 'DELETE',
      token: useAuthStore.getState().token,
    })

    set((state) => ({
      tags: state.tags.filter((tag) => tag.id !== id),
    }))
  },

  inviteUser: async (email, role, billableRate = 0) => {
    const token = useAuthStore.getState().token
    await apiRequest('/users/invite', {
      method: 'POST',
      token,
      body: JSON.stringify({ email, role, billableRate }),
    })
  },

  updateUserRecord: async (id, updates) => {
    const token = useAuthStore.getState().token
    const payload = await apiRequest<ApiUser>(`/users/${id}`, {
      method: 'PUT',
      token,
      body: JSON.stringify({
        role: updates.role,
        billableRate: updates.billableRate,
        group: updates.group,
        archived: updates.archived,
      }),
    })

    const updatedUser = mapApiUser(payload)
    set((state) => ({
      users: state.users.map((user) => (user.id === id ? updatedUser : user)),
    }))
  },

  deleteUserRecord: async (id) => {
    await apiRequest(`/users/${id}`, { method: 'DELETE', token: useAuthStore.getState().token })

    set((state) => ({
      users: state.users.filter((user) => user.id !== id),
      groups: state.groups.map((group) => ({
        ...group,
        memberIds: group.memberIds.filter((memberId) => memberId !== id),
      })),
    }))
  },

  // ─── Clients ─────────────────────────────────────────────────────────────────
  addClient: async (client) => {
    const token = useAuthStore.getState().token
    const payload = await apiRequest<ApiClient>('/clients', {
      method: 'POST',
      token,
      body: JSON.stringify({
        name: client.name,
        email: client.email,
        phone: client.phone,
        address: client.address,
      }),
    })

    set((state) => ({
      clients: [...state.clients, mapApiClient(payload)],
    }))
  },

  updateClient: async (id, updates) => {
    const token = useAuthStore.getState().token
    const payload = await apiRequest<ApiClient>(`/clients/${id}`, {
      method: 'PUT',
      token,
      body: JSON.stringify({
        name: updates.name,
        email: updates.email,
        phone: updates.phone,
        address: updates.address,
      }),
    })

    set((state) => ({
      clients: state.clients.map((c) => (c.id === id ? mapApiClient(payload) : c)),
    }))
  },

  deleteClient: async (id) => {
    const token = useAuthStore.getState().token
    await apiRequest(`/clients/${id}`, { method: 'DELETE', token })

    set((state) => ({
      clients: state.clients.filter((c) => c.id !== id),
    }))
  },

  // ─── Groups ──────────────────────────────────────────────────────────────────
  createGroup: async (name, memberIds) => {
    const token = useAuthStore.getState().token
    const payload = await apiRequest<ApiGroup>('/groups', {
      method: 'POST',
      token,
      body: JSON.stringify({ name, memberIds }),
    })

    set((state) => ({
      groups: [...state.groups, mapApiGroup(payload)],
    }))
  },

  updateGroup: async (id, updates) => {
    const token = useAuthStore.getState().token
    const payload = await apiRequest<ApiGroup>(`/groups/${id}`, {
      method: 'PUT',
      token,
      body: JSON.stringify({
        name: updates.name,
        memberIds: updates.memberIds,
      }),
    })

    set((state) => ({
      groups: state.groups.map((g) => (g.id === id ? mapApiGroup(payload) : g)),
    }))
  },

  deleteGroup: async (id) => {
    const token = useAuthStore.getState().token
    await apiRequest(`/groups/${id}`, { method: 'DELETE', token })

    set((state) => ({
      groups: state.groups.filter((g) => g.id !== id),
    }))
  },

  // ─── Reports ─────────────────────────────────────────────────────────────────
  getSummaryReport: async (filters) => {
    const token = useAuthStore.getState().token
    return await apiRequest<SummaryReportData>('/reports/summary', {
      method: 'POST',
      token,
      body: JSON.stringify({
        dateRange: {
          start: filters.dateRange.start.toISOString().split('T')[0],
          end: filters.dateRange.end.toISOString().split('T')[0],
        },
        projectIds: filters.projectIds,
        userIds: filters.userIds,
        clientIds: filters.clientIds,
        billable: filters.billable,
      }),
    })
  },

  getDetailedReport: async (filters) => {
    const token = useAuthStore.getState().token
    return await apiRequest<DetailedReportData>('/reports/detailed', {
      method: 'POST',
      token,
      body: JSON.stringify({
        dateRange: {
          start: filters.dateRange.start.toISOString().split('T')[0],
          end: filters.dateRange.end.toISOString().split('T')[0],
        },
        projectIds: filters.projectIds,
        userIds: filters.userIds,
        clientIds: filters.clientIds,
        billable: filters.billable,
      }),
    })
  },

  getWeeklyReport: async (filters) => {
    const token = useAuthStore.getState().token
    return await apiRequest<WeeklyReportData>('/reports/weekly', {
      method: 'POST',
      token,
      body: JSON.stringify({
        dateRange: {
          start: filters.dateRange.start.toISOString().split('T')[0],
          end: filters.dateRange.end.toISOString().split('T')[0],
        },
      }),
    })
  },

  shareReport: async (name, type, filters) => {
    const token = useAuthStore.getState().token
    return await apiRequest<{ token: string; url: string }>('/reports/share', {
      method: 'POST',
      token,
      body: JSON.stringify({
        name,
        type,
        filters: {
          dateRange: {
            start: filters.dateRange.start.toISOString().split('T')[0],
            end: filters.dateRange.end.toISOString().split('T')[0],
          },
          projectIds: filters.projectIds,
          userIds: filters.userIds,
          clientIds: filters.clientIds,
          billable: filters.billable,
        },
      }),
    })
  },

  getSharedReports: async () => {
    const token = useAuthStore.getState().token
    const raw = await apiRequest<unknown>('/shared-reports', { method: 'GET', token })
    return extractArray<SharedReport>(raw)
  },

  getSharedReport: async (token) => {
    return await apiRequest<SharedReportData>(`/shared-reports/${token}`, {
      method: 'GET',
    })
  },

  getDashboardStats: async () => {
    const token = useAuthStore.getState().token
    return await apiRequest<DashboardStats>('/dashboard/stats', {
      method: 'GET',
      token,
    })
  },
}))
