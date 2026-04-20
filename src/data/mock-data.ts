import { User, Workspace, Project, Client, TimeEntry, Task, Report, Notification } from '@/lib/types'

export const mockUsers: User[] = [
  { id: 'user_1', email: 'nishit@inheritx.com', name: 'Nishit Sangani', role: 'owner', workspaceId: 'workspace_1' },
  { id: 'user_2', email: 'aiyub@inheritx.com', name: 'Aiyub Munshi', role: 'admin', workspaceId: 'workspace_1' },
  { id: 'user_3', email: 'jaydeep@inheritx.com', name: 'Jaydeep Vegad', role: 'member', workspaceId: 'workspace_1' },
  { id: 'user_4', email: 'sonu@inheritx.com', name: 'Sonu Gupta', role: 'member', workspaceId: 'workspace_1' },
  { id: 'user_5', email: 'vrutik@inheritx.com', name: 'Vrutik Patel', role: 'member', workspaceId: 'workspace_1' },
  { id: 'user_6', email: 'ram@inheritx.com', name: 'Ram Jangid', role: 'member', workspaceId: 'workspace_1' },
]

export const mockWorkspace: Workspace = {
  id: 'workspace_1',
  name: 'InheritX Solutions',
  settings: { dateFormat: 'MM/DD/YYYY', timeFormat: '12h', weekStart: 'monday', currency: 'USD', timezone: 'America/New_York' }
}

export const mockClients: Client[] = [
  { id: 'client_1', name: 'Tech Solutions Inc', workspaceId: 'workspace_1', createdAt: new Date(), updatedAt: new Date() },
  { id: 'client_2', name: 'Digital Agency', workspaceId: 'workspace_1', createdAt: new Date(), updatedAt: new Date() },
  { id: 'client_3', name: 'Ecosmob Technologies', workspaceId: 'workspace_1', createdAt: new Date(), updatedAt: new Date() },
  { id: 'client_4', name: 'Kavia AI Labs', workspaceId: 'workspace_1', createdAt: new Date(), updatedAt: new Date() },
]

export const mockProjects: Project[] = [
  { id: 'project_1', name: 'StaffBot Dedicated : Billable', color: '#03a9f4', leadId: 'user_3', billable: true, members: [], archived: false, workspaceId: 'workspace_1', createdAt: new Date(), updatedAt: new Date() },
  { id: 'project_2', name: 'Nexaan(Jiteshbhai) : T & M : Billable', color: '#e91e63', leadId: 'user_4', billable: true, members: [], archived: false, workspaceId: 'workspace_1', createdAt: new Date(), updatedAt: new Date() },
  { id: 'project_3', name: 'Kavia AI : Dedicated : Billable', color: '#1565c0', leadId: 'user_2', billable: true, members: [], archived: false, workspaceId: 'workspace_1', createdAt: new Date(), updatedAt: new Date() },
  { id: 'project_4', name: '_INX-Learning : Non-Billable', color: '#d32f2f', leadId: 'user_2', billable: false, members: [], archived: false, workspaceId: 'workspace_1', createdAt: new Date(), updatedAt: new Date() },
  { id: 'project_5', name: 'Ecosmob : Dedicated : Billable', color: '#f9a825', leadId: 'user_6', billable: true, members: [], archived: false, workspaceId: 'workspace_1', createdAt: new Date(), updatedAt: new Date() },
  { id: 'project_6', name: 'Nurvia : Fixed-cost : Billable', color: '#7cb342', leadId: 'user_2', billable: true, members: [], archived: false, workspaceId: 'workspace_1', createdAt: new Date(), updatedAt: new Date() },
  { id: 'project_7', name: 'Lifeguru : Fixed-cost : Billable', color: '#6a1b9a', leadId: 'user_2', billable: true, members: [], archived: false, workspaceId: 'workspace_1', createdAt: new Date(), updatedAt: new Date() },
  { id: 'project_8', name: 'Pocket Sergeant : Maintenance : Billable', color: '#e65100', leadId: 'user_5', billable: true, members: [], archived: false, workspaceId: 'workspace_1', createdAt: new Date(), updatedAt: new Date() },
  { id: 'project_9', name: 'Inhouse Clokify Revamp :: Next - Node', color: '#0d47a1', leadId: 'user_1', billable: true, members: [], archived: false, workspaceId: 'workspace_1', createdAt: new Date(), updatedAt: new Date() },
  { id: 'project_10', name: 'Culturify : Fixed cost : Billable', color: '#00897b', leadId: 'user_2', billable: true, members: [], archived: false, workspaceId: 'workspace_1', createdAt: new Date(), updatedAt: new Date() },
  { id: 'project_11', name: 'DycoVue : Dedicated : Billable', color: '#8e24aa', leadId: 'user_2', billable: true, members: [], archived: false, workspaceId: 'workspace_1', createdAt: new Date(), updatedAt: new Date() },
  { id: 'project_12', name: 'Ceremonia : Fixed Cost : Billable', color: '#c0ca33', leadId: 'user_2', billable: true, members: [], archived: false, workspaceId: 'workspace_1', createdAt: new Date(), updatedAt: new Date() },
  { id: 'project_13', name: '_INX-Company Website Revamp', color: '#546e7a', leadId: 'user_2', billable: false, members: [], archived: false, workspaceId: 'workspace_1', createdAt: new Date(), updatedAt: new Date() },
  { id: 'project_14', name: 'HealthSync : T & M : Billable', color: '#26a69a', leadId: 'user_4', billable: true, members: [], archived: false, workspaceId: 'workspace_1', createdAt: new Date(), updatedAt: new Date() },
]

