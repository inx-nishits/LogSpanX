'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/auth-store'

export default function HomePage() {
  const { authStatus, user, hasHydrated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!hasHydrated || authStatus === 'idle' || authStatus === 'initializing') return

    if (authStatus !== 'authenticated' || !user) {
      router.replace('/login')
      return
    }

    const role = user.role
    if (role === 'project_manager') {
      router.replace('/dashboard/pm')
    } else if (role === 'team_lead') {
      router.replace('/dashboard/tl')
    } else {
      router.replace('/dashboard/member')
    }
  }, [hasHydrated, authStatus, user, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  )
}
