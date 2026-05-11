import { User } from '@/lib/types'

export const normalizeRole = (role: string | undefined | null): User['role'] => {
  const normalized = String(role ?? '').toLowerCase().trim()
  if (normalized === 'owner') return 'owner'
  if (normalized === 'admin') return 'admin'
  if (normalized === 'group_lead') return 'group_lead'
  return 'member'
}

export const getDashboardRoute = (role: User['role']): string => '/dashboard/tracker'

const restrictedRoutes: Array<{ prefix: string; allowedRoles: User['role'][] }> = [
  { prefix: '/dashboard/pm',        allowedRoles: ['owner', 'admin'] },
  { prefix: '/dashboard/tl',        allowedRoles: ['owner', 'admin', 'group_lead'] },
  { prefix: '/dashboard/tags',      allowedRoles: ['owner', 'admin', 'group_lead'] },
  { prefix: '/dashboard/projects/', allowedRoles: ['owner', 'admin', 'group_lead'] },
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
  owner:      'Owner',
  admin:      'Admin',
  group_lead: 'Group Lead',
  member:     'Member',
}

export const roleLabel      = (role: string | undefined | null) => ROLE_LABELS[normalizeRole(role)]
export const isOwner        = (role: User['role']) => role === 'owner'
export const isAdmin        = (role: User['role']) => role === 'admin'
export const isGroupLead    = (role: User['role']) => role === 'group_lead'
export const isPrivileged   = (role: User['role']) => role === 'owner' || role === 'admin'

export const roleBadgeColor = (role: string | undefined | null) => {
  switch (normalizeRole(role)) {
    case 'owner':      return 'bg-[#222] text-white'
    case 'admin':      return 'bg-[#03a9f4] text-white'
    case 'group_lead': return 'bg-[#e3f2fd] text-[#0288d1]'
    default:           return 'bg-[#f5f5f5] text-[#666]'
  }
}

// ─── Users ───────────────────────────────────────────────────────────────────
// owner : full CRUD + archive on ALL users
// admin : full CRUD + archive on group_lead and member only (not owner)

export const canInviteMembers         = (role: User['role']) => role === 'owner' || role === 'admin'
export const canUpdateUserAdminFields = (role: User['role']) => role === 'owner' || role === 'admin'
export const canUpdateUserRole        = (role: User['role']) => role === 'owner' || role === 'admin'
export const canToggleUserActive      = (role: User['role']) => role === 'owner' || role === 'admin'
export const canDeleteUser            = (role: User['role']) => role === 'owner' || role === 'admin'
export const canManageUsers           = (role: User['role']) => role === 'owner' || role === 'admin'
export const canArchiveUser           = (role: User['role']) => role === 'owner' || role === 'admin'

// Admin cannot touch owner accounts
export const canAssignUserRole = (
  actor: User,
  target: Pick<User, 'id' | 'role'>,
  nextRole: User['role'],
) => {
  if (!canUpdateUserRole(actor.role)) return false
  if (actor.id === target.id) return false
  if (actor.role !== 'owner' && target.role === 'owner') return false  // admin cannot edit owner
  if (actor.role !== 'owner' && nextRole === 'owner') return false      // admin cannot assign owner role
  return true
}

export const getAssignableRoles = (actorRole: User['role']): User['role'][] =>
  actorRole === 'owner' ? ['owner', 'admin', 'group_lead', 'member'] :
  actorRole === 'admin' ? ['admin', 'group_lead', 'member'] : []

// ─── Groups ──────────────────────────────────────────────────────────────────
// owner + admin : full CRUD
// group_lead    : read + update members of own group

export const canManageGroups = (role: User['role']) => role === 'owner' || role === 'admin'
export const canDeleteGroup  = (role: User['role']) => role === 'owner' || role === 'admin'
export const canViewGroups   = (role: User['role']) => role === 'owner' || role === 'admin' || role === 'group_lead'

// ─── Projects ────────────────────────────────────────────────────────────────
// owner + admin : full CRUD + archive on ALL projects
// group_lead    : CRUD on assigned projects only

export const canCreateProject        = (role: User['role']) => role === 'owner' || role === 'admin'
export const canManageProjects       = (role: User['role']) => role === 'owner' || role === 'admin' || role === 'group_lead'
export const canManageProjectMembers = (role: User['role']) => role === 'owner' || role === 'admin' || role === 'group_lead'
export const canDeleteProject        = (role: User['role']) => role === 'owner' || role === 'admin'
export const canArchiveProject       = (role: User['role']) => role === 'owner' || role === 'admin'

// ─── Time Entries ─────────────────────────────────────────────────────────────
// owner + admin : view/edit/delete ALL users' time entries
// group_lead    : view/edit time entries of their group members
// member        : own entries only

export const canViewAllTimeEntries   = (role: User['role']) => role === 'owner' || role === 'admin'
export const canViewGroupTimeEntries = (role: User['role']) => role === 'owner' || role === 'admin' || role === 'group_lead'
export const canEditAllTimeEntries   = (role: User['role']) => role === 'owner' || role === 'admin'
export const canDeleteTimeEntry      = (role: User['role']) => role === 'owner' || role === 'admin'
export const canArchiveTimeEntry     = (role: User['role']) => role === 'owner' || role === 'admin'

// ─── Reports ─────────────────────────────────────────────────────────────────
// owner + admin : view/create/export ALL reports
// group_lead    : view reports scoped to their group
// member        : no access

export const canViewReports          = (role: User['role']) => role === 'owner' || role === 'admin' || role === 'group_lead'
export const canViewAllReports       = (role: User['role']) => role === 'owner' || role === 'admin'
export const canCreateReport         = (role: User['role']) => role === 'owner' || role === 'admin'
export const canDeleteReport         = (role: User['role']) => role === 'owner' || role === 'admin'
export const canExportReport         = (role: User['role']) => role === 'owner' || role === 'admin'

// ─── Tasks / Tags / Clients ───────────────────────────────────────────────────
export const canManageTasks   = (role: User['role']) => role === 'owner' || role === 'admin' || role === 'group_lead'
export const canManageTags    = (role: User['role']) => role === 'owner' || role === 'admin' || role === 'group_lead'
export const canManageClients = (role: User['role']) => role === 'owner' || role === 'admin' || role === 'group_lead'

// ─── Aliases (backwards compat) ───────────────────────────────────────────────
export const canChangeUserRole = canUpdateUserRole
