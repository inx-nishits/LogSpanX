export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: 'project_manager' | 'team_lead' | 'team_member'
  isActive?: boolean
  archived?: boolean
  billableRate?: number
  group?: string
  workspaceId?: string
}

export interface Group {
  id: string
  name: string
  memberIds: string[]
  createdAt: Date
  updatedAt: Date
}


export interface Project {
  id: string
  name: string
  color: string
  clientId?: string
  clientName?: string
  leadId?: string
  leadName?: string
  billable: boolean
  hourlyRate?: number
  members: ProjectMember[]
  archived: boolean
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
  createdAt: Date
  updatedAt: Date
}

export interface TimeEntry {
  id: string
  description: string
  projectId?: string
  projectName?: string
  clientId?: string
  taskId?: string
  tagIds?: string[]
  billable: boolean
  userId: string
  userName?: string
  startTime: Date
  endTime?: Date
  duration?: number
  createdAt: Date
  updatedAt: Date
}


export interface Task {
  id: string
  name: string
  projectId: string
  completed: boolean
  assignees?: { id: string; name: string; email?: string; avatar?: string }[]
}

export interface Tag {
  id: string
  name: string
  archived: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Report {
  id: string
  name: string
  type: 'summary' | 'detailed' | 'weekly'
  filters: ReportFilters
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
