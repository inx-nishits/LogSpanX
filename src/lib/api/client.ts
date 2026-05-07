export interface ApiEnvelope<T> {
  success: boolean
  message?: string
  data: T
  error?: string
}

export class ApiError extends Error {
  status: number
  details: unknown

  constructor(message: string, status = 500, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

export const COOKIE_SESSION_TOKEN = '__trackify_cookie_session__'

function getConfiguredApiBaseUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim()

  if (baseUrl) {
    return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
  }

  throw new ApiError(
    'Missing NEXT_PUBLIC_API_BASE_URL. Set it in your environment before using the API-backed app.',
    500
  )
}

function buildUrl(path: string, query?: Record<string, string | number | boolean | null | undefined>) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const isBrowser = typeof window !== 'undefined'
  const browserPath = normalizedPath.startsWith('/api/')
    ? normalizedPath
    : `/api/backend${normalizedPath}`
  const url = isBrowser
    ? new URL(browserPath, window.location.origin)
    : new URL(`${getConfiguredApiBaseUrl()}${normalizedPath}`)

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === '') continue
      url.searchParams.set(key, String(value))
    }
  }

  return url.toString()
}

function unwrapApiPayload(payload: unknown, depth = 0): unknown {
  if (depth > 3 || !payload || typeof payload !== 'object') return payload

  const obj = payload as Record<string, unknown>

  if (obj.success === true && obj.data && typeof obj.data === 'object') {
    return unwrapApiPayload(obj.data, depth + 1)
  }

  return payload
}

function getMessage(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== 'object') return fallback

  const message =
    ('message' in payload && typeof payload.message === 'string' && payload.message) ||
    ('error' in payload && typeof payload.error === 'string' && payload.error)

  return message || fallback
}

async function parseResponsePayload(response: Response) {
  const contentType = response.headers.get('Content-Type')
  const isJson = contentType?.includes('application/json')
  
  if (!isJson) {
    const text = await response.text()
    if (!text) return null
    return { message: text }
  }

  try {
    return await response.json()
  } catch (err) {
    const text = await response.text().catch(() => '')
    return { 
      message: 'Failed to parse JSON response', 
      parseError: err instanceof Error ? err.message : String(err),
      rawBody: text.slice(0, 500) // Limit size
    }
  }
}

let isRefreshing = false
let refreshQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = []

async function doRefresh(): Promise<string> {
  if (isRefreshing) {
    return new Promise<string>((resolve, reject) => {
      refreshQueue.push({ resolve, reject })
    })
  }

  isRefreshing = true

  try {
    const res = await fetch(buildUrl('/api/auth/session'), {
      method: 'GET',
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
      },
    })

    if (!res.ok) throw new ApiError('Refresh failed', res.status)

    // Try to extract the new token from the response body so we can
    // use it immediately without waiting for the browser to apply the
    // Set-Cookie header (which may not be ready before the retry fires)
    let freshToken = COOKIE_SESSION_TOKEN
    try {
      const body = await res.clone().json()
      const t = body?.token ?? body?.data?.token ?? body?.user?.token
      if (t && typeof t === 'string') freshToken = t
    } catch { /* ignore — fall back to cookie-based token */ }

    const queue = refreshQueue
    refreshQueue = []
    queue.forEach(({ resolve }) => resolve(freshToken))
    return freshToken
  } catch (err) {
    const queue = refreshQueue
    refreshQueue = []
    queue.forEach(({ reject }) => reject(err))
    throw err
  } finally {
    isRefreshing = false
  }
}

export async function apiRequest<T>(
  path: string,
  options: Omit<RequestInit, 'headers'> & {
    headers?: HeadersInit
    query?: Record<string, string | number | boolean | null | undefined>
    token?: string | null
    timeout?: number
  } = {}
): Promise<T> {
  const { query, token, headers, timeout = 15000, ...requestInit } = options

  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)

  const makeRequest = (authToken: string | null | undefined) =>
    fetch(buildUrl(path, query), {
      ...requestInit,
      signal: controller.signal,
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
        ...(requestInit.body ? { 'Content-Type': 'application/json' } : {}),
        ...(authToken && authToken !== COOKIE_SESSION_TOKEN ? { Authorization: `Bearer ${authToken}` } : {}),
        ...headers,
      },
    })

  try {
    let response = await makeRequest(token)

    if (response.status === 401 && token && !path.startsWith('/auth/') && !path.startsWith('/api/auth/')) {
      try {
        const newToken = await doRefresh()
        response = await makeRequest(newToken)
      } catch {
        const { useAuthStore } = await import('@/lib/stores/auth-store')
        useAuthStore.setState({
          token: null,
          refreshToken: null,
          user: null,
          authStatus: 'unauthenticated',
          error: null,
        })
        throw new ApiError('Session expired. Please log in again.', 401)
      }
    }

    const payload = await parseResponsePayload(response)
    const unwrapped = unwrapApiPayload(payload)

    if (!response.ok) {
      const message = getMessage(payload, `Request failed with status ${response.status}`)
      // Show toast for permission errors
      if (response.status === 403) {
        const { useToastStore } = await import('@/lib/stores/toast-store')
        useToastStore.getState().show('You do not have permission to perform this action', 'error')
      }
      throw new ApiError(message, response.status, payload)
    }

    if (payload && typeof payload === 'object' && 'success' in payload && payload.success === false) {
      throw new ApiError(getMessage(payload, 'Request failed'), response.status, payload)
    }

    return unwrapped as T
  } finally {
    clearTimeout(id)
  }
}
