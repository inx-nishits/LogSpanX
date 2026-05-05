import { create } from 'zustand'
import { apiRequest, COOKIE_SESSION_TOKEN } from '@/lib/api/client'
import { ApiUser, mapApiUser } from '@/lib/api/mappers'
import { User } from '@/lib/types'

interface AuthState {
  token: string | null
  refreshToken: string | null
  user: User | null
  authStatus: 'idle' | 'initializing' | 'authenticated' | 'unauthenticated'
  hasHydrated: boolean
  error: string | null
  setToken: (token: string, refreshToken?: string) => void
  initialize: () => Promise<void>
  refreshSession: () => Promise<void>
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
  refreshToken: string
  user: ApiUser
}

interface SessionPayload {
  user: ApiUser | null
}

const initialState = {
  token: null,
  refreshToken: null,
  user: null,
  authStatus: 'idle' as const,
  hasHydrated: true,
  error: null,
}

function authenticatedState(user: ApiUser, token?: string, refreshToken?: string) {
  return {
    token: token ?? COOKIE_SESSION_TOKEN,
    refreshToken: refreshToken ?? null,
    user: mapApiUser(user),
    authStatus: 'authenticated' as const,
    error: null,
  }
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  ...initialState,

  setToken: () => {
    set({ token: COOKIE_SESSION_TOKEN, refreshToken: null })
  },

  refreshSession: async () => {
    const payload = await apiRequest<SessionPayload>('/api/auth/session', { method: 'GET' })

    if (!payload.user) {
      set({ token: null, refreshToken: null, user: null, authStatus: 'unauthenticated' })
      return
    }

    set(authenticatedState(payload.user))
  },

  initialize: async () => {
    set({ authStatus: 'initializing', error: null })

    try {
      await get().refreshSession()
    } catch (error) {
      const status = error instanceof Error && 'status' in error ? (error as { status: number }).status : 0
      if (status === 401 || status === 403) {
        set({ token: null, refreshToken: null, user: null, authStatus: 'unauthenticated', error: null })
        return
      }

      console.error('Failed to initialize auth:', error instanceof Error ? error.message : String(error))
      set({
        token: null,
        refreshToken: null,
        user: null,
        authStatus: 'unauthenticated',
        error: error instanceof Error ? error.message : 'Failed to initialize session',
      })
    }
  },

  login: async (email: string, password: string) => {
    set({ error: null })
    try {
      const payload = await apiRequest<AuthPayload>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        token: null,
      })
      set(authenticatedState(payload.user, payload.token, payload.refreshToken))
      return true
    } catch (error) {
      set({
        token: null,
        refreshToken: null,
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
      const payload = await apiRequest<AuthPayload>('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
        token: null,
      })
      set(authenticatedState(payload.user, payload.token, payload.refreshToken))
      return true
    } catch (error) {
      set({
        token: null,
        refreshToken: null,
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
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Logout API failed, clearing local state anyway:', error instanceof Error ? error.message : String(error))
    } finally {
      set({
        token: null,
        refreshToken: null,
        user: null,
        authStatus: 'unauthenticated',
        error: null,
      })
    }
  },

  updateUser: async (userData) => {
    const updatedProfile = await apiRequest<ApiUser>('/auth/me', {
      method: 'PUT',
      token: get().token,
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
    await apiRequest('/auth/me/password', {
      method: 'PUT',
      token: get().token,
      body: JSON.stringify({ currentPassword, newPassword }),
    })
  },

  setRole: async (role) => {
    const currentUser = get().user
    if (!currentUser) return

    const updatedUser = await apiRequest<ApiUser>(`/users/${currentUser.id}`, {
      method: 'PUT',
      token: get().token,
      body: JSON.stringify({ role }),
    })

    set({
      user: mapApiUser(updatedUser),
      error: null,
    })
  },

  inviteUser: async (email, role, billableRate = 0) => {
    await apiRequest('/users/invite', {
      method: 'POST',
      token: get().token,
      body: JSON.stringify({ email, role, billableRate }),
    })
  },
}))
