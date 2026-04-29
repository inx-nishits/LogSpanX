'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useDataStore } from '@/lib/stores/data-store'

export function AppBootstrap() {
  const { hasHydrated, initialize, authStatus, token } = useAuthStore()
  const { initialize: initializeData, reset: resetData } = useDataStore()

  // Run auth initialization once — only when hydrated and not already authenticated
  useEffect(() => {
    if (!hasHydrated) return
    if (authStatus === 'authenticated') return
    void initialize()
  }, [hasHydrated]) // eslint-disable-line react-hooks/exhaustive-deps

  // Initialize data store after auth is confirmed, reset on logout
  useEffect(() => {
    if (!hasHydrated) return

    if (authStatus === 'authenticated' && token) {
      void initializeData()
      return
    }

    if (authStatus === 'unauthenticated') {
      resetData()
    }
  }, [hasHydrated, authStatus, token, initializeData, resetData])

  return null
}
