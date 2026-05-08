import { User } from '@/lib/types'

export const normalizeRole = (role: string | undefined | null): User['role'] => {
  const normalized = String(role ?? '').toLowerCase().trim()
  if (normalized === 'owner') return 'owner'
  if (normalized === 'admin') return 'admin'
  if (normalized === 'group_lead') return 'group_lead'
  return 'member'
}

export const getDashboardRoute = (role: User['role']): string => {
  if (role === 'owner' || role === 'admin' || role === 'group_lead' || role === 'member') {
    return '/dashboard/tracker'
  }
  return '/dashboard/tracker'
}

const restrictedRoutes: Array<{ prefix: string; allowedRoles: User['role'][] }> = [
  { prefix: '/dashboard/pm',           allowedRoles: ['owner', 'admin'] },
  { prefix: '/dashboard/tl',           allowedRoles: ['owner', 'admin', 'group_lead'] },
  { prefix: '/dashboard/tags',         allowedRoles: ['owner', 'admin', 'group_lead'] },
  { prefix: '/dashboard/projects/',    allowedRoles: ['owner', 'admin', 'group_lead'] },
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

export const ROLE_LABELS: Record<User['role'], string> = {
  owner: 'Owner',
  admin: 'Admin',
  group_lead: 'Group Lead',
  member: 'Member',
}

export const roleLabel = (role: string | undefined | null) => ROLE_LABELS[normalizeRole(role)]

export const roleBadgeColor = (role: string | undefined | null) => {
  switch (normalizeRole(role)) {
    case 'owner': return 'bg-[#222] text-white'
    case 'admin': return 'bg-[#03a9f4] text-white'
    case 'group_lead': return 'bg-[#e3f2fd] text-[#0288d1]'
    default: return 'bg-[#f5f5f5] text-[#666]'
  }
}

export const isOwner = (role: User['role']) => role === 'owner'
export const isAdmin = (role: User['role']) => role === 'admin'
export const isGroupLead = (role: User['role']) => role === 'group_lead'
export const isPrivileged = (role: User['role']) => role === 'owner' || role === 'admin'

export const canInviteMembers    = (role: User['role']) => role === 'owner'
export const canUpdateUserAdminFields = (role: User['role']) => role === 'owner'
export const canUpdateUserRole   = (role: User['role']) => role === 'owner' || role === 'admin'
export const canToggleUserActive = (role: User['role']) => role === 'owner'
export const canDeleteUser       = (role: User['role']) => role === 'owner'
export const canManageUsers      = (role: User['role']) => role === 'owner'

export const canAssignUserRole = (
  actor: User,
  target: Pick<User, 'id' | 'role'>,
  nextRole: User['role'],
) => {
  if (!canUpdateUserRole(actor.role)) return false
  if (actor.id === target.id) return false
  if (nextRole === 'owner' && actor.role !== 'owner') return false
  if (target.role === 'owner' && actor.role !== 'owner') return false
  return true
}

export const getAssignableRoles = (actorRole: User['role']): User['role'][] =>
  actorRole === 'owner' ? ['owner', 'admin', 'group_lead', 'member'] :
    actorRole === 'admin' ? ['admin', 'group_lead', 'member'] : []

export const canCreateProject = (role: User['role']) => role === 'owner' || role === 'admin'
export const canManageProjects   = (role: User['role']) => role === 'owner' || role === 'admin' || role === 'group_lead'
export const canManageProjectMembers = canManageProjects
export const canDeleteProject    = (role: User['role']) => role === 'owner' || role === 'admin'

export const canManageTasks      = (role: User['role']) => role === 'owner' || role === 'admin' || role === 'group_lead'
export const canManageTags       = (role: User['role']) => role === 'owner' || role === 'admin' || role === 'group_lead'
export const canManageClients    = (role: User['role']) => role === 'owner' || role === 'admin' || role === 'group_lead'
export const canManageGroups     = (role: User['role']) => role === 'owner' || role === 'admin' || role === 'group_lead'
export const canDeleteGroup      = (role: User['role']) => role === 'owner' || role === 'admin'

export const canChangeUserRole   = canUpdateUserRole
export const canViewAllTimeEntries = (role: User['role']) => role === 'owner' || role === 'admin' || role === 'group_lead'