export const mockTasks: Task[] = [
  { id: 'task_1', name: 'Frontend Refactor', projectId: 'project_1', workspaceId: 'workspace_1', completed: false },
  { id: 'task_2', name: 'API Integration', projectId: 'project_2', workspaceId: 'workspace_1', completed: false },
  { id: 'task_3', name: 'ML Pipeline Setup', projectId: 'project_3', workspaceId: 'workspace_1', completed: false },
  { id: 'task_4', name: 'React Training Module', projectId: 'project_4', workspaceId: 'workspace_1', completed: false },
  { id: 'task_5', name: 'VoIP Gateway Config', projectId: 'project_5', workspaceId: 'workspace_1', completed: false },
  { id: 'task_6', name: 'Dashboard UI', projectId: 'project_6', workspaceId: 'workspace_1', completed: false },
  { id: 'task_7', name: 'Backend Optimization', projectId: 'project_7', workspaceId: 'workspace_1', completed: false },
  { id: 'task_8', name: 'Bug Fixes Sprint 4', projectId: 'project_8', workspaceId: 'workspace_1', completed: false },
  { id: 'task_9', name: 'Next.js Migration', projectId: 'project_9', workspaceId: 'workspace_1', completed: false },
  { id: 'task_10', name: 'Payment Integration', projectId: 'project_10', workspaceId: 'workspace_1', completed: false },
  { id: 'task_11', name: 'Real-time Sync', projectId: 'project_11', workspaceId: 'workspace_1', completed: false },
  { id: 'task_12', name: 'Landing Page Design', projectId: 'project_12', workspaceId: 'workspace_1', completed: false },
  { id: 'task_13', name: 'SEO Audit', projectId: 'project_13', workspaceId: 'workspace_1', completed: false },
  { id: 'task_14', name: 'FHIR API Integration', projectId: 'project_14', workspaceId: 'workspace_1', completed: false },
]

// ─── Realistic Time Entry Generator ─────────────────────────────────────────
// Each day distributes ~8h across multiple projects for variety

interface DaySchedule {
  projectId: string
  duration: number   // seconds
  description: string
  billable: boolean
}

