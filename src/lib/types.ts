export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: 'owner' | 'admin' | 'member' | 'viewer'
  workspaceId: string
}

export interface Workspace {
  id: string
  name: string
  settings: WorkspaceSettings
}

export interface WorkspaceSettings {
  dateFormat: string
  timeFormat: '12h' | '24h'
  weekStart: 'monday' | 'sunday'
  currency: string
  timezone: string
}

export interface Project {
  id: string
  name: string
  color: string
  clientId?: string
  leadId?: string
  billable: boolean
  hourlyRate?: number
  members: ProjectMember[]
  archived: boolean
  workspaceId: string
  createdAt: Date
  updatedAt: Date
}

export interface ProjectMember {
  userId: string
  role: 'member' | 'manager'
  hourlyRate?: number
}

export interface Client {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  workspaceId: string
  createdAt: Date
  updatedAt: Date
}

export interface TimeEntry {
  id: string
  description: string
  projectId?: string
  clientId?: string
  taskId?: string
  tagIds: string[]
  billable: boolean
  userId: string
  workspaceId: string
  startTime: Date
  endTime?: Date
  duration?: number
  createdAt: Date
  updatedAt: Date
}

export interface Tag {
  id: string
  name: string
  color: string
  workspaceId: string
}

export interface Task {
  id: string
  name: string
  projectId: string
  workspaceId: string
  completed: boolean
}

export interface Report {
  id: string
  name: string
  type: 'summary' | 'detailed' | 'weekly'
  filters: ReportFilters
  workspaceId: string
  createdAt: Date
  updatedAt: Date
}

export interface ReportFilters {
  dateRange: {
    start: Date
    end: Date
  }
  projectIds?: string[]
  clientIds?: string[]
  userIds?: string[]
  tagIds?: string[]
  billable?: boolean
  archived?: boolean
}

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  userId: string
  createdAt: Date
}

export interface TimerState {
  isRunning: boolean
  currentEntry?: TimeEntry
  startTime?: Date
}
