import { User } from '@/lib/types'

export const normalizeRole = (role: string | undefined | null): User['role'] => {
  const normalized = String(role ?? '').toLowerCase().trim()
  if (normalized === 'admin') return 'owner'
  if (normalized === 'team_lead' || normalized === 'team lead') return 'admin'
  return 'member'
}

export const getDashboardRoute = (role: User['role']): string => {
  switch (role) {
    case 'owner': return '/dashboard/pm'
    case 'admin': return '/dashboard/tl'
    default: return '/dashboard/member'
  }
}

const restrictedRoutes: Array<{ prefix: string; allowedRoles: User['role'][] }> = [
  { prefix: '/dashboard/pm', allowedRoles: ['owner'] },
  { prefix: '/dashboard/tl', allowedRoles: ['owner', 'admin'] },
]

export const isPathAllowedForRole = (path: string, role: User['role']): boolean => {
  const normalizedPath = path.toLowerCase()
  for (const route of restrictedRoutes) {
    if (normalizedPath === route.prefix || normalizedPath.startsWith(`${route.prefix}/`)) {
      return route.allowedRoles.includes(role)
    }
  }
  return true
}

// Convenience helpers matching backend hierarchy: ADMIN(owner) > TEAM_LEAD(admin) > TEAM_MEMBER(member)
export const canManageUsers = (role: User['role']) => role === 'owner' || role === 'admin'
export const canManageProjects = (role: User['role']) => role === 'owner' || role === 'admin'
export const canInviteMembers = (role: User['role']) => role === 'owner' || role === 'admin'
export const canDeleteProject = (role: User['role']) => role === 'owner'
export const canDeleteUser = (role: User['role']) => role === 'owner'
export const canChangeUserRole = (role: User['role']) => role === 'owner'
export const canViewAllTimeEntries = (role: User['role']) => role === 'owner' || role === 'admin'
