import { NextResponse } from 'next/server'
import { backendUrl, clearAuthCookies, getAccessToken, setAuthCookies, unwrapPayload } from '@/lib/server/auth-cookies'
import { applyRefreshCookies, parseBackendResponse } from '@/lib/server/backend-auth'

async function fetchProfile(token: string) {
  return fetch(backendUrl('/auth/me'), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  })
}

export async function GET() {
  let token = await getAccessToken()

  if (!token) {
    const response = NextResponse.json({ user: null }, { status: 401 })
    clearAuthCookies(response)
    return response
  }

  let backendResponse = await fetchProfile(token)
  const nextResponse = NextResponse.next()

  if (backendResponse.status === 401) {
    token = await applyRefreshCookies(nextResponse)
    if (!token) {
      const response = NextResponse.json({ user: null }, { status: 401 })
      clearAuthCookies(response)
      return response
    }
    backendResponse = await fetchProfile(token)
  }

  const payload = await parseBackendResponse(backendResponse)
  const profile = unwrapPayload(payload)

  if (!backendResponse.ok) {
    const response = NextResponse.json(payload, { status: backendResponse.status })
    if (backendResponse.status === 401 || backendResponse.status === 403) {
      clearAuthCookies(response)
    }
    return response
  }

  const response = NextResponse.json({ user: profile, token }, { status: 200 })
  setAuthCookies(response, { token, user: profile as Parameters<typeof setAuthCookies>[1]['user'] })

  for (const cookie of nextResponse.cookies.getAll()) {
    response.cookies.set(cookie)
  }

  return response
}
