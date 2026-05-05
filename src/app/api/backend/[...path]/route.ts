import { NextRequest, NextResponse } from 'next/server'
import { backendUrl, clearAuthCookies, getAccessToken, setAuthCookies } from '@/lib/server/auth-cookies'
import { applyRefreshCookies } from '@/lib/server/backend-auth'

type RouteContext = {
  params: Promise<{ path: string[] }>
}

const forbiddenRequestHeaders = new Set([
  'host',
  'connection',
  'content-length',
  'cookie',
])

function cloneForwardHeaders(request: NextRequest, token: string | null) {
  const headers = new Headers()

  for (const [key, value] of request.headers.entries()) {
    if (forbiddenRequestHeaders.has(key.toLowerCase())) continue
    headers.set(key, value)
  }

  headers.set('Accept', request.headers.get('accept') ?? 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  return headers
}

async function forward(request: NextRequest, path: string, token: string | null) {
  const hasBody = !['GET', 'HEAD'].includes(request.method)

  return fetch(backendUrl(path, request.nextUrl.search), {
    method: request.method,
    headers: cloneForwardHeaders(request, token),
    body: hasBody ? await request.arrayBuffer() : undefined,
    cache: 'no-store',
  })
}

async function handler(request: NextRequest, context: RouteContext) {
  const { path: pathParts } = await context.params
  const path = `/${pathParts.join('/')}`
  let token = await getAccessToken()
  let backendResponse = await forward(request, path, token)
  const cookieResponse = NextResponse.next()

  if (backendResponse.status === 401 && token && !path.startsWith('/auth/')) {
    token = await applyRefreshCookies(cookieResponse)
    if (token) {
      backendResponse = await forward(request, path, token)
    }
  }

  const responseHeaders = new Headers()
  const contentType = backendResponse.headers.get('content-type')
  if (contentType) responseHeaders.set('content-type', contentType)

  const response = new NextResponse(backendResponse.body, {
    status: backendResponse.status,
    headers: responseHeaders,
  })

  for (const cookie of cookieResponse.cookies.getAll()) {
    response.cookies.set(cookie)
  }

  if (backendResponse.status === 401 || backendResponse.status === 403) {
    clearAuthCookies(response)
  }

  if (token) {
    setAuthCookies(response, { token })
  }

  return response
}

export const GET = handler
export const POST = handler
export const PUT = handler
export const PATCH = handler
export const DELETE = handler
