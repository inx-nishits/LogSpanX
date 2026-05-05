/**
 * Robustly extracts an array from various API response shapes.
 * Handles:
 * - Direct arrays: [item1, item2]
 * - Enveloped with 'items': { items: [...] }
 * - Enveloped with 'entries': { entries: [...] }
 * - Paginated: { data: { items: [...] } }
 * - Results: { results: [...] }
 */
export function extractArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (!payload || typeof payload !== 'object') return []

  const record = payload as Record<string, unknown>

  // Check for common envelope keys
  if (Array.isArray(record.data)) return record.data as T[]
  if (Array.isArray(record.items)) return record.items as T[]
  if (Array.isArray(record.entries)) return record.entries as T[]
  if (Array.isArray(record.results)) return record.results as T[]

  // Check for nested 'data' envelope
  if (record.data && typeof record.data === 'object') {
    const dataRecord = record.data as Record<string, unknown>
    if (Array.isArray(dataRecord.items)) return dataRecord.items as T[]
    if (Array.isArray(dataRecord.entries)) return dataRecord.entries as T[]
    if (Array.isArray(dataRecord.results)) return dataRecord.results as T[]
    if (Array.isArray(dataRecord)) return dataRecord as unknown as T[]
  }

  // Fallback: find any array property
  const anyArray = Object.values(record).find(Array.isArray)
  if (anyArray) return anyArray as T[]

  return []
}
