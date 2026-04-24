import { Client, Group, Project, ProjectMember, Tag, Task, TimeEntry, User } from '@/lib/types'

type Nullable<T> = T | null | undefined

export interface ApiUser {
  id: string
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
  id: string
  name: string
  color?: string | null
  clientId?: string | null
  leadId?: string | null
  billable: boolean
  hourlyRate?: number | null
  members?: ProjectMember[]
  archived?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface ApiTask {
  id: string
  name: string
  projectId?: string
  completed: boolean
}

export interface ApiClient {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  address?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface ApiTag {
  id: string
  name: string
  archived?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface ApiTimeEntry {
  id: string
  description: string
  projectId?: string | null
  clientId?: string | null
  taskId?: string | null
  tagIds?: string[]
  billable: boolean
  userId: string
  startTime: string
  endTime?: string | null
  duration?: number | null
  createdAt?: string
  updatedAt?: string
}

function toDate(value: Nullable<string>, fallback = new Date()) {
  return value ? new Date(value) : fallback
}

const normalizeApiRole = (role: string | undefined | null): User['role'] => {
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

export function mapApiUser(user: ApiUser): User {
  return {
    id: user.id,
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
    id: group.id,
    name: group.name,
    memberIds: group.memberIds ?? [],
    createdAt: now,
    updatedAt: now,
  }
}

export function mapApiProject(project: ApiProject): Project {
  return {
    id: project.id,
    name: project.name,
    color: project.color ?? '#03a9f4',
    clientId: project.clientId ?? undefined,
    leadId: project.leadId ?? undefined,
    billable: project.billable,
    hourlyRate: project.hourlyRate ?? undefined,
    members: project.members ?? [],
    archived: project.archived ?? false,
    createdAt: toDate(project.createdAt),
    updatedAt: toDate(project.updatedAt),
  }
}

export function mapApiTask(task: ApiTask, projectId?: string): Task {
  return {
    id: task.id,
    name: task.name,
    projectId: task.projectId ?? projectId ?? '',
    completed: task.completed,
  }
}

export function mapApiClient(client: ApiClient): Client {
  return {
    id: client.id,
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
    id: tag.id,
    name: tag.name,
    archived: tag.archived ?? false,
    createdAt: toDate(tag.createdAt),
    updatedAt: toDate(tag.updatedAt),
  }
}

export function mapApiTimeEntry(entry: ApiTimeEntry): TimeEntry {
  return {
    id: entry.id,
    description: entry.description,
    projectId: entry.projectId ?? undefined,
    clientId: entry.clientId ?? undefined,
    taskId: entry.taskId ?? undefined,
    tagIds: entry.tagIds ?? [],
    billable: entry.billable,
    userId: entry.userId,
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
  return {
    description: entry.description,
    projectId: entry.projectId,
    clientId: entry.clientId,
    taskId: entry.taskId,
    tagIds: entry.tagIds,
    billable: entry.billable,
    userId: entry.userId,
    startTime: entry.startTime?.toISOString(),
    endTime: entry.endTime?.toISOString(),
    duration: entry.duration,
  }
}
