import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, Workspace } from '@/lib/types'
import { mockUsers, mockWorkspace } from '@/data/mock-data'

interface AuthState {
  user: User | null
  workspace: Workspace | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  updateUser: (user: Partial<User>) => void
  updateWorkspace: (workspace: Partial<Workspace>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      workspace: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        // Mock authentication logic
        const user = mockUsers.find(u => u.email === email)
        if (user && password === 'password') {
          set({
            user,
            workspace: mockWorkspace,
            isAuthenticated: true
          })
          return true
        }
        return false
      },

      logout: () => {
        set({
          user: null,
          workspace: null,
          isAuthenticated: false
        })
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData }
          })
        }
      },

      updateWorkspace: (workspaceData: Partial<Workspace>) => {
        const currentWorkspace = get().workspace
        if (currentWorkspace) {
          set({
            workspace: { ...currentWorkspace, ...workspaceData }
          })
        }
      }
    }),
    {
      name: 'auth-storage'
    }
  )
)
