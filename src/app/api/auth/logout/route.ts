import { NextResponse } from 'next/server'
import { backendUrl, clearAuthCookies, getAccessToken } from '@/lib/server/auth-cookies'

export async function POST() {
  const token = await getAccessToken()

  if (token) {
    await fetch(backendUrl('/auth/logout'), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    }).catch(() => null)
  }

  const response = NextResponse.json({ success: true })
  clearAuthCookies(response)
  return response
}
