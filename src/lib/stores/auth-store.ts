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
  setRole: (role: User['role']) => void
  inviteUser: (email: string, role: User['role']) => Promise<void>
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
      },

      setRole: (role) => {
        const currentUser = get().user
        if (currentUser) {
          set({
            user: { ...currentUser, role }
          })
        }
      },

      inviteUser: async (email, role) => {
        // Mock API call delay
        await new Promise(resolve => setTimeout(resolve, 1500))
        console.log(`[Mock] Invitation sent to ${email} with role ${role}`)
      }
    }),
    {
      name: 'auth-storage'
    }
  )
)
