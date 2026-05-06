import { User } from '@/lib/types'

export const normalizeRole = (role: string | undefined | null): User['role'] => {
  const normalized = String(role ?? '').toLowerCase().trim()
  if (normalized === 'project_manager') return 'project_manager'
  if (normalized === 'team_lead' || normalized === 'team lead') return 'team_lead'
  return 'team_member'
}

export const getDashboardRoute = (_role: User['role']): string => {
  return '/dashboard/tracker'
}

// PROJECT_MANAGER > TEAM_LEAD > TEAM_MEMBER
const restrictedRoutes: Array<{ prefix: string; allowedRoles: User['role'][] }> = [
  { prefix: '/dashboard/pm',           allowedRoles: ['project_manager'] },
  { prefix: '/dashboard/tl',           allowedRoles: ['project_manager', 'team_lead'] },
  { prefix: '/dashboard/tags',         allowedRoles: ['project_manager', 'team_lead'] },
  { prefix: '/dashboard/project-lead', allowedRoles: ['project_manager', 'team_lead'] },
  { prefix: '/dashboard/projects/',    allowedRoles: ['project_manager'] },
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

// Users — only PROJECT_MANAGER
export const canInviteMembers    = (role: User['role']) => role === 'project_manager'
export const canUpdateUserRole   = (role: User['role']) => role === 'project_manager'
export const canToggleUserActive = (role: User['role']) => role === 'project_manager'
export const canDeleteUser       = (_role: User['role']) => false // backend denies all
export const canManageUsers      = (role: User['role']) => role === 'project_manager'

// Projects — only PROJECT_MANAGER can write
export const canManageProjects   = (role: User['role']) => role === 'project_manager'
export const canDeleteProject    = (role: User['role']) => role === 'project_manager'

// Tasks — PROJECT_MANAGER + TEAM_LEAD
export const canManageTasks      = (role: User['role']) => role === 'project_manager' || role === 'team_lead'

// Tags — PROJECT_MANAGER + TEAM_LEAD
export const canManageTags       = (role: User['role']) => role === 'project_manager' || role === 'team_lead'

// Clients — PROJECT_MANAGER + TEAM_LEAD
export const canManageClients    = (role: User['role']) => role === 'project_manager' || role === 'team_lead'

// Groups — PROJECT_MANAGER + TEAM_LEAD can create/update; only PROJECT_MANAGER can delete
export const canManageGroups     = (role: User['role']) => role === 'project_manager' || role === 'team_lead'
export const canDeleteGroup      = (role: User['role']) => role === 'project_manager'

// Alias kept for any remaining usages
export const canChangeUserRole   = canUpdateUserRole
export const canViewAllTimeEntries = (_role: User['role']) => true
