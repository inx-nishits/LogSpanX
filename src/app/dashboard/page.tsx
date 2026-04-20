'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/auth-store'

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated && user) {
      const role = user.role
      if (role === 'owner') {
        router.push('/dashboard/pm')
      } else if (role === 'admin') {
        router.push('/dashboard/tl')
      } else {
        router.push('/dashboard/member')
      }
    }
  }, [isAuthenticated, user, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f2f6f8]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#03a9f4] mx-auto mb-4"></div>
        <p className="text-gray-500 font-medium tracking-tight">Redirecting to your dashboard...</p>
      </div>
    </div>
  )
}
