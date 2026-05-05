import { NextRequest, NextResponse } from 'next/server'
import { backendUrl, BackendAuthPayload, setAuthCookies, unwrapPayload } from '@/lib/server/auth-cookies'
import { parseBackendResponse } from '@/lib/server/backend-auth'

export async function POST(request: NextRequest) {
  const response = await fetch(backendUrl('/auth/login'), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': request.headers.get('content-type') ?? 'application/json',
    },
    body: await request.text(),
    cache: 'no-store',
  })

  const payload = await parseBackendResponse(response)
  const authPayload = unwrapPayload(payload) as BackendAuthPayload
  const nextResponse = NextResponse.json(payload, { status: response.status })

  if (response.ok) {
    setAuthCookies(nextResponse, authPayload)
  }

  return nextResponse
}
