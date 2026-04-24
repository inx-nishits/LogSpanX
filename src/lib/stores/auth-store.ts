import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { apiRequest } from '@/lib/api/client'
import { ApiUser, mapApiUser } from '@/lib/api/mappers'
import { User } from '@/lib/types'

interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  hasHydrated: boolean
  isInitializing: boolean
  error: string | null
  initialize: () => Promise<void>
  login: (email: string, password: string) => Promise<boolean>
  signup: (name: string, email: string, password: string) => Promise<boolean>
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (token: string, newPassword: string) => Promise<void>
  logout: () => Promise<void>
  updateUser: (user: Partial<User>) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  setRole: (role: User['role']) => Promise<void>
  inviteUser: (email: string, role: User['role'], billableRate?: number) => Promise<void>
}

interface AuthPayload {
  token: string
  user: ApiUser
}

const initialState = {
  token: null,
  user: null,
  isAuthenticated: false,
  hasHydrated: false,
  isInitializing: true,
  error: null,
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...initialState,

      initialize: async () => {
        const token = get().token

        if (!token) {
          set({ isInitializing: false, isAuthenticated: false, user: null, error: null })
          return
        }

        set({ isInitializing: true, error: null })

        try {
          const profile = await apiRequest<ApiUser>('/auth/me', { method: 'GET', token })
          set({
            token,
            user: mapApiUser(profile),
            isAuthenticated: true,
            isInitializing: false,
            error: null,
          })
        } catch (error) {
          console.error('Failed to initialize auth', error)
          set({
            token: null,
            user: null,
            isAuthenticated: false,
            isInitializing: false,
            error: error instanceof Error ? error.message : 'Failed to initialize session',
          })
        }
      },

      login: async (email: string, password: string) => {
        set({ error: null })

        try {
          const payload = await apiRequest<AuthPayload>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
            token: null,
          })

          set({
            token: payload.token,
            user: mapApiUser(payload.user),
            isAuthenticated: true,
            isInitializing: false,
            error: null,
          })

          return true
        } catch (error) {
          set({
            token: null,
            user: null,
            isAuthenticated: false,
            isInitializing: false,
            error: error instanceof Error ? error.message : 'Login failed',
          })
          return false
        }
      },

      signup: async (name: string, email: string, password: string) => {
        set({ error: null })

        try {
          const payload = await apiRequest<AuthPayload>('/auth/signup', {
            method: 'POST',
            body: JSON.stringify({ name, email, password }),
            token: null,
          })

          set({
            token: payload.token,
            user: mapApiUser(payload.user),
            isAuthenticated: true,
            isInitializing: false,
            error: null,
          })

          return true
        } catch (error) {
          set({
            token: null,
            user: null,
            isAuthenticated: false,
            isInitializing: false,
            error: error instanceof Error ? error.message : 'Signup failed',
          })
          return false
        }
      },

      forgotPassword: async (email) => {
        await apiRequest('/auth/forgot-password', {
          method: 'POST',
          body: JSON.stringify({ email }),
          token: null,
        })
      },

      resetPassword: async (token, newPassword) => {
        await apiRequest('/auth/reset-password', {
          method: 'POST',
          body: JSON.stringify({ token, newPassword }),
          token: null,
        })
      },

      logout: async () => {
        const token = get().token

        try {
          if (token) {
            await apiRequest('/auth/logout', {
              method: 'POST',
              token,
              credentials: 'include',
            })
          }
        } catch (error) {
          console.error('Logout API failed, clearing local state anyway', error)
        } finally {
          set({
            token: null,
            user: null,
            isAuthenticated: false,
            isInitializing: false,
            error: null,
          })
        }
      },

      updateUser: async (userData) => {
        const token = get().token
        const updatedProfile = await apiRequest<ApiUser>('/auth/me', {
          method: 'PUT',
          token,
          body: JSON.stringify({
            name: userData.name,
            avatar: userData.avatar,
          }),
        })

        set({
          user: mapApiUser(updatedProfile),
          error: null,
        })
      },

      changePassword: async (currentPassword, newPassword) => {
        const token = get().token
        await apiRequest('/auth/me/password', {
          method: 'PUT',
          token,
          body: JSON.stringify({ currentPassword, newPassword }),
        })
      },

      setRole: async (role) => {
        const currentUser = get().user
        const token = get().token
        if (!currentUser) return

        const updatedUser = await apiRequest<ApiUser>(`/users/${currentUser.id}`, {
          method: 'PUT',
          token,
          body: JSON.stringify({ role }),
        })

        set({
          user: mapApiUser(updatedUser),
          error: null,
        })
      },

      inviteUser: async (email, role, billableRate = 0) => {
        const token = get().token
        await apiRequest('/users/invite', {
          method: 'POST',
          token,
          body: JSON.stringify({ email, role, billableRate }),
        })
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.hasHydrated = true
        }
      },
    }
  )
)
