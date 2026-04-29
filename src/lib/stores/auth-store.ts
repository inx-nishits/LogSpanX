import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { apiRequest } from '@/lib/api/client'
import { ApiUser, mapApiUser } from '@/lib/api/mappers'
import { User } from '@/lib/types'

interface AuthState {
  token: string | null
  user: User | null
  authStatus: 'idle' | 'initializing' | 'authenticated' | 'unauthenticated'
  hasHydrated: boolean
  error: string | null
  setToken: (token: string) => void
  initialize: () => Promise<void>
  refreshToken: () => Promise<void>
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
  authStatus: 'idle' as const,
  hasHydrated: false,
  error: null,
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setToken: (newToken: string) => {
        set({ token: newToken })
      },

      refreshToken: async () => {
        const token = get().token
        if (!token) return
        try {
          const payload = await apiRequest<{ token: string }>('/auth/refresh', {
            method: 'POST',
            token,
          })
          set({ token: payload.token })
        } catch (err) {
          if (err instanceof Error && 'status' in err && (err as { status: number }).status === 401) {
            set({ token: null, user: null, authStatus: 'unauthenticated' })
          }
          throw err
        }
      },

      initialize: async () => {
        const token = get().token

        if (!token) {
          set({ authStatus: 'unauthenticated', error: null })
          return
        }

        // Prevent re-running if already authenticated with a valid token
        if (get().authStatus === 'authenticated' && get().user) {
          return
        }

        set({ authStatus: 'initializing', error: null })

        try {
          // Attempt token refresh — failures are non-fatal unless the token is cleared (401)
          let activeToken = token
          try {
            await get().refreshToken()
            activeToken = get().token ?? token
          } catch {
            // If refresh cleared the token (401 expired), bail out
            if (!get().token) {
              set({ authStatus: 'unauthenticated' })
              return
            }
            // Any other error (network, 5xx) — continue with the original token
            activeToken = token
          }

          const profile = await apiRequest<ApiUser>('/auth/me', { method: 'GET', token: activeToken })
          set({
            token: activeToken,
            user: mapApiUser(profile),
            authStatus: 'authenticated',
            error: null,
          })
        } catch (error) {
          const status = (error instanceof Error && 'status' in error) ? (error as { status: number }).status : 0
          // Only clear session on definitive auth failures (401/403)
          // Network errors or server errors should not log the user out
          if (status === 401 || status === 403) {
            set({ token: null, user: null, authStatus: 'unauthenticated', error: null })
          } else {
            console.error('Failed to initialize auth', error)
            set({ authStatus: 'unauthenticated', error: error instanceof Error ? error.message : 'Failed to initialize session' })
          }
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
            authStatus: 'authenticated',
            error: null,
          })
          return true
        } catch (error) {
          set({
            token: null,
            user: null,
            authStatus: 'unauthenticated',
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
            authStatus: 'authenticated',
            error: null,
          })
          return true
        } catch (error) {
          set({
            token: null,
            user: null,
            authStatus: 'unauthenticated',
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
            authStatus: 'unauthenticated',
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
        authStatus: state.authStatus === 'authenticated' ? 'authenticated' : 'idle' as const,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.hasHydrated = true
          // If we have a token + user persisted, treat as authenticated immediately
          // initialize() will validate/refresh in the background
          if (state.token && state.user && state.authStatus === 'authenticated') {
            state.authStatus = 'authenticated'
          }
        }
      },
    }
  )
)
