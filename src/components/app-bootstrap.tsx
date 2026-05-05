'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useDataStore } from '@/lib/stores/data-store'

export function AppBootstrap() {
  const { hasHydrated, initialize, authStatus, token } = useAuthStore()
  const { initialize: initializeData, reset: resetData } = useDataStore()
  const router = useRouter()
  const pathname = usePathname()

  // Always re-validate session on mount — never trust persisted authStatus alone
  useEffect(() => {
    if (!hasHydrated) return
    void initialize()
  }, [hasHydrated]) // eslint-disable-line react-hooks/exhaustive-deps

  // React to auth state changes
  useEffect(() => {
    if (!hasHydrated) return
    if (authStatus === 'idle' || authStatus === 'initializing') return

    if (authStatus === 'authenticated' && token) {
      void initializeData()
      return
    }

    if (authStatus === 'unauthenticated') {
      resetData()
      if (pathname.startsWith('/dashboard')) {
        // Clear httpOnly cookies server-side then redirect
        fetch('/api/auth/clear', { method: 'POST' }).finally(() => {
          router.replace(`/login?next=${encodeURIComponent(pathname)}`)
        })
      }
    }
  }, [hasHydrated, authStatus, token, initializeData, resetData, router, pathname])

  return null
}
