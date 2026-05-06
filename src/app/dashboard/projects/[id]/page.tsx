'use client'

import React, { useState, useMemo, useRef, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Search, ChevronDown, Check, Star, MoreVertical, Plus,
  Trash2, X, Users, Pencil, CheckCheck, RotateCcw
} from 'lucide-react'
import { useDataStore } from '@/lib/stores/data-store'
import { useAuthStore } from '@/lib/stores/auth-store'
import Link from 'next/link'
import { updateTaskAssignees } from '@/lib/api/tasks'
 
// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtHours = (s: number) => {
  const h = (s / 3600).toFixed(2)
  return `${h} h`
}

const TABS = ['TASKS', 'ACCESS', 'STATUS', 'FORECAST', 'NOTE', 'SETTINGS'] as const
type Tab = typeof TABS[number]

const PROJECT_COLORS = [
  '#03a9f4', '#e91e63', '#9c27b0', '#673ab7',
  '#3f51b5', '#4caf50', '#ff9800', '#f44336',
  '#00bcd4', '#009688', '#795548', '#607d8b',
]

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ProjectDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const {
    projects, users, timeEntries, tasks,
    isInitialized, updateProject,
    assignMember, unassignMember,
    createTask, updateTask, deleteTask,
    deleteProject,
  } = useDataStore()

  const [activeTab, setActiveTab] = useState<Tab>('TASKS')
  const [isFavorite, setIsFavorite] = useState(false)
  const [taskAssignees, setTaskAssignees] = useState<Record<string, { id: string; name: string }[]>>({})

  // Seed taskAssignees only for tasks not yet tracked locally
  useEffect(() => {
    setTaskAssignees(prev => {
      const next = { ...prev }
      tasks.forEach(t => {
        if (!(t.id in next) && t.assignees?.length) {
          next[t.id] = t.assignees
        }
      })
      return next
    })
  }, [tasks])

  const removeUserFromTaskAssignees = (userId: string) => {
    setTaskAssignees(prev => {
      const next: Record<string, { id: string; name: string }[]> = {}
      for (const [taskId, assignees] of Object.entries(prev)) {
        next[taskId] = assignees.filter(a => a.id !== userId)
      }
      return next
    })
  }

  const project = useMemo(
    () => projects.find((p) => p.id === id),
    [projects, id]
  )

  const projectTimeEntries = useMemo(
    () => timeEntries.filter((e) => e.projectId === id),
    [timeEntries, id]
  )

  const projectTasks = useMemo(
    () => tasks.filter((t) => t.projectId === id),
    [tasks, id]
  )

  const lead = useMemo(() => {
    if (!project?.leadId) return null
    return users.find((u) => u.id === project.leadId) ?? null
  }, [project, users])

  const projectMembers = useMemo(() => {
    if (!project) return []
    return project.members
      .map((m) => {
        const uid = typeof m === 'string' ? m : m.userId
        const user = users.find((u) => u.id === uid)
        return user
          ? { ...user, memberRole: typeof m === 'string' ? '-' : m.role }
          : null
      })
      .filter(Boolean) as (typeof users[0] & { memberRole: string })[]
  }, [project, users])

  if (!isInitialized) {
    return (
      <div className="min-h-full flex items-center justify-center bg-[#f2f6f8]">
        <div className="flex items-center gap-3 text-[#999]">
          <div className="w-5 h-5 border-2 border-[#03a9f4] border-t-transparent rounded-full animate-spin" />
          <span className="text-[14px]">Loading…</span>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center bg-[#f2f6f8] gap-4">
        <p className="text-[17px] text-[#999]">Project not found</p>
        <button
          onClick={() => router.push('/dashboard/projects')}
          className="text-[#03a9f4] hover:underline text-[14px]"
        >
          ← Back to Projects
        </button>
      </div>
    )
  }

  const handleDeleteProject = async () => {
    if (!confirm('Delete this project? This cannot be undone.')) return
    await deleteProject(project.id)
    router.push('/dashboard/projects')
  }

  return (
    <div className="min-h-full bg-[#f2f6f8]">
      {/* ─── Header ─── */}
      <div className="w-full bg-white border-b border-[#e4eaee]">
        <div className="px-6 pt-5 pb-1">
          <Link
            href="/dashboard/projects"
            className="text-[#03a9f4] hover:underline text-[14px] font-medium"
          >
            Projects
          </Link>
          <div className="flex items-start justify-between mt-1">
            <div>
              <h1 className="text-[20px] text-[#333] font-normal leading-tight">
                <span className="inline-flex items-center gap-2">
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: project.color }}
                  />
                  {project.name}
                  <span className="text-[#999]">:</span>
                  <span className="text-[#999]">
                    {project.billable ? 'Billable' : 'Non-Billable'}
                  </span>
                </span>
              </h1>
              <p className="text-[14px] text-[#999] mt-0.5">
                {lead?.name || project.leadName || 'No lead assigned'}
              </p>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className="p-1.5 hover:bg-[#f2f6f8] rounded transition-colors"
              >
                <Star
                  className={`h-[18px] w-[18px] ${isFavorite ? 'text-[#f5a623] fill-[#f5a623]' : 'text-[#ccc]'
                    }`}
                />
              </button>
              <button
                onClick={handleDeleteProject}
                className="p-1.5 hover:bg-red-50 rounded transition-colors"
                title="Delete project"
              >
                <Trash2 className="h-[18px] w-[18px] text-[#ccc] hover:text-red-500" />
              </button>
            </div>
          </div>
        </div>

        {/* ─── Tabs ─── */}
        <div className="px-6 flex items-center gap-0 mt-3">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 text-[14px] font-semibold uppercase tracking-widest transition-colors border-b-2 ${activeTab === tab
                ? 'text-[#333] border-[#333]'
                : 'text-[#999] border-transparent hover:text-[#666]'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Tab Content ─── */}
      <div className="w-full px-6 py-5">
        {activeTab === 'TASKS' && (
          <TasksTab
            tasks={projectTasks}
            users={users}
            projectMembers={projectMembers}
            projectId={id as string}
            taskAssignees={taskAssignees}
            setTaskAssignees={setTaskAssignees}
            onCreateTask={createTask}
            onUpdateTask={updateTask}
            onDeleteTask={deleteTask}
          />
        )}
        {activeTab === 'ACCESS' && (
          <AccessTab
            members={projectMembers}
            users={users}
            projectId={id as string}
            onAssignMember={assignMember}
            onUnassignMember={unassignMember}
            onMemberRemoved={removeUserFromTaskAssignees}
          />
        )}
        {activeTab === 'STATUS' && (
          <StatusTab
            timeEntries={projectTimeEntries}
            tasks={projectTasks}
            project={project}
          />
        )}
        {activeTab === 'FORECAST' && <PlaceholderTab name="Forecast" />}
        {activeTab === 'NOTE' && <NoteTab />}
        {activeTab === 'SETTINGS' && (
          <SettingsTab
            project={project}
            users={users}
            lead={lead}
            onUpdate={updateProject}
          />
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ASSIGNEES DROPDOWN
// ═══════════════════════════════════════════════════════════════════════════════
function AssigneesDropdown({ taskId, assignees, projectMembers, canManage, onUpdate }: {
  taskId: string
  assignees: { id: string; name: string }[]
  projectMembers: { id: string; name: string }[]
  canManage: boolean
  onUpdate: (taskId: string, assigneeIds: string[]) => Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node) && e.target !== btnRef.current) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const handleOpen = () => {
    if (!canManage) return
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      setPos({ top: rect.bottom + 4, left: rect.left })
    }
    setSearch('')
    setOpen(o => !o)
  }

  const assigneeIds = new Set(assignees.map(a => a.id))

  const toggle = async (memberId: string) => {
    const newIds = assigneeIds.has(memberId)
      ? [...assigneeIds].filter(id => id !== memberId)
      : [...assigneeIds, memberId]
    await onUpdate(taskId, newIds)
  }

  const filtered = projectMembers.filter(m =>
    !search || m.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div ref={ref}>
      <button
        ref={btnRef}
        onClick={handleOpen}
        className="inline-flex items-center gap-1 text-[14px] cursor-pointer max-w-[260px]"
      >
        {assignees.length === 0 ? (
          <span className="inline-flex items-center gap-1 text-[#aaa] text-[14px] hover:text-[#888] transition-colors">
            <Users className="h-3.5 w-3.5" /> Anyone
          </span>
        ) : (
          <span className="text-[14px] text-[#333] truncate">
            {assignees.slice(0, 2).map(a => a.name).join(', ')}{assignees.length > 2 ? '..' : ''}
          </span>
        )}
        {canManage && <ChevronDown className="h-3 w-3 text-[#bbb] shrink-0" />}
      </button>

      {open && (
        <div
          className="fixed bg-white border border-[#ddd] shadow-xl z-[9999] w-[240px] rounded-sm"
          style={{ top: pos.top, left: pos.left }}
        >
          <div className="flex items-center gap-2 px-3 py-2 border-b border-[#eee]">
            <Search className="h-3.5 w-3.5 text-[#bbb] flex-shrink-0" />
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search members…"
              className="flex-1 text-[14px] outline-none placeholder:text-[#bbb] bg-transparent"
            />
          </div>
          <div className="max-h-[220px] overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="text-[14px] text-[#aaa] py-4 text-center">No members found</p>
            ) : filtered.map(member => {
              const checked = assigneeIds.has(member.id)
              return (
                <button
                  key={member.id}
                  onClick={() => toggle(member.id)}
                  className="flex items-center gap-2.5 w-full px-3 py-2 hover:bg-[#f5f7f9] transition-colors cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-[#03a9f4] flex items-center justify-center text-[11px] font-bold text-white uppercase flex-shrink-0">
                    {member.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </div>
                  <span className="flex-1 text-[14px] text-[#333] truncate text-left">{member.name}</span>
                  {checked && <Check className="h-3.5 w-3.5 text-[#03a9f4] flex-shrink-0" />}
                </button>
              )
            })}
          </div>
          {assignees.length > 0 && (
            <div className="border-t border-[#eee] px-3 py-2">
              <button
                onClick={() => onUpdate(taskId, [])}
                className="text-[13px] text-[#f44336] hover:underline cursor-pointer"
              >
                Remove all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TASKS TAB
// ═══════════════════════════════════════════════════════════════════════════════
function TasksTab({
  tasks,
  users,
  projectMembers,
  projectId,
  taskAssignees,
  setTaskAssignees,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
}: {
  tasks: { id: string; name: string; completed: boolean; projectId: string; assignees?: { id: string; name: string }[] }[]
  users: { id: string; name: string }[]
  projectMembers: { id: string; name: string; memberRole: string }[]
  projectId: string
  taskAssignees: Record<string, { id: string; name: string }[]>
  setTaskAssignees: React.Dispatch<React.SetStateAction<Record<string, { id: string; name: string }[]>>>
  onCreateTask: (projectId: string, name: string) => Promise<void>
  onUpdateTask: (taskId: string, updates: { name?: string; completed?: boolean }) => Promise<void>
  onDeleteTask: (taskId: string) => Promise<void>
}) {
  const { user: currentUser } = useAuthStore()
  const canManageAssignees = currentUser?.role === 'project_manager' || currentUser?.role === 'team_lead'

  // Seed is handled at page level

  const handleUpdateAssignees = async (taskId: string, assigneeIds: string[]) => {
    try {
      const res = await updateTaskAssignees(taskId, assigneeIds)
      const raw = res as any
      const updatedAssignees: { _id?: string; id?: string; name: string }[] =
        raw?.assignees ?? raw?.data?.assignees ?? []
      setTaskAssignees(prev => ({
        ...prev,
        [taskId]: updatedAssignees.map(a => ({ id: a._id ?? a.id ?? '', name: a.name })),
      }))
    } catch (err) { console.error(err) }
  }
  const [filter, setFilter] = useState<'active' | 'done' | 'all'>('all')
  const [search, setSearch] = useState('')
  const [newTaskName, setNewTaskName] = useState('')
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [actionMenuId, setActionMenuId] = useState<string | null>(null)
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 })
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null)

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (filter === 'active' && t.completed) return false
      if (filter === 'done' && !t.completed) return false
      if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [tasks, filter, search])

  const handleAddTask = async () => {
    if (!newTaskName.trim() || adding) return
    setAdding(true)
    try {
      await onCreateTask(projectId, newTaskName.trim())
      setNewTaskName('')
    } catch (err) {
      console.error('Failed to create task:', err)
    } finally {
      setAdding(false)
    }
  }

  const handleToggleComplete = async (task: { id: string; completed: boolean; name: string }) => {
    // Optimistic update via store — toggle locally first
    const { tasks: storeTasks } = useDataStore.getState()
    useDataStore.setState({
      tasks: storeTasks.map(t =>
        t.id === task.id ? { ...t, completed: !task.completed } : t
      ),
    })
    try {
      await onUpdateTask(task.id, { name: task.name, completed: !task.completed })
    } catch (err) {
      // Rollback on failure
      useDataStore.setState({
        tasks: storeTasks.map(t =>
          t.id === task.id ? { ...t, completed: task.completed } : t
        ),
      })
      console.error('Failed to update task:', err)
    }
  }

  const handleRename = async (taskId: string) => {
    if (!editName.trim()) { setEditingId(null); return }
    try {
      await onUpdateTask(taskId, { name: editName.trim() })
    } catch (err) {
      console.error('Failed to rename task:', err)
    } finally {
      setEditingId(null)
    }
  }

  const handleDelete = (taskId: string, taskName: string) => {
    setActionMenuId(null)
    setConfirmDelete({ id: taskId, name: taskName })
  }

  const confirmDeleteTask = async () => {
    if (!confirmDelete) return
    try {
      await onDeleteTask(confirmDelete.id)
    } catch (err) {
      console.error('Failed to delete task:', err)
    } finally {
      setConfirmDelete(null)
    }
  }

  return (
    <div>
      {/* Filter bar */}
      <div className="flex items-center justify-between mb-0 bg-white border border-[#e4eaee] rounded-t-md px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'active' | 'done' | 'all')}
              className="appearance-none bg-white border border-[#c6d2d9] rounded-sm px-3 py-[6px] pr-8 text-[14px] text-[#666] outline-none focus:border-[#03a9f4] cursor-pointer"
            >
              <option value="active">Show active</option>
              <option value="done">Show done</option>
              <option value="all">Show all</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#999] pointer-events-none" />
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#999]" />
            <input
              type="text"
              placeholder="Search by name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-[6px] text-[14px] border border-[#c6d2d9] rounded-sm outline-none focus:border-[#03a9f4] w-[220px]"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Add new Task"
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
            className="px-3 py-[6px] text-[14px] border border-[#c6d2d9] rounded-sm outline-none focus:border-[#03a9f4] w-[200px]"
          />
          <button
            onClick={handleAddTask}
            disabled={adding || !newTaskName.trim()}
            className="bg-[#03a9f4] hover:bg-[#0288d1] text-white text-[14px] font-bold uppercase tracking-widest px-5 py-[7px] rounded-sm transition-colors disabled:opacity-50"
          >
            {adding ? '…' : 'ADD'}
          </button>
        </div>
      </div>

      {/* Tasks table */}
      <div className="bg-white border border-t-0 border-[#e4eaee] rounded-b-md overflow-hidden">
        <div className="bg-[#f0f7fb] px-5 py-2.5 border-b border-[#d6e5ef]">
          <span className="text-[14px] font-bold text-[#5c7b91] uppercase tracking-widest">
            Tasks
          </span>
        </div>

        <div className="flex items-center border-b border-[#e4eaee] px-5 py-2.5">
          <div className="flex-1 flex items-center gap-1 cursor-pointer">
            <span className="text-[14px] font-bold text-[#999] uppercase tracking-widest">NAME</span>
            <ChevronDown className="h-3 w-3 text-[#ccc]" />
          </div>
          <div className="w-[300px]">
            <span className="text-[14px] font-bold text-[#999] uppercase tracking-widest">ASSIGNEES</span>
          </div>
          <div className="w-[40px]" />
        </div>

        {filtered.length === 0 ? (
          <div className="px-5 py-12 text-center text-[#999] text-[14px]">
            No tasks found
          </div>
        ) : (
          filtered.map((task) => (
            <div
              key={task.id}
              className="flex items-center border-b border-[#f1f4f7] px-5 py-3 hover:bg-[#fcfdfe] transition-colors group"
            >
              {/* Complete checkbox */}
              <button
                onClick={() => handleToggleComplete(task)}
                className={`w-[16px] h-[16px] rounded border-2 flex items-center justify-center mr-3 shrink-0 transition-colors ${task.completed ? 'bg-[#4caf50] border-[#4caf50]' : 'border-[#ccc] hover:border-[#03a9f4]'
                  }`}
              >
                {task.completed && (
                  <Check className="w-3 h-3 text-white stroke-[3px]" />
                )}
              </button>

              {/* Task name */}
              <div className="flex-1">
                {editingId === task.id ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRename(task.id)
                      if (e.key === 'Escape') setEditingId(null)
                    }}
                    onBlur={() => handleRename(task.id)}
                    className="w-full px-2 py-1 text-[14px] border border-[#03a9f4] rounded-sm outline-none"
                    autoFocus
                  />
                ) : (
                  <span
                    className={`text-[14px] cursor-pointer ${task.completed ? 'text-[#999] line-through' : 'text-[#03a9f4]'
                      }`}
                    onDoubleClick={() => { setEditingId(task.id); setEditName(task.name) }}
                  >
                    {task.name}
                  </span>
                )}
              </div>

              {/* Assignees */}
              <div className="w-[300px]">
                <AssigneesDropdown
                  taskId={task.id}
                  assignees={taskAssignees[task.id] ?? task.assignees ?? []}
                  projectMembers={projectMembers}
                  canManage={canManageAssignees}
                  onUpdate={handleUpdateAssignees}
                />
              </div>
 
              {/* Kebab menu — owner/admin only */}
              <div className="w-[40px] flex justify-end">
                {canManageAssignees && (
                  <button
                    onClick={(e) => {
                      if (actionMenuId === task.id) {
                        setActionMenuId(null)
                      } else {
                        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
                        setMenuPos({ top: rect.bottom + 4, left: rect.right - 160 })
                        setActionMenuId(task.id)
                      }
                    }}
                    className="p-1 text-[#ccc] hover:text-[#666] opacity-0 group-hover:opacity-100 transition-all rounded"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                )}
                {canManageAssignees && actionMenuId === task.id && (
                  <TaskActionMenu
                    pos={menuPos}
                    onRename={() => {
                      setEditingId(task.id)
                      setEditName(task.name)
                      setActionMenuId(null)
                    }}
                    onToggleComplete={() => {
                      handleToggleComplete(task)
                      setActionMenuId(null)
                    }}
                    onDelete={() => handleDelete(task.id, task.name)}
                    onClose={() => setActionMenuId(null)}
                    isCompleted={task.completed}
                  />
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Task Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[1000] p-4">
          <div className="bg-white rounded-sm shadow-2xl w-full max-w-[400px]">
            <div className="px-6 py-4 flex items-center justify-between border-b border-[#e4eaee]">
              <h2 className="text-[18px] font-normal text-[#333]">Delete Task</h2>
              <button onClick={() => setConfirmDelete(null)} className="text-[#999] hover:text-[#666] cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-5">
              <p className="text-[15px] text-[#555]">
                Are you sure you want to delete <strong className="text-[#333]">{confirmDelete.name}</strong>? This cannot be undone.
              </p>
            </div>
            <div className="px-6 py-4 flex items-center justify-end gap-3 border-t border-[#e4eaee]">
              <button onClick={() => setConfirmDelete(null)} className="text-[#555] text-[14px] hover:underline cursor-pointer">Cancel</button>
              <button
                onClick={confirmDeleteTask}
                className="bg-[#f44336] hover:bg-[#d32f2f] text-white px-6 py-2 text-[14px] font-bold rounded-sm uppercase tracking-wider cursor-pointer transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function TaskActionMenu({
  pos,
  onRename,
  onToggleComplete,
  onDelete,
  onClose,
  isCompleted,
}: {
  pos: { top: number; left: number }
  onRename: () => void
  onToggleComplete: () => void
  onDelete: () => void
  onClose: () => void
  isCompleted: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div
      ref={ref}
      className="fixed bg-white border border-[#e4eaee] rounded-md shadow-2xl z-[9999] py-1 w-[160px]"
      style={{ top: pos.top, left: pos.left }}
    >
      <button
        onClick={onRename}
        className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-[#444] hover:bg-[#f5f7f9] transition-colors"
      >
        <Pencil className="h-3.5 w-3.5 text-[#aaa]" />
        Rename
      </button>
      <button
        onClick={onToggleComplete}
        className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-[#444] hover:bg-[#f5f7f9] transition-colors"
      >
        {isCompleted
          ? <RotateCcw className="h-3.5 w-3.5 text-[#aaa]" />
          : <CheckCheck className="h-3.5 w-3.5 text-[#aaa]" />}
        {isCompleted ? 'Mark active' : 'Mark done'}
      </button>
      <div className="h-px bg-[#f0f4f7] my-1" />
      <button
        onClick={onDelete}
        className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-red-500 hover:bg-red-50 transition-colors"
      >
        <Trash2 className="h-3.5 w-3.5" />
        Delete
      </button>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ACCESS TAB
// ═══════════════════════════════════════════════════════════════════════════════
function AccessTab({
  members,
  users,
  projectId,
  onAssignMember,
  onUnassignMember,
  onMemberRemoved,
}: {
  members: { id: string; name: string; email: string; memberRole: string; billableRate?: number }[]
  users: { id: string; name: string }[]
  projectId: string
  onAssignMember: (projectId: string, userId: string, role?: string, hourlyRate?: number) => Promise<void>
  onUnassignMember: (projectId: string, userId: string) => Promise<void>
  onMemberRemoved: (userId: string) => void
}) {
  const [visibility, setVisibility] = useState<'private' | 'public'>('private')
  const [showAddPanel, setShowAddPanel] = useState(false)
  const [addSearch, setAddSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [assigning, setAssigning] = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)
  const [confirmRemove, setConfirmRemove] = useState<{ id: string; name: string } | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const addBtnRef = useRef<HTMLButtonElement>(null)
  const [panelPos, setPanelPos] = useState({ top: 0, left: 0 })

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        addBtnRef.current && !addBtnRef.current.contains(e.target as Node)
      ) {
        setShowAddPanel(false)
        setAddSearch('')
        setSelectedIds(new Set())
      }
    }
    if (showAddPanel) document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [showAddPanel])

  const memberIds = new Set(members.map((m) => m.id))
  const availableUsers = users.filter(
    (u) => !memberIds.has(u.id) && u.name.toLowerCase().includes(addSearch.toLowerCase())
  )

  const toggleSelect = (userId: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(userId) ? next.delete(userId) : next.add(userId)
      return next
    })
  }

  const handleAssignSelected = async () => {
    if (selectedIds.size === 0 || assigning) return
    setAssigning(true)
    try {
      await Promise.all([...selectedIds].map(uid => onAssignMember(projectId, uid)))
      setShowAddPanel(false)
      setAddSearch('')
      setSelectedIds(new Set())
    } catch (err) {
      console.error('Failed to assign members:', err)
    } finally {
      setAssigning(false)
    }
  }

  const handleUnassign = (userId: string, userName: string) => {
    setConfirmRemove({ id: userId, name: userName })
  }

  const confirmUnassign = async () => {
    if (!confirmRemove) return
    setRemoving(confirmRemove.id)
    try {
      await onUnassignMember(projectId, confirmRemove.id)
      onMemberRemoved(confirmRemove.id)
    } catch (err) {
      console.error('Failed to unassign member:', err)
    } finally {
      setRemoving(null)
      setConfirmRemove(null)
    }
  }

  return (
    <div className="bg-white border border-[#e4eaee] rounded-md overflow-hidden">
      {/* Visibility */}
      <div className="px-6 py-5 border-b border-[#e4eaee]">
        <h3 className="text-[14px] font-semibold text-[#333] mb-1">Visibility</h3>
        <p className="text-[14px] text-[#999] mb-3">
          Only people you add to the Project can track time on it.
        </p>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="visibility"
              checked={visibility === 'private'}
              onChange={() => setVisibility('private')}
              className="w-4 h-4 accent-[#03a9f4]"
            />
            <span className="text-[14px] text-[#333]">Private</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="visibility"
              checked={visibility === 'public'}
              onChange={() => setVisibility('public')}
              className="w-4 h-4 accent-[#03a9f4]"
            />
            <span className="text-[14px] text-[#333]">Public</span>
          </label>
        </div>
      </div>

      {/* Add members */}
      <div className="px-6 py-4 border-b border-[#e4eaee]">
        <button
          ref={addBtnRef}
          onClick={() => {
            if (showAddPanel) {
              setShowAddPanel(false)
              setSelectedIds(new Set())
            } else {
              if (addBtnRef.current) {
                const rect = addBtnRef.current.getBoundingClientRect()
                setPanelPos({ top: rect.bottom + 6, left: rect.left })
              }
              setAddSearch('')
              setShowAddPanel(true)
            }
          }}
          className="flex items-center gap-1.5 text-[#03a9f4] text-[14px] font-medium hover:underline"
        >
          <Plus className="h-4 w-4" />
          Add members
        </button>

        {showAddPanel && (
          <div
            ref={panelRef}
            className="fixed z-[9999] bg-white border border-[#ddd] shadow-xl rounded-sm w-[300px] flex flex-col"
            style={{ top: panelPos.top, left: panelPos.left }}
          >
            {/* Search */}
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-[#eee]">
              <Search className="h-3.5 w-3.5 text-[#bbb] flex-shrink-0" />
              <input
                type="text"
                placeholder="Search users…"
                value={addSearch}
                onChange={(e) => setAddSearch(e.target.value)}
                className="flex-1 text-[14px] outline-none placeholder:text-[#bbb] bg-transparent"
                autoFocus
              />
              <button
                onClick={() => { setShowAddPanel(false); setSelectedIds(new Set()) }}
                className="text-[#bbb] hover:text-[#666] cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* User list */}
            <div className="max-h-[220px] overflow-y-auto py-1">
              {availableUsers.length === 0 ? (
                <p className="text-[14px] text-[#aaa] py-6 text-center">
                  {addSearch ? 'No users found' : 'All users already added'}
                </p>
              ) : (
                availableUsers.map((user) => (
                  <label
                    key={user.id}
                    className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-[#f5f7f9] transition-colors cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has(user.id)}
                      onChange={() => toggleSelect(user.id)}
                      className="w-4 h-4 accent-[#03a9f4] flex-shrink-0 cursor-pointer"
                    />
                    <div className="w-7 h-7 rounded-full bg-[#03a9f4] flex items-center justify-center text-[11px] font-bold text-white uppercase flex-shrink-0">
                      {user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                    </div>
                    <span className="flex-1 text-[14px] text-[#333] truncate">{user.name}</span>
                  </label>
                ))
              )}
            </div>

            {/* Footer */}
            {availableUsers.length > 0 && (
              <div className="px-3 py-2.5 border-t border-[#eee] flex items-center justify-between">
                <span className="text-[13px] text-[#999]">
                  {selectedIds.size > 0 ? `${selectedIds.size} selected` : 'Select members'}
                </span>
                <button
                  onClick={handleAssignSelected}
                  disabled={selectedIds.size === 0 || assigning}
                  className="bg-[#03a9f4] hover:bg-[#0288d1] disabled:opacity-40 text-white text-[13px] font-bold px-4 py-1.5 rounded-sm transition-colors cursor-pointer"
                >
                  {assigning ? 'Adding…' : 'Add'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Members table */}
      <div>
        <div className="bg-[#f0f7fb] px-6 py-2.5 border-b border-[#d6e5ef]">
          <span className="text-[14px] font-bold text-[#5c7b91] uppercase tracking-widest">
            Users
          </span>
        </div>
        <div className="flex items-center border-b border-[#e4eaee] px-6 py-2.5 bg-white">
          <div className="flex-1">
            <span className="text-[14px] font-bold text-[#999] uppercase tracking-widest">NAME</span>
          </div>
          <div className="w-[250px] text-center">
            <span className="text-[14px] font-bold text-[#999] uppercase tracking-widest">BILLABLE RATE (USD)</span>
          </div>
          <div className="w-[120px] text-right">
            <span className="text-[14px] font-bold text-[#999] uppercase tracking-widest">ROLE</span>
          </div>
          <div className="w-[40px]" />
        </div>

        {members.length === 0 ? (
          <div className="px-6 py-12 text-center text-[#999] text-[14px]">
            No members assigned to this project
          </div>
        ) : (
          members.map((member) => (
            <div
              key={member.id}
              className="flex items-center border-b border-[#f1f4f7] px-6 py-3.5 hover:bg-[#fcfdfe] transition-colors group"
            >
              <div className="flex-1">
                <span className="text-[14px] text-[#333]">{member.name}</span>
              </div>
              <div className="w-[250px] flex items-center justify-center gap-2">
                <input
                  type="text"
                  defaultValue="—"
                  className="w-[80px] px-2 py-1 text-[14px] text-center border border-[#e4eaee] rounded-sm outline-none focus:border-[#03a9f4] bg-[#f8fafb]"
                  readOnly
                />
                <button className="text-[#03a9f4] text-[14px] font-medium hover:underline">
                  Change
                </button>
              </div>
              <div className="w-[120px] text-right">
                <span className="text-[14px] text-[#333] capitalize">
                  {member.memberRole === '-' ? '-' : member.memberRole}
                </span>
              </div>
              <div className="w-[40px] flex justify-end">
                <button
                  onClick={() => handleUnassign(member.id, member.name)}
                  disabled={removing === member.id}
                  className="p-1 text-[#ccc] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
                  title="Remove member"
                >
                  {removing === member.id ? (
                    <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Remove Member Confirmation Modal */}
      {confirmRemove && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[1000] p-4">
          <div className="bg-white rounded-sm shadow-2xl w-full max-w-[400px]">
            <div className="px-6 py-4 flex items-center justify-between border-b border-[#e4eaee]">
              <h2 className="text-[18px] font-normal text-[#333]">Remove Member</h2>
              <button onClick={() => setConfirmRemove(null)} className="text-[#999] hover:text-[#666] cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-5">
              <p className="text-[15px] text-[#555]">
                Are you sure you want to remove <strong className="text-[#333]">{confirmRemove.name}</strong> from this project?
              </p>
            </div>
            <div className="px-6 py-4 flex items-center justify-end gap-3 border-t border-[#e4eaee]">
              <button onClick={() => setConfirmRemove(null)} className="text-[#555] text-[14px] hover:underline cursor-pointer">Cancel</button>
              <button
                onClick={confirmUnassign}
                disabled={removing === confirmRemove.id}
                className="bg-[#f44336] hover:bg-[#d32f2f] text-white px-6 py-2 text-[14px] font-bold rounded-sm uppercase tracking-wider cursor-pointer transition-colors disabled:opacity-60"
              >
                {removing === confirmRemove.id ? 'Removing…' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
// ═══════════════════════════════════════════════════════════════════════════════
function StatusTab({
  timeEntries,
  tasks,
  project,
}: {
  timeEntries: { duration?: number; billable: boolean }[]
  tasks: { id: string; name: string; completed: boolean }[]
  project: { billable: boolean; hourlyRate?: number }
}) {
  const totalSeconds = timeEntries.reduce((a, e) => a + (e.duration || 0), 0)
  const billableSeconds = timeEntries
    .filter((e) => e.billable)
    .reduce((a, e) => a + (e.duration || 0), 0)
  const nonBillableSeconds = totalSeconds - billableSeconds
  const billablePercent = totalSeconds > 0 ? (billableSeconds / totalSeconds) * 100 : 0
  const amount = ((billableSeconds / 3600) * (project.hourlyRate || 0)).toFixed(2)

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Stats */}
        <div className="bg-white border border-[#e4eaee] rounded-md p-6">
          <div className="border-b border-[#e4eaee] pb-4 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-bold text-[#999] uppercase tracking-widest">TRACKED</span>
              <span className="text-[18px] font-semibold text-[#333]">{fmtHours(totalSeconds)}</span>
            </div>
          </div>
          <div className="space-y-2 border-b border-[#e4eaee] pb-4 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-bold text-[#03a9f4] uppercase tracking-widest">BILLABLE</span>
              <span className="text-[16px] font-semibold text-[#333]">{fmtHours(billableSeconds)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[14px] text-[#999] uppercase tracking-widest">NON-BILLABLE</span>
              <span className="text-[16px] text-[#666]">{fmtHours(nonBillableSeconds)}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-bold text-[#999] uppercase tracking-widest">AMOUNT</span>
            <span className="text-[18px] font-semibold text-[#333]">{amount} USD</span>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="bg-white border border-[#e4eaee] rounded-md p-6 flex items-center justify-center">
          <div className="relative w-[200px] h-[200px]">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <circle cx="100" cy="100" r="70" fill="none" stroke="#e4eaee" strokeWidth="35" />
              {totalSeconds > 0 && (
                <circle
                  cx="100" cy="100" r="70" fill="none" stroke="#8bc34a" strokeWidth="35"
                  strokeDasharray={`${(billablePercent / 100) * 440} 440`}
                  transform="rotate(-90 100 100)"
                />
              )}
              {totalSeconds > 0 && nonBillableSeconds > 0 && (
                <circle
                  cx="100" cy="100" r="70" fill="none" stroke="#c5e1a5" strokeWidth="35"
                  strokeDasharray={`${((100 - billablePercent) / 100) * 440} 440`}
                  strokeDashoffset={`${-((billablePercent / 100) * 440)}`}
                  transform="rotate(-90 100 100)"
                />
              )}
              <text x="100" y="96" textAnchor="middle" className="text-[14px] font-semibold fill-[#333]">
                {fmtHours(totalSeconds)}
              </text>
            </svg>
          </div>
          <div className="ml-6 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-[#8bc34a]" />
              <span className="text-[14px] text-[#666]">Billable</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-[#c5e1a5]" />
              <span className="text-[14px] text-[#666]">Non-billable</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks breakdown */}
      <div className="bg-white border border-[#e4eaee] rounded-md overflow-hidden">
        <div className="bg-[#f0f7fb] px-5 py-2.5 border-b border-[#d6e5ef] flex items-center justify-between">
          <span className="text-[14px] font-bold text-[#5c7b91] uppercase tracking-widest">Tasks</span>
        </div>
        <div className="flex items-center border-b border-[#e4eaee] px-5 py-2.5">
          <div className="flex-1"><span className="text-[14px] font-bold text-[#999] uppercase tracking-widest">NAME</span></div>
          <div className="w-[200px]"><span className="text-[14px] font-bold text-[#999] uppercase tracking-widest">ASSIGNEES</span></div>
          <div className="w-[120px] text-right"><span className="text-[14px] font-bold text-[#999] uppercase tracking-widest">TRACKED</span></div>
          <div className="w-[100px] text-right"><span className="text-[14px] font-bold text-[#999] uppercase tracking-widest">AMOUNT</span></div>
        </div>
        {tasks.length === 0 ? (
          <div className="px-5 py-10 text-center text-[#999] text-[14px]">No tasks</div>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="flex items-center border-b border-[#f1f4f7] px-5 py-3 hover:bg-[#fcfdfe] transition-colors">
              <div className="flex-1"><span className="text-[14px] text-[#03a9f4]">{task.name}</span></div>
              <div className="w-[200px]"><span className="text-[14px] text-[#666]">Anyone</span></div>
              <div className="w-[120px] text-right"><span className="text-[14px] text-[#666]">0.00h</span></div>
              <div className="w-[100px] text-right"><span className="text-[14px] text-[#666]">0.00 USD</span></div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// NOTE TAB
// ═══════════════════════════════════════════════════════════════════════════════
function NoteTab() {
  const [note, setNote] = useState('')
  return (
    <div className="bg-white border border-[#e4eaee] rounded-md overflow-hidden px-6 py-4">
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Add a note for this project..."
        className="w-full h-[200px] p-3 text-[14px] text-[#333] border border-[#c6d2d9] rounded-sm outline-none focus:border-[#03a9f4] resize-y"
      />
      <div className="flex justify-end mt-3">
        <button className="bg-[#03a9f4] hover:bg-[#0288d1] text-white text-[14px] font-bold uppercase tracking-widest px-5 py-2 rounded-sm transition-colors">
          Save Note
        </button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SETTINGS TAB
// ═══════════════════════════════════════════════════════════════════════════════
function SettingsTab({
  project,
  users,
  lead,
  onUpdate,
}: {
  project: {
    id: string; name: string; color: string; leadId?: string
    billable: boolean; hourlyRate?: number; clientName?: string
  }
  users: { id: string; name: string }[]
  lead: { id: string; name: string } | null
  onUpdate: (id: string, updates: Record<string, unknown>) => Promise<void>
}) {
  const [name, setName] = useState(project.name)
  const [leadId, setLeadId] = useState(project.leadId || '')
  const [color, setColor] = useState(project.color)
  const [billable, setBillable] = useState(project.billable)
  const [hourlyRate, setHourlyRate] = useState(project.hourlyRate?.toString() || '')
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await onUpdate(project.id, {
        name,
        leadId: leadId || undefined,
        color,
        billable,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error('Failed to save settings:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white border border-[#e4eaee] rounded-md overflow-hidden">
      <div className="px-6 py-6 max-w-[500px] flex flex-col gap-7">
        {/* Name */}
        <div>
          <h3 className="text-[14px] font-semibold text-[#333] mb-1">Name</h3>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 text-[14px] border border-[#c6d2d9] rounded-sm outline-none focus:border-[#03a9f4]"
          />
        </div>

        <div className="h-[1px] bg-[#e4eaee]" />

        {/* Project Lead */}
        <div>
          <h3 className="text-[14px] font-semibold text-[#333] mb-1">Project Lead</h3>
          <p className="text-[14px] text-[#999] mb-2">Used for grouping similar Projects together.</p>
          <div className="relative">
            <select
              value={leadId}
              onChange={(e) => setLeadId(e.target.value)}
              className="w-full px-3 py-2 text-[14px] border border-[#c6d2d9] rounded-sm outline-none focus:border-[#03a9f4] bg-white appearance-none pr-8 cursor-pointer"
            >
              <option value="">— No lead —</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#999] pointer-events-none" />
          </div>
        </div>

        <div className="h-[1px] bg-[#e4eaee]" />

        {/* Color */}
        <div>
          <h3 className="text-[14px] font-semibold text-[#333] mb-1">Color</h3>
          <p className="text-[14px] text-[#999] mb-2">Use color to visually differentiate Projects.</p>
          <div className="relative">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="flex items-center gap-1.5 border border-[#c6d2d9] rounded-sm px-2 py-1.5"
            >
              <div className="w-6 h-6 rounded-sm" style={{ backgroundColor: color }} />
              <ChevronDown className="h-3.5 w-3.5 text-[#999]" />
            </button>
            {showColorPicker && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-[#e4eaee] rounded-sm shadow-xl p-3 z-50 flex flex-wrap gap-2 w-[200px]">
                {PROJECT_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => { setColor(c); setShowColorPicker(false) }}
                    className={`w-7 h-7 rounded-full transition-all ${color === c ? 'ring-2 ring-offset-2 ring-[#03a9f4]' : ''}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="h-[1px] bg-[#e4eaee]" />

        {/* Billable */}
        <div>
          <h3 className="text-[14px] font-semibold text-[#333] mb-1">Billable by default</h3>
          <p className="text-[14px] text-[#999] mb-3">
            All new entries on this Project will be initially set as billable.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setBillable(!billable)}
              className={`relative w-11 h-6 rounded-full transition-colors ${billable ? 'bg-[#03a9f4]' : 'bg-[#ccc]'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${billable ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
            </button>
            <span className="text-[14px] text-[#666]">{billable ? 'Yes' : 'No'}</span>
          </div>
        </div>

        <div className="h-[1px] bg-[#e4eaee]" />

        {/* Hourly rate */}
        <div>
          <h3 className="text-[14px] font-semibold text-[#333] mb-1">Project billable rate</h3>
          <p className="text-[14px] text-[#999] mb-2">Billable rate used for calculating billable amount for this Project.</p>
          <p className="text-[14px] text-[#666] mb-2">Hourly rate (USD)</p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              placeholder="—"
              className="w-[100px] px-3 py-1.5 text-[14px] border border-[#c6d2d9] rounded-sm outline-none focus:border-[#03a9f4] bg-[#f8fafb]"
            />
            <button className="text-[#03a9f4] text-[14px] font-medium hover:underline">Set rate</button>
          </div>
        </div>

        <div className="h-[1px] bg-[#e4eaee]" />

        {/* Estimate */}
        <div>
          <h3 className="text-[14px] font-semibold text-[#333] mb-1">Project estimate</h3>
          <p className="text-[14px] text-[#999] mb-2">Choose how you wish to track Project progress (time or fixed fee budget).</p>
          <div className="relative">
            <select className="w-[200px] px-3 py-2 text-[14px] border border-[#c6d2d9] rounded-sm outline-none focus:border-[#03a9f4] bg-white appearance-none pr-8 cursor-pointer">
              <option>No estimate</option>
              <option>Time estimate</option>
              <option>Budget estimate</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#999] pointer-events-none" />
          </div>
        </div>

        {/* Save */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {saved && <span className="text-[14px] text-[#4caf50]">✓ Saved</span>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#03a9f4] hover:bg-[#0288d1] text-white text-[14px] font-bold uppercase tracking-widest px-6 py-2 rounded-sm transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// PLACEHOLDER TAB
// ═══════════════════════════════════════════════════════════════════════════════
function PlaceholderTab({ name }: { name: string }) {
  return (
    <div className="bg-white border border-[#e4eaee] rounded-md px-6 py-16 text-center">
      <p className="text-[14px] text-[#999]">{name} — Coming soon</p>
    </div>
  )
}