// Generate realistic data for the past 4 weeks from today
function generateWeekSchedules(): Record<string, DaySchedule[]> {
  const schedules: Record<string, DaySchedule[]> = {}
  const today = new Date()
  
  // Generate data for past 30 days
  for (let daysAgo = 0; daysAgo < 30; daysAgo++) {
    const date = new Date(today)
    date.setDate(date.getDate() - daysAgo)
    const dateStr = date.toISOString().split('T')[0]
    const dayOfWeek = date.getDay()
    
    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      schedules[dateStr] = []
      continue
    }
    
    // Vary the schedule based on day of week
    const daySchedules: DaySchedule[] = []
    
    // Always include some core projects
    daySchedules.push(
      { projectId: 'project_1', duration: 7200, description: 'StaffBot sprint planning & feature development', billable: true },
      { projectId: 'project_2', duration: 5400, description: 'Nexaan API endpoint development', billable: true }
    )
    
    // Add varied projects based on day
    if (dayOfWeek === 1) { // Monday
      daySchedules.push(
        { projectId: 'project_3', duration: 3600, description: 'Kavia AI model training scripts', billable: true },
        { projectId: 'project_5', duration: 3600, description: 'Ecosmob VoIP configuration', billable: true },
        { projectId: 'project_6', duration: 2700, description: 'Nurvia dashboard wireframes', billable: true },
        { projectId: 'project_9', duration: 3600, description: 'Inhouse Clokify - Complete remaining APIs', billable: true },
        { projectId: 'project_4', duration: 2700, description: 'Internal learning - React 19 workshop', billable: false }
      )
    } else if (dayOfWeek === 2) { // Tuesday
      daySchedules.push(
        { projectId: 'project_7', duration: 3600, description: 'Lifeguru backend performance optimization', billable: true },
        { projectId: 'project_8', duration: 2700, description: 'Pocket Sergeant maintenance patch', billable: true },
        { projectId: 'project_10', duration: 3600, description: 'Culturify payment gateway integration', billable: true },
        { projectId: 'project_14', duration: 2700, description: 'HealthSync FHIR endpoint mapping', billable: true },
        { projectId: 'project_9', duration: 3600, description: 'Inhouse Clokify - Went through frontend frameworks', billable: true }
      )
    } else if (dayOfWeek === 3) { // Wednesday
      daySchedules.push(
        { projectId: 'project_3', duration: 5400, description: 'Kavia AI data pipeline setup', billable: true },
        { projectId: 'project_5', duration: 3600, description: 'Ecosmob dedicated support', billable: true },
        { projectId: 'project_11', duration: 2700, description: 'DycoVue real-time sync module', billable: true },
        { projectId: 'project_12', duration: 3600, description: 'Ceremonia landing page design', billable: true },
        { projectId: 'project_9', duration: 3600, description: 'Inhouse Clokify - Created test cases for all APIs', billable: true },
        { projectId: 'project_4', duration: 2700, description: 'Internal - Node.js best practices session', billable: false }
      )
    } else if (dayOfWeek === 4) { // Thursday
      daySchedules.push(
        { projectId: 'project_6', duration: 3600, description: 'Nurvia fixed-cost milestone delivery', billable: true },
        { projectId: 'project_7', duration: 2700, description: 'Lifeguru caching layer implementation', billable: true },
        { projectId: 'project_8', duration: 3600, description: 'Pocket Sergeant hotfix deployment', billable: true },
        { projectId: 'project_13', duration: 2700, description: 'Company website SEO improvements', billable: false },
        { projectId: 'project_9', duration: 3600, description: 'Inhouse Clokify - Started working on LogSpanX', billable: true }
      )
    } else if (dayOfWeek === 5) { // Friday
      daySchedules.push(
        { projectId: 'project_3', duration: 3600, description: 'Kavia AI model evaluation', billable: true },
        { projectId: 'project_10', duration: 2700, description: 'Culturify bug fixes', billable: true },
        { projectId: 'project_14', duration: 2700, description: 'HealthSync patient dashboard', billable: true },
        { projectId: 'project_9', duration: 3600, description: 'Inhouse Clokify - Developed APIs', billable: true },
        { projectId: 'project_4', duration: 5400, description: 'Internal - Documentation & knowledge sharing', billable: false }
      )
    }
    
    schedules[dateStr] = daySchedules
  }
  
  return schedules
}

const weekSchedules = generateWeekSchedules()

// Distribute the same entries across multiple users for "Team" scope
const TEAM_USERS = ['user_1', 'user_2', 'user_3', 'user_4', 'user_5', 'user_6']

function generateAllEntries(): TimeEntry[] {
  const entries: TimeEntry[] = []
  let counter = 0

  for (const [dateStr, schedules] of Object.entries(weekSchedules)) {
    for (const sched of schedules) {
      // Assign to multiple users to make Team view rich
      const usersForEntry = sched.projectId === 'project_9'
        ? ['user_1'] // Inhouse Clokify only for Nishit
        : TEAM_USERS.slice(0, 3 + Math.floor(Math.random() * 3)) // 3-6 users

      for (const userId of usersForEntry) {
        counter++
        const startHour = 9 + Math.floor(Math.random() * 4)
        entries.push({
          id: `entry_${counter}`,
          description: sched.description,
          projectId: sched.projectId,
          billable: sched.billable,
          userId,
          workspaceId: 'workspace_1',
          startTime: new Date(`${dateStr}T${String(startHour).padStart(2, '0')}:00:00`),
          endTime: new Date(`${dateStr}T${String(startHour + Math.floor(sched.duration / 3600)).padStart(2, '0')}:00:00`),
          duration: sched.duration,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      }
    }
  }
  return entries
}

export const mockTimeEntries: TimeEntry[] = generateAllEntries()

export const mockReports: Report[] = []
export const mockNotifications: Notification[] = []
