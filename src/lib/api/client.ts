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

export const COOKIE_SESSION_TOKEN = '__logspanx_cookie_session__'

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
  const rawText = await response.text()
  if (!rawText) return null

  try {
    return JSON.parse(rawText)
  } catch {
    return { message: rawText }
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

    const queue = refreshQueue
    refreshQueue = []
    queue.forEach(({ resolve }) => resolve(COOKIE_SESSION_TOKEN))
    return COOKIE_SESSION_TOKEN
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
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
        ...(requestInit.body ? { 'Content-Type': 'application/json' } : {}),
        ...(authToken && authToken !== COOKIE_SESSION_TOKEN ? { Authorization: `Bearer ${authToken}` } : {}),
        ...headers,
      },
    })

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
    throw new ApiError(getMessage(payload, `Request failed with status ${response.status}`), response.status, payload)
  }

  if (payload && typeof payload === 'object' && 'success' in payload && payload.success === false) {
    throw new ApiError(getMessage(payload, 'Request failed'), response.status, payload)
  }

  return unwrapped as T
}
