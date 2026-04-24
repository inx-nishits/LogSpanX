'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/auth-store'

export default function HomePage() {
  const { isAuthenticated, user, hasHydrated, isInitializing } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!hasHydrated || isInitializing) return

    if (!isAuthenticated || !user) {
      router.replace('/login')
      return
    }

    const role = user.role
    if (role === 'owner') {
      router.replace('/dashboard/pm')
    } else if (role === 'admin') {
      router.replace('/dashboard/tl')
    } else {
      router.replace('/dashboard/member')
    }
  }, [hasHydrated, isInitializing, isAuthenticated, user, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  )
}
