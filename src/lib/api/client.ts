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

function getApiBaseUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim()

  if (baseUrl) {
    return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
  }

  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  throw new ApiError(
    'Missing NEXT_PUBLIC_API_BASE_URL. Set it in your environment before using the API-backed app.',
    500
  )
}

function buildUrl(path: string, query?: Record<string, string | number | boolean | null | undefined>) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const url = new URL(`${getApiBaseUrl()}${normalizedPath}`)

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

// ─── Token refresh logic ──────────────────────────────────────────────────────
// Prevents multiple concurrent refresh calls — all queued requests wait for
// the single in-flight refresh to resolve, then retry with the new token.
let isRefreshing = false
let refreshQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = []

async function doRefresh(expiredToken: string): Promise<string> {
  if (isRefreshing) {
    return new Promise<string>((resolve, reject) => {
      refreshQueue.push({ resolve, reject })
    })
  }

  isRefreshing = true

  try {
    const res = await fetch(buildUrl('/auth/refresh'), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${expiredToken}`,
      },
    })

    if (!res.ok) throw new ApiError('Refresh failed', res.status)

    const raw = await res.json()
    const unwrapped = unwrapApiPayload(raw) as { token?: string }
    const newToken = unwrapped?.token

    if (!newToken) throw new ApiError('No token in refresh response', 500)

    const { useAuthStore } = await import('@/lib/stores/auth-store')
    useAuthStore.getState().setToken(newToken)

    const queue = refreshQueue
    refreshQueue = []
    queue.forEach(({ resolve }) => resolve(newToken))
    return newToken
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
  } = {}
): Promise<T> {
  const { query, token, headers, ...requestInit } = options

  const makeRequest = (authToken: string | null | undefined) =>
    fetch(buildUrl(path, query), {
      ...requestInit,
      headers: {
        Accept: 'application/json',
        ...(requestInit.body ? { 'Content-Type': 'application/json' } : {}),
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...headers,
      },
    })

  let response = await makeRequest(token)

  // On 401, attempt one token refresh then retry — skip for auth endpoints
  if (response.status === 401 && token && !path.startsWith('/auth/')) {
    try {
      const newToken = await doRefresh(token)
      response = await makeRequest(newToken)
    } catch {
      // Refresh failed — force logout
      const { useAuthStore } = await import('@/lib/stores/auth-store')
      useAuthStore.getState().logout()
      throw new ApiError('Session expired. Please log in again.', 401)
    }
  }

  const rawText = await response.text()
  const payload = rawText ? JSON.parse(rawText) : null
  const unwrapped = unwrapApiPayload(payload)

  if (!response.ok) {
    throw new ApiError(getMessage(payload, `Request failed with status ${response.status}`), response.status, payload)
  }

  if (payload && typeof payload === 'object' && 'success' in payload && payload.success === false) {
    throw new ApiError(getMessage(payload, 'Request failed'), response.status, payload)
  }

  return unwrapped as T
}
