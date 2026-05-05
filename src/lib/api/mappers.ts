import { Client, Group, Project, ProjectMember, Tag, Task, TimeEntry, User } from '@/lib/types'

type Nullable<T> = T | null | undefined

export interface ApiUser {
  id?: string
  _id?: string
  email: string
  name: string
  avatar?: string | null
  role: string
  archived?: boolean
  billableRate?: number | null
  group?: string | null
}

export interface ApiGroup {
  id: string
  name: string
  memberIds?: string[]
}

export interface ApiProject {
  id?: string
  _id?: string
  name: string
  color?: string | null
  clientId?: string | null
  clientName?: string | null
  leadId?: string | { _id?: string; id?: string; name?: string; email?: string } | null
  billable: boolean
  hourlyRate?: number | null
  members?: (ProjectMember | string)[]
  archived?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface ApiTask {
  id?: string
  _id?: string
  name: string
  projectId?: string
  completed: boolean
}

export interface ApiClient {
  id?: string
  _id?: string
  name: string
  email?: string | null
  phone?: string | null
  address?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface ApiTag {
  id?: string
  _id?: string
  name: string
  archived?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface ApiTimeEntry {
  id?: string
  _id?: string
  description: string
  // projectId can be a plain string ID or a populated object
  projectId?: string | { id?: string; _id?: string; name?: string; color?: string } | null
  clientId?: string | null
  taskId?: string | null
  // tags can be populated objects or plain string IDs (tagIds)
  tags?: { _id?: string; id?: string; name?: string; color?: string }[]
  tagIds?: string[]
  billable: boolean
  // userId can be a plain string ID or a populated object
  userId: string | { _id?: string; id?: string; name?: string; email?: string }
  startTime: string
  endTime?: string | null
  duration?: number | null
  isRunning?: boolean
  createdAt?: string
  updatedAt?: string
}

function toDate(value: Nullable<string>, fallback = new Date()) {
  return value ? new Date(value) : fallback
}

/** Resolve _id / id from any Mongoose-serialized document */
function resolveId(obj: { id?: string; _id?: string }): string {
  return obj.id ?? obj._id ?? ''
}

function normalizeProjectLead(lead: ApiProject['leadId']) {
  if (!lead) return {}
  if (typeof lead === 'string') return { leadId: lead }

  return {
    leadId: lead._id ?? lead.id,
    leadName: lead.name ?? undefined,
  }
}

const normalizeApiRole = (role: string | undefined | null): User['role'] => {
  const normalized = String(role ?? '').toLowerCase().trim()

  // Backend ADMIN role
  if (['admin'].includes(normalized)) {
    return 'owner'
  }

  // Backend TEAM_LEAD role
  if (['team_lead', 'team lead'].includes(normalized)) {
    return 'admin'
  }

  // Backend TEAM_MEMBER role (and any unknown role defaults to member)
  return 'member'
}

export function mapApiUser(user: ApiUser): User {
  return {
    id: resolveId(user),
    email: user.email,
    name: user.name,
    avatar: user.avatar ?? undefined,
    role: normalizeApiRole(user.role),
    archived: user.archived ?? false,
    billableRate: user.billableRate ?? undefined,
    group: user.group ?? undefined,
  }
}

export function mapApiGroup(group: ApiGroup): Group {
  const now = new Date()
  return {
    id: resolveId(group as { id?: string; _id?: string }),
    name: group.name,
    memberIds: group.memberIds ?? [],
    createdAt: now,
    updatedAt: now,
  }
}

export function mapApiProject(project: ApiProject): Project {
  const lead = normalizeProjectLead(project.leadId)

  // Normalize members: API may return string[] or ProjectMember[]
  const members = (project.members ?? []).map((m) => {
    if (typeof m === 'string') return { userId: m, role: 'member' as const }
    return m
  })

  return {
    id: resolveId(project),
    name: project.name,
    color: project.color ?? '#03a9f4',
    clientId: project.clientId ?? undefined,
    clientName: project.clientName ?? undefined,
    leadId: lead.leadId,
    leadName: lead.leadName,
    billable: project.billable,
    hourlyRate: project.hourlyRate ?? undefined,
    members,
    archived: project.archived ?? false,
    createdAt: toDate(project.createdAt),
    updatedAt: toDate(project.updatedAt),
  }
}

export function mapApiTask(task: ApiTask, projectId?: string): Task {
  return {
    id: resolveId(task),
    name: task.name,
    projectId: task.projectId ?? projectId ?? '',
    completed: task.completed,
  }
}

export function mapApiClient(client: ApiClient): Client {
  return {
    id: resolveId(client),
    name: client.name,
    email: client.email ?? undefined,
    phone: client.phone ?? undefined,
    address: client.address ?? undefined,
    createdAt: toDate(client.createdAt),
    updatedAt: toDate(client.updatedAt),
  }
}

export function mapApiTag(tag: ApiTag): Tag {
  return {
    id: resolveId(tag),
    name: tag.name,
    archived: tag.archived ?? false,
    createdAt: toDate(tag.createdAt),
    updatedAt: toDate(tag.updatedAt),
  }
}

export function mapApiTimeEntry(entry: ApiTimeEntry): TimeEntry {
  // userId may be a populated object
  const isUserObj = typeof entry.userId === 'object' && entry.userId !== null
  const userIdObj = isUserObj ? (entry.userId as { id?: string; _id?: string; name?: string }) : null
  const userId = isUserObj
    ? (userIdObj._id ?? userIdObj.id ?? '')
    : entry.userId as string
  const userName = isUserObj ? userIdObj.name : undefined

  // projectId may be a populated object
  const isProjObj = typeof entry.projectId === 'object' && entry.projectId !== null
  const projObj = isProjObj ? (entry.projectId as { id?: string; _id?: string; name?: string }) : null
  const projectId = isProjObj
    ? (projObj.id ?? projObj._id ?? undefined)
    : (entry.projectId as string ?? undefined)
  const projectName = isProjObj ? projObj.name : undefined

  // tags may be populated objects; fall back to tagIds string array
  const tagIds = entry.tags?.length
    ? entry.tags.map(t => (t._id || t.id || '')).filter((id): id is string => id !== '')
    : (entry.tagIds ?? []).filter((id): id is string => typeof id === 'string' && id !== '')

  return {
    id: resolveId(entry),
    description: entry.description,
    projectId,
    projectName,
    clientId: entry.clientId ?? undefined,
    taskId: entry.taskId ?? undefined,
    tagIds,
    billable: entry.billable,
    userId,
    userName,
    startTime: new Date(entry.startTime),
    endTime: entry.endTime ? new Date(entry.endTime) : undefined,
    duration: entry.duration ?? undefined,
    createdAt: toDate(entry.createdAt),
    updatedAt: toDate(entry.updatedAt),
  }
}

export function serializeProjectMember(member: ProjectMember) {
  return {
    userId: member.userId,
    role: member.role,
    hourlyRate: member.hourlyRate,
  }
}

export function serializeTimeEntryPatch(entry: Partial<TimeEntry>) {
  const patch: Record<string, unknown> = {}

  if ('description' in entry) patch.description = entry.description
  if ('projectId' in entry) patch.projectId = entry.projectId || undefined
  if ('taskId' in entry) patch.taskId = entry.taskId || null
  if ('tagIds' in entry) patch.tagIds = (entry.tagIds ?? []).filter(id => id !== '')
  if ('billable' in entry) patch.billable = entry.billable
  if ('startTime' in entry && entry.startTime) patch.startTime = entry.startTime instanceof Date ? entry.startTime.toISOString() : entry.startTime
  if ('endTime' in entry && entry.endTime) patch.endTime = entry.endTime instanceof Date ? entry.endTime.toISOString() : entry.endTime
  if ('userId' in entry) patch.userId = entry.userId

  return patch
}

// Used only for POST /time-entries
export function serializeTimeEntryCreate(entry: Partial<TimeEntry>) {
  return serializeTimeEntryPatch(entry)
}
