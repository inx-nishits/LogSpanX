import { User, Workspace, Project, Client, TimeEntry, Tag, Task, Report, Notification } from '@/lib/types'

export const mockUsers: User[] = [
  { id: 'user_1', email: 'nishit@inheritx.com', name: 'Nishit Sangani', role: 'owner', workspaceId: 'workspace_1' },
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
  { id: 'project_1', name: 'Website Redesign', color: '#3B82F6', clientId: 'client_1', billable: true, members: [], archived: false, workspaceId: 'workspace_1', createdAt: new Date(), updatedAt: new Date() },
  { id: 'project_2', name: 'Mobile App', color: '#10B981', clientId: 'client_1', billable: true, members: [], archived: false, workspaceId: 'workspace_1', createdAt: new Date(), updatedAt: new Date() },
  { id: 'project_3', name: 'SEO Campaign', color: '#F59E0B', clientId: 'client_2', billable: true, members: [], archived: false, workspaceId: 'workspace_1', createdAt: new Date(), updatedAt: new Date() },
  { id: 'project_4', name: 'Internal', color: '#8B5CF6', billable: false, members: [], archived: false, workspaceId: 'workspace_1', createdAt: new Date(), updatedAt: new Date() }
]

export const mockTags: Tag[] = [
  { id: 'tag_1', name: 'Development', color: '#3B82F6', workspaceId: 'workspace_1' },
  { id: 'tag_2', name: 'Meeting', color: '#10B981', workspaceId: 'workspace_1' }
]

export const mockTasks: Task[] = []

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
