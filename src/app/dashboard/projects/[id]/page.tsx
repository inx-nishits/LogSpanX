'use client'

import { useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Clock, Users, CheckSquare, DollarSign, FolderOpen, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDataStore } from '@/lib/stores/data-store'
import Link from 'next/link'

const fmtDur = (s: number) => {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

const fmtDate = (d: Date) =>
  d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

const fmtTime = (d: Date) =>
  d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

export default function ProjectDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { projects, users, timeEntries, tasks, isInitialized } = useDataStore()

  const project = useMemo(
    () => projects.find((p) => p.id === id),
    [projects, id]
  )

  const projectTimeEntries = useMemo(
    () =>
      timeEntries
        .filter((e) => e.projectId === id)
        .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()),
    [timeEntries, id]
  )

  const projectTasks = useMemo(
    () => tasks.filter((t) => t.projectId === id),
    [tasks, id]
  )

  const totalTracked = useMemo(
    () => projectTimeEntries.reduce((acc, e) => acc + (e.duration || 0), 0),
    [projectTimeEntries]
  )

  const projectMembers = useMemo(() => {
    if (!project) return []
    return project.members
      .map((m) => {
        const user = users.find((u) => u.id === (typeof m === 'string' ? m : m.userId))
        return user ? { ...user, role: typeof m === 'string' ? 'member' : m.role } : null
      })
      .filter(Boolean) as (typeof users[0] & { role: string })[]
  }, [project, users])

  const lead = useMemo(() => {
    if (!project?.leadId) return null
    return users.find((u) => u.id === project.leadId) ?? null
  }, [project, users])

  if (!isInitialized) {
    return (
      <div className="min-h-full flex items-center justify-center bg-[#f2f6f8]">
        <div className="flex items-center gap-3 text-[#999]">
          <div className="w-5 h-5 border-2 border-[#03a9f4] border-t-transparent rounded-full animate-spin" />
          <span className="text-[15px]">Loading…</span>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center bg-[#f2f6f8] gap-4">
        <FolderOpen className="h-16 w-16 text-[#ccc]" />
        <p className="text-[17px] text-[#999]">Project not found</p>
        <Button onClick={() => router.push('/dashboard/projects')} variant="outline" className="text-[#666]">
          ← Back to Projects
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-full bg-[#f2f6f8]">
      {/* Header */}
      <div className="w-full px-6 pt-5 pb-4 flex items-center gap-4">
        <Link
          href="/dashboard/projects"
          className="text-[#999] hover:text-[#333] transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex items-center gap-3 flex-1">
          <div
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: project.color }}
          />
          <h1 className="text-xl text-[#333] font-semibold">{project.name}</h1>
          {project.archived && (
            <span className="text-[11px] font-bold uppercase tracking-widest bg-[#f5a623]/10 text-[#f5a623] px-2 py-0.5 rounded">
              Archived
            </span>
          )}
        </div>
      </div>

      <div className="w-full px-6 pb-20">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={<Clock className="h-5 w-5 text-[#03a9f4]" />}
            label="Total Tracked"
            value={fmtDur(totalTracked)}
          />
          <StatCard
            icon={<CheckSquare className="h-5 w-5 text-[#4caf50]" />}
            label="Tasks"
            value={`${projectTasks.filter((t) => t.completed).length}/${projectTasks.length}`}
            sub="completed"
          />
          <StatCard
            icon={<Users className="h-5 w-5 text-[#9c27b0]" />}
            label="Members"
            value={String(projectMembers.length)}
          />
          <StatCard
            icon={<DollarSign className="h-5 w-5 text-[#ff9800]" />}
            label="Billable"
            value={project.billable ? 'Yes' : 'No'}
          />
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column — Details + Members */}
          <div className="flex flex-col gap-6">
            {/* Project Details */}
            <div className="bg-white border border-[#e4eaee] rounded-md shadow-sm overflow-hidden">
              <div className="bg-[#f0f7fb] px-5 py-3 border-b border-[#d6e5ef]">
                <h2 className="text-[14px] font-bold text-[#5c7b91] uppercase tracking-widest">
                  Details
                </h2>
              </div>
              <div className="px-5 py-4 flex flex-col gap-3">
                <DetailRow label="Client" value={project.clientName || '—'} />
                <DetailRow
                  label="Project Lead"
                  value={lead?.name || project.leadName || '—'}
                />
                <DetailRow label="Color" value={
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border border-[#e4eaee]" style={{ backgroundColor: project.color }} />
                    <span>{project.color}</span>
                  </div>
                } />
                <DetailRow label="Created" value={fmtDate(project.createdAt)} />
              </div>
            </div>

            {/* Members */}
            <div className="bg-white border border-[#e4eaee] rounded-md shadow-sm overflow-hidden">
              <div className="bg-[#f0f7fb] px-5 py-3 border-b border-[#d6e5ef]">
                <h2 className="text-[14px] font-bold text-[#5c7b91] uppercase tracking-widest">
                  Members ({projectMembers.length})
                </h2>
              </div>
              {projectMembers.length === 0 ? (
                <div className="px-5 py-8 text-center text-[#999] text-[14px]">
                  No members assigned
                </div>
              ) : (
                <div className="divide-y divide-[#f1f4f7]">
                  {projectMembers.map((member) => (
                    <div key={member.id} className="flex items-center gap-3 px-5 py-3">
                      <div className="w-8 h-8 rounded-full bg-[#e4eaee] flex items-center justify-center text-[13px] font-semibold text-[#666] uppercase">
                        {member.name?.charAt(0) || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] text-[#333] truncate">{member.name}</p>
                        <p className="text-[12px] text-[#999] truncate">{member.email}</p>
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-widest text-[#999] bg-[#f2f6f8] px-2 py-0.5 rounded">
                        {member.role}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tasks */}
            <div className="bg-white border border-[#e4eaee] rounded-md shadow-sm overflow-hidden">
              <div className="bg-[#f0f7fb] px-5 py-3 border-b border-[#d6e5ef]">
                <h2 className="text-[14px] font-bold text-[#5c7b91] uppercase tracking-widest">
                  Tasks ({projectTasks.length})
                </h2>
              </div>
              {projectTasks.length === 0 ? (
                <div className="px-5 py-8 text-center text-[#999] text-[14px]">
                  No tasks yet
                </div>
              ) : (
                <div className="divide-y divide-[#f1f4f7]">
                  {projectTasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-3 px-5 py-3">
                      <div
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center ${task.completed
                            ? 'bg-[#4caf50] border-[#4caf50]'
                            : 'border-[#ccc]'
                          }`}
                      >
                        {task.completed && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                      <span
                        className={`text-[14px] ${task.completed ? 'text-[#999] line-through' : 'text-[#333]'
                          }`}
                      >
                        {task.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right column — Time Entries */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-[#e4eaee] rounded-md shadow-sm overflow-hidden">
              <div className="bg-[#f0f7fb] px-5 py-3 border-b border-[#d6e5ef] flex items-center justify-between">
                <h2 className="text-[14px] font-bold text-[#5c7b91] uppercase tracking-widest">
                  Time Entries ({projectTimeEntries.length})
                </h2>
                <span className="text-[13px] text-[#5c7b91] font-medium">
                  Total: {fmtDur(totalTracked)}
                </span>
              </div>
              {projectTimeEntries.length === 0 ? (
                <div className="px-5 py-16 text-center text-[#999] text-[14px]">
                  <Clock className="h-10 w-10 mx-auto mb-3 text-[#ddd]" />
                  No time entries for this project
                </div>
              ) : (
                <div className="divide-y divide-[#f1f4f7]">
                  {projectTimeEntries.map((entry) => {
                    const entryUser = users.find((u) => u.id === entry.userId)
                    return (
                      <div
                        key={entry.id}
                        className="flex items-center gap-4 px-5 py-3 hover:bg-[#fcfdfe] transition-colors"
                      >
                        {/* User avatar */}
                        <div className="w-7 h-7 rounded-full bg-[#e4eaee] flex items-center justify-center text-[12px] font-semibold text-[#666] uppercase shrink-0">
                          {entryUser?.name?.charAt(0) || <User className="h-3.5 w-3.5" />}
                        </div>
                        {/* Description */}
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] text-[#333] truncate">
                            {entry.description || '(no description)'}
                          </p>
                          <p className="text-[12px] text-[#999]">
                            {entryUser?.name || 'Unknown'} • {fmtDate(entry.startTime)}
                          </p>
                        </div>
                        {/* Time range */}
                        <div className="text-right shrink-0">
                          <p className="text-[14px] text-[#333] font-medium tabular-nums">
                            {fmtDur(entry.duration || 0)}
                          </p>
                          <p className="text-[12px] text-[#999]">
                            {fmtTime(entry.startTime)}
                            {entry.endTime ? ` – ${fmtTime(entry.endTime)}` : ''}
                          </p>
                        </div>
                        {/* Billable indicator */}
                        {entry.billable && (
                          <DollarSign className="h-4 w-4 text-[#4caf50] shrink-0" />
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Reusable sub-components ─────────────────────────────────────────── */

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub?: string
}) {
  return (
    <div className="bg-white border border-[#e4eaee] rounded-md shadow-sm px-5 py-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-lg bg-[#f2f6f8] flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-[12px] font-bold text-[#999] uppercase tracking-widest">{label}</p>
        <p className="text-[20px] font-semibold text-[#333] leading-tight">
          {value}
          {sub && <span className="text-[12px] text-[#999] font-normal ml-1">{sub}</span>}
        </p>
      </div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-[13px] text-[#999] font-medium">{label}</span>
      <span className="text-[14px] text-[#333]">{value}</span>
    </div>
  )
}