import { User, Workspace, Project, Client, TimeEntry, Tag, Task, Report, Notification } from '@/lib/types'

export const mockUsers: User[] = [
  { id: 'user_1', email: 'nishit@inheritx.com', name: 'Nishit Sangani', role: 'owner', workspaceId: 'workspace_1' },
  { id: 'user_2', email: 'aiyub@inheritx.com', name: 'Aiyub Munshi', role: 'admin', workspaceId: 'workspace_1' },
]

export const mockWorkspace: Workspace = {
  id: 'workspace_1',
  name: 'InheritX Solutions',
  settings: { dateFormat: 'MM/DD/YYYY', timeFormat: '12h', weekStart: 'monday', currency: 'USD', timezone: 'America/New_York' }
}

export const mockClients: Client[] = [
  { id: 'client_1', name: 'Tech Solutions Inc', workspaceId: 'workspace_1', createdAt: new Date(), updatedAt: new Date() },
  { id: 'client_2', name: 'Digital Agency', workspaceId: 'workspace_1', createdAt: new Date(), updatedAt: new Date() }
]

export const mockProjects: Project[] = [
  { id: 'project_1', name: '_INX-Company website revamp', color: '#c29d0b', leadId: 'user_2', billable: true, members: [], archived: false, workspaceId: 'workspace_1', createdAt: new Date(), updatedAt: new Date() },
  { id: 'project_2', name: 'Ceremonia : Fixed Cost : Billable', color: '#3B82F6', leadId: 'user_2', billable: true, members: [], archived: false, workspaceId: 'workspace_1', createdAt: new Date(), updatedAt: new Date() },
  { id: 'project_3', name: 'Culturify : Fixed cost : Billable', color: '#10B981', leadId: 'user_2', billable: true, members: [], archived: false, workspaceId: 'workspace_1', createdAt: new Date(), updatedAt: new Date() },
  { id: 'project_4', name: 'DycoVue: Dedicated: Billable', color: '#8B5CF6', billable: true, members: [], archived: false, workspaceId: 'workspace_1', createdAt: new Date(), updatedAt: new Date() },
  { id: 'project_5', name: 'Pocket Sergeant : Frontend Development', color: '#4d7c0f', billable: true, members: [], archived: false, workspaceId: 'workspace_1', createdAt: new Date(), updatedAt: new Date() },
  { id: 'project_6', name: 'Pocket Sergeant : Backend Development', color: '#1d4ed8', billable: true, members: [], archived: false, workspaceId: 'workspace_1', createdAt: new Date(), updatedAt: new Date() },
  { id: 'project_7', name: 'Internal Project', color: '#94a3b8', billable: false, members: [], archived: false, workspaceId: 'workspace_1', createdAt: new Date(), updatedAt: new Date() }
]

export const mockTags: Tag[] = [
  { id: 'tag_1', name: 'Development', color: '#3B82F6', workspaceId: 'workspace_1' },
  { id: 'tag_2', name: 'Meeting', color: '#10B981', workspaceId: 'workspace_1' }
]

export const mockTasks: Task[] = [
  // _INX-Company website revamp: 1 Task
  { id: 'task_inx_1', name: 'Frontend Refactor', projectId: 'project_1', workspaceId: 'workspace_1', completed: false },
  
  // Ceremonia: 2 Tasks
  { id: 'task_cer_1', name: 'Project Management', projectId: 'project_2', workspaceId: 'workspace_1', completed: false },
  { id: 'task_cer_2', name: 'UI / UX Design Task', projectId: 'project_2', workspaceId: 'workspace_1', completed: false },

  // Culturify: 19 Tasks (Generating some)
  ...Array.from({ length: 19 }).map((_, i) => ({
    id: `task_cul_${i}`,
    name: `Culturify Task ${i + 1}`,
    projectId: 'project_3',
    workspaceId: 'workspace_1',
    completed: false
  })),

  // DycoVue: 1 Task
  { id: 'task_dyc_1', name: 'Backend Sync', projectId: 'project_4', workspaceId: 'workspace_1', completed: false },

  // Pocket Sergeant Frontend: 4 Tasks
  ...Array.from({ length: 4 }).map((_, i) => ({
    id: `task_psf_${i}`,
    name: `Frontend Task ${i + 1}`,
    projectId: 'project_5',
    workspaceId: 'workspace_1',
    completed: false
  })),

  // Pocket Sergeant Backend: 3 Tasks
  ...Array.from({ length: 3 }).map((_, i) => ({
    id: `task_psb_${i}`,
    name: `API Task ${i + 1}`,
    projectId: 'project_6',
    workspaceId: 'workspace_1',
    completed: false
  })),
]

const generate8HourDay = (dateStr: string, userId: string): TimeEntry[] => {
  const baseDate = new Date(dateStr)
  return [
    {
      id: `entry_${dateStr}_1`,
      description: 'Morning Development Session',
      projectId: 'project_1',
      tagIds: ['tag_1'],
      billable: true,
      userId,
      workspaceId: 'workspace_1',
      startTime: new Date(`${dateStr}T09:00:00`),
      endTime: new Date(`${dateStr}T13:00:00`),
      duration: 14400, // 4 hours
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: `entry_${dateStr}_2`,
      description: 'Afternoon Feature Implementation',
      projectId: 'project_2',
      tagIds: ['tag_1'],
      billable: true,
      userId,
      workspaceId: 'workspace_1',
      startTime: new Date(`${dateStr}T14:00:00`),
      endTime: new Date(`${dateStr}T18:00:00`),
      duration: 14400, // 4 hours
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]
}

export const mockTimeEntries: TimeEntry[] = [
  ...generate8HourDay('2024-04-15', 'user_1'), // Today
  ...generate8HourDay('2024-04-14', 'user_1'), // Yesterday
  ...generate8HourDay('2024-04-13', 'user_1'),
  ...generate8HourDay('2024-04-12', 'user_1'),
  ...generate8HourDay('2024-04-11', 'user_1'),
  ...generate8HourDay('2024-04-10', 'user_1'),
  ...generate8HourDay('2024-04-09', 'user_1')
]

export const mockReports: Report[] = []
export const mockNotifications: Notification[] = []
