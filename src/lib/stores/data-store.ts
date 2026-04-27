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
  serializeProjectMember,
  serializeTimeEntryPatch,
} from '@/lib/api/mappers'
import { Client, Group, Project, Tag, Task, TimeEntry, User } from '@/lib/types'

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

  createTag: (name: string) => Promise<void>
  updateTag: (id: string, updates: Partial<Tag>) => Promise<void>
  deleteTag: (id: string) => Promise<void>

  inviteUser: (email: string, role: User['role'], billableRate?: number) => Promise<void>
  updateUserRecord: (id: string, updates: Partial<User>) => Promise<void>
  deleteUserRecord: (id: string) => Promise<void>
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
  const taskGroups = await Promise.all(
    projects.map(async (project) => {
      const tasksRaw = await apiRequest<ApiTask[]>(`/projects/${project.id}/tasks`, { method: 'GET', token })
      const tasks = extractArray<ApiTask>(tasksRaw)
      return tasks.map((task) => mapApiTask(task, project.id))
    })
  )

  return taskGroups.flat()
}

export const useDataStore = create<DataStore>((set, get) => ({
  ...initialState(),

  initialize: async () => {
    if (get().isLoading) return
    const token = useAuthStore.getState().token
    if (!token) {
      set({ ...initialState(), isInitialized: false })
      return
    }

    set({ isLoading: true, error: null })

    try {
      const [usersRaw, groupsRaw, clientsRaw, projectsRaw, tagsRaw, timeEntriesResult] = await Promise.all([
        apiRequest<unknown>('/users', { method: 'GET', token }),
        apiRequest<unknown>('/groups', { method: 'GET', token }),
        apiRequest<unknown>('/clients', { method: 'GET', token }),
        apiRequest<unknown>('/projects', { method: 'GET', token }),
        apiRequest<unknown>('/tags', { method: 'GET', token }),
        apiRequest<unknown>('/time-entries', { method: 'GET', token }),
      ])

      const users = extractArray<ApiUser>(usersRaw)
      const groups = extractArray<ApiGroup>(groupsRaw)
      const clients = extractArray<ApiClient>(clientsRaw)
      const projects = extractArray<ApiProject>(projectsRaw)
      const tags = extractArray<ApiTag>(tagsRaw)
      const normalizedProjects = projects.map(mapApiProject)
      const tasks = await fetchProjectTasks(normalizedProjects)

      const timeEntriesRaw = Array.isArray(timeEntriesResult)
        ? timeEntriesResult
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
      console.error('Failed to initialize data store', error)
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
    const payload = await apiRequest<ApiTimeEntry>('/time-entries', {
      method: 'POST',
      token,
      body: JSON.stringify(serializeTimeEntryPatch(entry)),
    })

    const createdEntry = mapApiTimeEntry(payload)
    set((state) => ({
      timeEntries: [createdEntry, ...state.timeEntries],
    }))
  },

  updateTimeEntry: async (id, updates) => {
    const token = useAuthStore.getState().token
    const payload = await apiRequest<ApiTimeEntry>(`/time-entries/${id}`, {
      method: 'PUT',
      token,
      body: JSON.stringify(serializeTimeEntryPatch(updates)),
    })

    const updatedEntry = mapApiTimeEntry(payload)
    set((state) => ({
      timeEntries: state.timeEntries.map((entry) => (entry.id === id ? updatedEntry : entry)),
    }))
  },

  deleteTimeEntry: async (id) => {
    const token = useAuthStore.getState().token
    const entryToDelete = get().timeEntries.find((entry) => entry.id === id)
    if (!entryToDelete) return

    await apiRequest(`/time-entries/${id}`, { method: 'DELETE', token })

    set((state) => ({
      lastDeletedEntries: [entryToDelete],
      timeEntries: state.timeEntries.filter((entry) => entry.id !== id),
    }))
  },

  deleteTimeEntries: async (ids) => {
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
  },

  updateTimeEntries: async (ids, updates) => {
    await Promise.all(ids.map((id) => get().updateTimeEntry(id, updates)))
  },

  undoDelete: async () => {
    const token = useAuthStore.getState().token
    const lastDeletedEntries = get().lastDeletedEntries
    if (lastDeletedEntries.length === 0) return

    await apiRequest('/time-entries/undo-delete', {
      method: 'POST',
      token,
      body: JSON.stringify({ ids: lastDeletedEntries.map((entry) => entry.id) }),
    })

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
        clientId: project.clientId,
        leadId: project.leadId,
        billable: project.billable,
        hourlyRate: project.hourlyRate,
        members: project.members.map(serializeProjectMember),
      }),
    })

    const createdProject = mapApiProject(payload)
    set((state) => ({
      projects: [...state.projects, createdProject],
    }))
  },

  updateProject: async (id, updates) => {
    const token = useAuthStore.getState().token
    const payload = await apiRequest<ApiProject>(`/projects/${id}`, {
      method: 'PUT',
      token,
      body: JSON.stringify({
        name: updates.name,
        color: updates.color,
        clientId: updates.clientId,
        leadId: updates.leadId,
        billable: updates.billable,
        hourlyRate: updates.hourlyRate,
        archived: updates.archived,
        members: updates.members?.map(serializeProjectMember),
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
    const updatedProjects = new Map(projectsArray.map((project) => [project.id, mapApiProject(project)]))
    set((state) => ({
      projects: state.projects.map((project) => updatedProjects.get(project.id) ?? project),
    }))
  },

  deleteProject: async (id) => {
    const token = useAuthStore.getState().token
    await apiRequest(`/projects/${id}`, { method: 'DELETE', token })
    set((state) => ({
      projects: state.projects.filter((project) => project.id !== id),
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
}))
