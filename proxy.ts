import { NextRequest, NextResponse } from 'next/server'
import { ACCESS_COOKIE, ROLE_COOKIE } from '@/lib/auth-constants'
import type { User } from '@/lib/types'

const authRoutes = ['/login', '/signup', '/forgot-password', '/reset-password']

const restrictedRoutes: Array<{ prefix: string; allowedRoles: User['role'][] }> = [
  { prefix: '/dashboard/pm', allowedRoles: ['owner'] },
  { prefix: '/dashboard/tl', allowedRoles: ['owner', 'admin'] },
  { prefix: '/dashboard/projects', allowedRoles: ['owner'] },
  { prefix: '/dashboard/tags', allowedRoles: ['owner'] },
  { prefix: '/dashboard/project-lead', allowedRoles: ['owner'] },
]

function getSafeRole(role: string | undefined): User['role'] {
  if (role === 'owner' || role === 'admin' || role === 'member') return role
  return 'member'
}

function isPathAllowedForRole(path: string, role: User['role']) {
  const normalizedPath = path.toLowerCase()
  for (const route of restrictedRoutes) {
    if (normalizedPath === route.prefix || normalizedPath.startsWith(`${route.prefix}/`)) {
      return route.allowedRoles.includes(role)
    }
  }
  return true
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasSession = Boolean(request.cookies.get(ACCESS_COOKIE)?.value)

  if (pathname.startsWith('/dashboard') && !hasSession) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (pathname.startsWith('/dashboard') && hasSession) {
    const role = getSafeRole(request.cookies.get(ROLE_COOKIE)?.value)
    if (!isPathAllowedForRole(pathname, role)) {
      return NextResponse.redirect(new URL('/dashboard/tracker', request.url))
    }
  }

  if (authRoutes.includes(pathname) && hasSession) {
    return NextResponse.redirect(new URL('/dashboard/tracker', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup', '/forgot-password', '/reset-password'],
}
