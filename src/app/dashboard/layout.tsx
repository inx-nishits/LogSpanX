'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useDataStore } from '@/lib/stores/data-store'
import { getDashboardRoute, isPathAllowedForRole } from '@/lib/rbac'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { authStatus, hasHydrated, user } = useAuthStore()
  const { isInitialized } = useDataStore()
  const pathname = usePathname()
  const router = useRouter()

  const isAuthenticated = authStatus === 'authenticated'
  const isAuthPending = authStatus === 'initializing' || authStatus === 'idle'
  const isLoading = isAuthPending || (isAuthenticated && !isInitialized)

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (hasHydrated && authStatus === 'unauthenticated') {
      router.replace('/login')
    }
  }, [hasHydrated, authStatus, router])

  // RBAC route guard — only runs when auth + data are both ready
  useEffect(() => {
    if (!hasHydrated || isAuthPending || !isAuthenticated || !user || !pathname) return
    if (!isPathAllowedForRole(pathname, user.role)) {
      router.replace(getDashboardRoute(user.role))
    }
  }, [hasHydrated, isAuthPending, isAuthenticated, user, pathname, router])

  if (!hasHydrated || isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f2f6f8]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#03a9f4] mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium tracking-tight">Loading Trackify...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-[#f2f6f8] overflow-hidden relative">
      <div className="z-50 h-full relative">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden h-full">
        <Topbar />
        <main className="flex-1 overflow-y-auto scrollbar-hide relative h-full">
          {children}
        </main>
      </div>
    </div>
  )
}
