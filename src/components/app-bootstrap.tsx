'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useDataStore } from '@/lib/stores/data-store'

export function AppBootstrap() {
  const { hasHydrated, initialize, isAuthenticated, token } = useAuthStore()
  const { initialize: initializeData, reset: resetData } = useDataStore()

  useEffect(() => {
    if (!hasHydrated) return
    void initialize()
  }, [hasHydrated, initialize])

  useEffect(() => {
    if (!hasHydrated) return

    if (isAuthenticated && token) {
      void initializeData()
      return
    }

    resetData()
  }, [hasHydrated, isAuthenticated, token, initializeData, resetData])

  return null
}
