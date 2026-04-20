import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { TimeEntry, Project, Client, Task, User } from '@/lib/types'
import {
  mockTimeEntries,
  mockProjects,
  mockClients,
  mockTasks,
  mockUsers
} from '@/data/mock-data'
import { generateId } from '@/lib/utils'

interface DataStore {
  timeEntries: TimeEntry[]
  projects: Project[]
  clients: Client[]
  tasks: Task[]
  users: User[]

  // Undo state
  lastDeletedEntries: TimeEntry[]

  // Time entries
  addTimeEntry: (entry: Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateTimeEntry: (id: string, updates: Partial<TimeEntry>) => void
  deleteTimeEntry: (id: string) => void
  deleteMultipleTimeEntries: (ids: string[]) => void
  undoDelete: () => void

  getTimeEntriesByUser: (userId: string) => TimeEntry[]
  getTimeEntriesByProject: (projectId: string) => TimeEntry[]

  // Projects
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void
}

export const useDataStore = create<DataStore>()(
  persist(
    (set, get) => ({
      timeEntries: mockTimeEntries,
      projects: mockProjects,
      clients: mockClients,
      tasks: mockTasks,
      users: mockUsers,
      lastDeletedEntries: [],

      addTimeEntry: (entry) => {
        const newEntry: TimeEntry = {
          ...entry,
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date()
        }
        set((state) => ({
          timeEntries: [...state.timeEntries, newEntry]
        }))
      },

      updateTimeEntry: (id, updates) => {
        set((state) => ({
          timeEntries: state.timeEntries.map(entry =>
            entry.id === id ? { ...entry, ...updates, updatedAt: new Date() } : entry
          )
        }))
      },

      deleteTimeEntry: (id) => {
        const entryToDelete = get().timeEntries.find(e => e.id === id)
        if (entryToDelete) {
          set((state) => ({
            lastDeletedEntries: [entryToDelete],
            timeEntries: state.timeEntries.filter(e => e.id !== id)
          }))
        }
      },

      deleteMultipleTimeEntries: (ids) => {
        const entriesToDelete = get().timeEntries.filter(e => ids.includes(e.id))
        set((state) => ({
          lastDeletedEntries: entriesToDelete,
          timeEntries: state.timeEntries.filter(e => !ids.includes(e.id))
        }))
      },

      undoDelete: () => {
        const { lastDeletedEntries, timeEntries } = get()
        if (lastDeletedEntries.length > 0) {
          set({
            timeEntries: [...timeEntries, ...lastDeletedEntries],
            lastDeletedEntries: []
          })
        }
      },

      getTimeEntriesByUser: (userId) => get().timeEntries.filter(e => e.userId === userId),
      getTimeEntriesByProject: (projectId) => get().timeEntries.filter(e => e.projectId === projectId),

      addProject: (project) => {
        const newProject: Project = { ...project, id: generateId(), createdAt: new Date(), updatedAt: new Date() }
        set((state) => ({ projects: [...state.projects, newProject] }))
      }
    }),
    {
      name: 'logspanx-storage-v4',  // Bumped to clear old 2024 mock data, now uses current dates
    }
  )
)
