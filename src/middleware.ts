import { NextRequest, NextResponse } from 'next/server'
import { ACCESS_COOKIE, REFRESH_COOKIE, ROLE_COOKIE } from '@/lib/auth-constants'
import type { User } from '@/lib/types'

const authRoutes = ['/login', '/signup', '/forgot-password', '/reset-password', '/check-email', '/verify-email']

const restrictedRoutes: Array<{ prefix: string; allowedRoles: User['role'][] }> = [
  { prefix: '/dashboard/pm',           allowedRoles: ['project_manager'] },
  { prefix: '/dashboard/tl',           allowedRoles: ['project_manager', 'team_lead'] },
  { prefix: '/dashboard/tags',         allowedRoles: ['project_manager', 'team_lead'] },
  { prefix: '/dashboard/project-lead', allowedRoles: ['project_manager', 'team_lead'] },
  { prefix: '/dashboard/projects/',    allowedRoles: ['project_manager'] },
]

function getSafeRole(role: string | undefined): User['role'] {
  if (role === 'project_manager') return 'project_manager'
  if (role === 'team_lead') return 'team_lead'
  return 'team_member'
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

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasAccessToken = Boolean(request.cookies.get(ACCESS_COOKIE)?.value)
  const hasRefreshToken = Boolean(request.cookies.get(REFRESH_COOKIE)?.value)
  const hasSession = hasAccessToken || hasRefreshToken

  if (pathname.startsWith('/dashboard') && !hasSession) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (pathname.startsWith('/dashboard') && hasSession) {
    const role = getSafeRole(request.cookies.get(ROLE_COOKIE)?.value)
    // If we have an access token, we can enforce RBAC. 
    // If we only have a refresh token, we allow the request to pass so the client can refresh.
    if (hasAccessToken && !isPathAllowedForRole(pathname, role)) {
      return NextResponse.redirect(new URL('/dashboard/tracker', request.url))
    }
  }

  if (authRoutes.includes(pathname) && hasAccessToken) {
    return NextResponse.redirect(new URL('/dashboard/tracker', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup', '/forgot-password', '/reset-password'],
}
