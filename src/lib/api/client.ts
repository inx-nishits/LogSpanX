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

function unwrapApiPayload(payload: unknown): unknown {
  if (!payload || typeof payload !== 'object') return payload

  const obj = payload as Record<string, unknown>

  if (obj.success === true && obj.data && typeof obj.data === 'object') {
    return unwrapApiPayload(obj.data)
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

export async function apiRequest<T>(
  path: string,
  options: Omit<RequestInit, 'headers'> & {
    headers?: HeadersInit
    query?: Record<string, string | number | boolean | null | undefined>
    token?: string | null
  } = {}
): Promise<T> {
  const { query, token, headers, ...requestInit } = options

  const response = await fetch(buildUrl(path, query), {
    ...requestInit,
    headers: {
      Accept: 'application/json',
      ...(requestInit.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  })

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
