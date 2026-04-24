import { User } from '@/lib/types'

export const normalizeRole = (role: string | undefined | null): User['role'] => {
  const normalized = String(role ?? '').toLowerCase().trim()

  if (['owner', 'admin', 'projects_manager', 'project_manager', 'project manager'].includes(normalized)) {
    return 'owner'
  }

  if (['team_lead', 'team lead', 'project_lead', 'project lead', 'lead'].includes(normalized)) {
    return 'admin'
  }

  if (['member', 'team_member', 'team member', 'user'].includes(normalized)) {
    return 'member'
  }

  if (normalized === 'viewer') {
    return 'viewer'
  }

  return 'member'
}

export const getDashboardRoute = (role: User['role']): string => {
  switch (role) {
    case 'owner':
      return '/dashboard/pm'
    case 'admin':
      return '/dashboard/tl'
    default:
      return '/dashboard/member'
  }
}

const restrictedRoutes: Array<{
  prefix: string
  allowedRoles: User['role'][]
}> = [
  { prefix: '/dashboard/pm', allowedRoles: ['owner'] },
  { prefix: '/dashboard/tl', allowedRoles: ['owner', 'admin'] },
  { prefix: '/dashboard/team', allowedRoles: ['owner', 'admin'] },
  { prefix: '/dashboard/projects', allowedRoles: ['owner', 'admin'] },
  { prefix: '/dashboard/tags', allowedRoles: ['owner', 'admin'] },
  { prefix: '/dashboard/clients', allowedRoles: ['owner', 'admin'] },
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
