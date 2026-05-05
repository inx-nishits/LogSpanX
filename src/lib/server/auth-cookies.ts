import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { ApiUser, mapApiUser } from '@/lib/api/mappers'
import { ACCESS_COOKIE, REFRESH_COOKIE, ROLE_COOKIE } from '@/lib/auth-constants'

export { ACCESS_COOKIE, REFRESH_COOKIE, ROLE_COOKIE }

export interface BackendAuthPayload {
  token?: string
  refreshToken?: string
  user?: ApiUser
}

const isProduction = process.env.NODE_ENV === 'production'

const baseCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax' as const,
  path: '/',
}

export function unwrapPayload(payload: unknown, depth = 0): unknown {
  if (depth > 3 || !payload || typeof payload !== 'object') return payload

  const obj = payload as Record<string, unknown>
  if (obj.success === true && obj.data && typeof obj.data === 'object') {
    return unwrapPayload(obj.data, depth + 1)
  }

  return payload
}

export function getBackendBaseUrl() {
  const baseUrl =
    process.env.API_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_BASE_URL?.trim()

  if (!baseUrl) {
    throw new Error('Missing API_BASE_URL or NEXT_PUBLIC_API_BASE_URL.')
  }

  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
}

export function backendUrl(path: string, search = '') {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${getBackendBaseUrl()}${normalizedPath}${search}`
}

export function setAuthCookies(response: NextResponse, payload: BackendAuthPayload) {
  if (payload.token) {
    response.cookies.set(ACCESS_COOKIE, payload.token, {
      ...baseCookieOptions,
      maxAge: 60 * 60,
      priority: 'high',
    })
  }

  if (payload.refreshToken) {
    response.cookies.set(REFRESH_COOKIE, payload.refreshToken, {
      ...baseCookieOptions,
      maxAge: 60 * 60 * 24 * 30,
      priority: 'high',
    })
  }

  if (payload.user) {
    response.cookies.set(ROLE_COOKIE, mapApiUser(payload.user).role, {
      ...baseCookieOptions,
      maxAge: 60 * 60 * 24 * 30,
      priority: 'medium',
    })
  }
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.set(ACCESS_COOKIE, '', { ...baseCookieOptions, maxAge: 0 })
  response.cookies.set(REFRESH_COOKIE, '', { ...baseCookieOptions, maxAge: 0 })
  response.cookies.set(ROLE_COOKIE, '', { ...baseCookieOptions, maxAge: 0 })
}

export async function getAccessToken() {
  return (await cookies()).get(ACCESS_COOKIE)?.value ?? null
}

export async function getRefreshToken() {
  return (await cookies()).get(REFRESH_COOKIE)?.value ?? null
}
