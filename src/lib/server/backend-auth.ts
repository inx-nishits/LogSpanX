import { NextResponse } from 'next/server'
import {
  BackendAuthPayload,
  backendUrl,
  clearAuthCookies,
  getRefreshToken,
  setAuthCookies,
  unwrapPayload,
} from '@/lib/server/auth-cookies'

export async function parseBackendResponse(response: Response) {
  const text = await response.text()
  if (!text) return null

  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) return text

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

export async function refreshAccessToken() {
  const refreshToken = await getRefreshToken()
  if (!refreshToken) return null

  const response = await fetch(backendUrl('/auth/refresh'), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
    cache: 'no-store',
  })

  const payload = unwrapPayload(await parseBackendResponse(response)) as BackendAuthPayload
  if (!response.ok || !payload?.token) return null

  return {
    token: payload.token,
    refreshToken: payload.refreshToken ?? refreshToken,
    user: payload.user,
  } satisfies BackendAuthPayload
}

export async function applyRefreshCookies(response: NextResponse) {
  const refreshed = await refreshAccessToken()
  if (!refreshed?.token) {
    clearAuthCookies(response)
    return null
  }

  setAuthCookies(response, refreshed)
  return refreshed.token
}
