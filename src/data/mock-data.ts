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
  { id: 'project_1', name: 'StaffBot Dedicated : Billable', color: '#4285f4', leadId: 'user_3', billable: true, members: [], archived: false, workspaceId: 'workspace_1', createdAt: new Date(), updatedAt: new Date() },
  { id: 'project_2', name: 'Nexaan(Jiteshbhai) : T & M : Billable', color: '#ea4335', leadId: 'user_4', billable: true, members: [], archived: false, workspaceId: 'workspace_1', createdAt: new Date(), updatedAt: new Date() },
  { id: 'project_3', name: 'Kavia AI : Dedicated : Billable', color: '#34a853', leadId: 'user_2', billable: true, members: [], archived: false, workspaceId: 'workspace_1', createdAt: new Date(), updatedAt: new Date() },
  { id: 'project_4', name: '_INX-Learning : Non-Billable', color: '#fbbc04', leadId: 'user_2', billable: false, members: [], archived: false, workspaceId: 'workspace_1', createdAt: new Date(), updatedAt: new Date() },
  { id: 'project_5', name: 'Ecosmob : Dedicated : Billable', color: '#9c27b0', leadId: 'user_6', billable: true, members: [], archived: false, workspaceId: 'workspace_1', createdAt: new Date(), updatedAt: new Date() },
  { id: 'project_6', name: 'Nurvia : Fixed-cost : Billable', color: '#00acc1', leadId: 'user_2', billable: true, members: [], archived: false, workspaceId: 'workspace_1', createdAt: new Date(), updatedAt: new Date() },
  { id: 'project_7', name: 'Lifeguru : Fixed-cost : Billable', color: '#8d6e63', leadId: 'user_2', billable: true, members: [], archived: false, workspaceId: 'workspace_1', createdAt: new Date(), updatedAt: new Date() },
  { id: 'project_8', name: 'Pocket Sergeant : Maintenance : Billable', color: '#f57c00', leadId: 'user_5', billable: true, members: [], archived: false, workspaceId: 'workspace_1', createdAt: new Date(), updatedAt: new Date() },
  { id: 'project_9', name: 'Inhouse Clokify Revamp :: Next - Node', color: '#5e35b1', leadId: 'user_1', billable: true, members: [], archived: false, workspaceId: 'workspace_1', createdAt: new Date(), updatedAt: new Date() },
  { id: 'project_10', name: 'Culturify : Fixed cost : Billable', color: '#2e7d32', leadId: 'user_2', billable: true, members: [], archived: false, workspaceId: 'workspace_1', createdAt: new Date(), updatedAt: new Date() },
  { id: 'project_11', name: 'DycoVue : Dedicated : Billable', color: '#7b1fa2', leadId: 'user_2', billable: true, members: [], archived: false, workspaceId: 'workspace_1', createdAt: new Date(), updatedAt: new Date() },
  { id: 'project_12', name: 'Ceremonia : Fixed Cost : Billable', color: '#689f38', leadId: 'user_2', billable: true, members: [], archived: false, workspaceId: 'workspace_1', createdAt: new Date(), updatedAt: new Date() },
  { id: 'project_13', name: '_INX-Company Website Revamp', color: '#616161', leadId: 'user_2', billable: false, members: [], archived: false, workspaceId: 'workspace_1', createdAt: new Date(), updatedAt: new Date() },
  { id: 'project_14', name: 'HealthSync : T & M : Billable', color: '#0277bd', leadId: 'user_4', billable: true, members: [], archived: false, workspaceId: 'workspace_1', createdAt: new Date(), updatedAt: new Date() },
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
    
    // Max 3 tasks per day — pick varied projects
    if (dayOfWeek === 1) { // Monday
      daySchedules.push(
        { projectId: 'project_9', duration: 9000, description: 'Inhouse Clokify - Complete remaining APIs', billable: true },
        { projectId: 'project_3', duration: 7200, description: 'Kavia AI model training scripts', billable: true }
      )
    } else if (dayOfWeek === 2) { // Tuesday
      daySchedules.push(
        { projectId: 'project_9', duration: 9000, description: 'Inhouse Clokify - Went through frontend frameworks', billable: true },
        { projectId: 'project_7', duration: 5400, description: 'Lifeguru backend performance optimization', billable: true }
      )
    } else if (dayOfWeek === 3) { // Wednesday
      daySchedules.push(
        { projectId: 'project_9', duration: 9000, description: 'Inhouse Clokify - Created test cases for all APIs', billable: true },
        { projectId: 'project_5', duration: 5400, description: 'Ecosmob dedicated support', billable: true }
      )
    } else if (dayOfWeek === 4) { // Thursday
      daySchedules.push(
        { projectId: 'project_9', duration: 9000, description: 'Inhouse Clokify - Started working on LogSpanX', billable: true },
        { projectId: 'project_6', duration: 5400, description: 'Nurvia fixed-cost milestone delivery', billable: true }
      )
    } else if (dayOfWeek === 5) { // Friday
      daySchedules.push(
        { projectId: 'project_9', duration: 9000, description: 'Inhouse Clokify - Developed APIs', billable: true },
        { projectId: 'project_3', duration: 5400, description: 'Kavia AI model evaluation', billable: true }
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
    // Track per-user current time cursor so entries are sequential (no overlaps)
    const userCursor: Record<string, number> = {} // minutes from midnight

    for (const sched of schedules) {
      const usersForEntry = sched.projectId === 'project_9'
        ? ['user_1']
        : TEAM_USERS.slice(0, 3 + Math.floor(Math.random() * 3))

      for (const userId of usersForEntry) {
        counter++
        // Start at 9:00 for first entry, then continue from where last ended
        if (!userCursor[userId]) userCursor[userId] = 9 * 60

        const startMin = userCursor[userId]
        const durationMin = Math.round(sched.duration / 60)
        const endMin = startMin + durationMin

        const startH = Math.floor(startMin / 60)
        const startM = startMin % 60
        const endH = Math.floor(endMin / 60)
        const endM = endMin % 60

        entries.push({
          id: `entry_${counter}`,
          description: sched.description,
          projectId: sched.projectId,
          billable: sched.billable,
          userId,
          workspaceId: 'workspace_1',
          startTime: new Date(`${dateStr}T${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')}:00`),
          endTime: new Date(`${dateStr}T${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}:00`),
          duration: sched.duration,
          createdAt: new Date(),
          updatedAt: new Date(),
        })

        // Advance cursor by duration + 0 min gap
        userCursor[userId] = endMin
      }
    }
  }
  return entries
}

export const mockTimeEntries: TimeEntry[] = generateAllEntries()

export const mockTags = [
  { id: 'tag_1', name: 'Design : HTML-CSS', workspaceId: 'workspace_1', archived: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'tag_2', name: 'Design : UI-UX', workspaceId: 'workspace_1', archived: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'tag_3', name: 'Mobile : Android', workspaceId: 'workspace_1', archived: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'tag_4', name: 'Mobile : Flutter', workspaceId: 'workspace_1', archived: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'tag_5', name: 'Mobile : iOS', workspaceId: 'workspace_1', archived: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'tag_6', name: 'Mobile : React-Native', workspaceId: 'workspace_1', archived: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'tag_7', name: 'Project Management', workspaceId: 'workspace_1', archived: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'tag_8', name: 'Backend : Node.js', workspaceId: 'workspace_1', archived: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'tag_9', name: 'Backend : Python', workspaceId: 'workspace_1', archived: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'tag_10', name: 'DevOps', workspaceId: 'workspace_1', archived: false, createdAt: new Date(), updatedAt: new Date() },
]

export const mockReports: Report[] = []
export const mockNotifications: Notification[] = []
