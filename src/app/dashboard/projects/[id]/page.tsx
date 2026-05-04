'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Search, ChevronDown, Check, Star, MoreVertical, Plus,
  DollarSign, Trash2, X
} from 'lucide-react'
import { useDataStore } from '@/lib/stores/data-store'
import Link from 'next/link'
 
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
            projectId={id as string}
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
// TASKS TAB
// ═══════════════════════════════════════════════════════════════════════════════
function TasksTab({
  tasks,
  users,
  projectId,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
}: {
  tasks: { id: string; name: string; completed: boolean; projectId: string }[]
  users: { id: string; name: string }[]
  projectId: string
  onCreateTask: (projectId: string, name: string) => Promise<void>
  onUpdateTask: (taskId: string, updates: { name?: string; completed?: boolean }) => Promise<void>
  onDeleteTask: (taskId: string) => Promise<void>
}) {
  const [filter, setFilter] = useState<'active' | 'done' | 'all'>('active')
  const [search, setSearch] = useState('')
  const [newTaskName, setNewTaskName] = useState('')
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [actionMenuId, setActionMenuId] = useState<string | null>(null)

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
    try {
      await onUpdateTask(task.id, { name: task.name, completed: !task.completed })
    } catch (err) {
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

  const handleDelete = async (taskId: string) => {
    setActionMenuId(null)
    try {
      await onDeleteTask(taskId)
    } catch (err) {
      console.error('Failed to delete task:', err)
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
                <span className="inline-flex items-center gap-1 bg-[#e8f5fd] text-[#03a9f4] text-[14px] font-medium px-3 py-1 rounded-sm">
                  Anyone
                  <ChevronDown className="h-3 w-3" />
                </span>
              </div>
 
              {/* Kebab menu */}
              <div className="w-[40px] flex justify-end relative">
                <button
                  onClick={() => setActionMenuId(actionMenuId === task.id ? null : task.id)}
                  className="p-1 text-[#ccc] hover:text-[#666] opacity-0 group-hover:opacity-100 transition-all"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
                {actionMenuId === task.id && (
                  <TaskActionMenu
                    onRename={() => {
                      setEditingId(task.id)
                      setEditName(task.name)
                      setActionMenuId(null)
                    }}
                    onToggleComplete={() => {
                      handleToggleComplete(task)
                      setActionMenuId(null)
                    }}
                    onDelete={() => handleDelete(task.id)}
                    onClose={() => setActionMenuId(null)}
                    isCompleted={task.completed}
                  />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function TaskActionMenu({
  onRename,
  onToggleComplete,
  onDelete,
  onClose,
  isCompleted,
}: {
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
      className="absolute right-0 top-full mt-1 bg-white border border-[#e4eaee] rounded-sm shadow-xl z-50 py-1 whitespace-nowrap"
    >
      <button
        onClick={onRename}
        className="w-full text-left px-4 py-2 text-[14px] text-[#666] hover:bg-[#eaf4fb] transition-colors"
      >
        Rename task
      </button>
      <button
        onClick={onToggleComplete}
        className="w-full text-left px-4 py-2 text-[14px] text-[#666] hover:bg-[#eaf4fb] transition-colors"
      >
        {isCompleted ? 'Mark as active' : 'Mark as done'}
      </button>
      {isCompleted && (
        <>
          <div className="h-[1px] bg-[#e4eaee] my-1" />
          <button
            onClick={onDelete}
            className="w-full text-left px-4 py-2 text-[14px] text-red-500 hover:bg-red-50 transition-colors"
          >
            Delete
          </button>
        </>
      )}
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
}: {
  members: { id: string; name: string; email: string; memberRole: string; billableRate?: number }[]
  users: { id: string; name: string }[]
  projectId: string
  onAssignMember: (projectId: string, userId: string, role?: string, hourlyRate?: number) => Promise<void>
  onUnassignMember: (projectId: string, userId: string) => Promise<void>
}) {
  const [visibility, setVisibility] = useState<'private' | 'public'>('private')
  const [showAddPanel, setShowAddPanel] = useState(false)
  const [addSearch, setAddSearch] = useState('')
  const [assigning, setAssigning] = useState<string | null>(null)
  const [removing, setRemoving] = useState<string | null>(null)

  const memberIds = new Set(members.map((m) => m.id))
  const availableUsers = users.filter(
    (u) => !memberIds.has(u.id) && u.name.toLowerCase().includes(addSearch.toLowerCase())
  )

  const handleAssign = async (userId: string) => {
    setAssigning(userId)
    try {
      await onAssignMember(projectId, userId)
    } catch (err) {
      console.error('Failed to assign member:', err)
    } finally {
      setAssigning(null)
    }
  }

  const handleUnassign = async (userId: string) => {
    setRemoving(userId)
    try {
      await onUnassignMember(projectId, userId)
    } catch (err) {
      console.error('Failed to unassign member:', err)
    } finally {
      setRemoving(null)
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
      <div className="px-6 py-3 border-b border-[#e4eaee]">
        <button
          onClick={() => setShowAddPanel(!showAddPanel)}
          className="flex items-center gap-1.5 text-[#03a9f4] text-[14px] font-medium hover:underline"
        >
          <Plus className="h-4 w-4" />
          Add members
        </button>

        {showAddPanel && (
          <div className="mt-3 border border-[#e4eaee] rounded-sm bg-[#fcfdfe] p-3 max-w-[320px]">
            <div className="relative mb-3">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#999]" />
              <input
                type="text"
                placeholder="Search users"
                value={addSearch}
                onChange={(e) => setAddSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-[5px] text-[14px] border border-[#c6d2d9] rounded-sm outline-none focus:border-[#03a9f4]"
                autoFocus
              />
            </div>
            <div className="max-h-[200px] overflow-y-auto">
              {availableUsers.length === 0 ? (
                <p className="text-[14px] text-[#999] py-2 text-center">No users available</p>
              ) : (
                availableUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleAssign(user.id)}
                    disabled={assigning === user.id}
                    className="flex items-center gap-2.5 w-full px-2 py-2 text-left hover:bg-[#eaf4fb] rounded-sm transition-colors disabled:opacity-50"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#e4eaee] flex items-center justify-center text-[14px] font-semibold text-[#666] uppercase shrink-0">
                      {user.name.charAt(0)}
                    </div>
                    <span className="text-[14px] text-[#666]">{user.name}</span>
                    {assigning === user.id && (
                      <div className="ml-auto w-3.5 h-3.5 border-2 border-[#03a9f4] border-t-transparent rounded-full animate-spin" />
                    )}
                  </button>
                ))
              )}
            </div>
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
                  onClick={() => handleUnassign(member.id)}
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
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// STATUS TAB
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