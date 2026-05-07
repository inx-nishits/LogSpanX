'use client'

import { useState, useMemo } from 'react'
import { Plus, Search, Star, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useDataStore } from '@/lib/stores/data-store'
import { useAuthStore } from '@/lib/stores/auth-store'
import { cn } from '@/lib/utils'
import { ProjectLeadModal } from './project-lead-modal'

interface ProjectPickerProps {
  selectedProjectId?: string
  selectedTaskId?: string
  onSelect: (projectId: string, taskId?: string) => void
  onClear: () => void
  customTrigger?: React.ReactNode
}

export function ProjectPicker({ selectedProjectId, selectedTaskId, onSelect, onClear, customTrigger }: ProjectPickerProps) {
  const { projects, users, tasks } = useDataStore()
  const { user: currentUser } = useAuthStore()
  const [search, setSearch] = useState('')
  const [expandedLeads, setExpandedLeads] = useState<string[]>(['user_2', 'no_lead'])
  const [expandedProjects, setExpandedProjects] = useState<string[]>(['project_2'])

  const [modalOpen, setModalOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [activeLead, setActiveLead] = useState({ id: '', name: '' })

  const selectedProject = projects.find(p => p.id === selectedProjectId)
  const selectedTask = tasks.find(t => t.id === selectedTaskId)

  // Team members only see projects they are assigned to (as member or lead)
  const isTeamMember = currentUser?.role === 'team_member'

  const visibleProjects = useMemo(() => {
    if (!isTeamMember || !currentUser) return projects
    return projects.filter(p =>
      p.leadId === currentUser.id ||
      p.members.some(m => m.userId === currentUser.id)
    )
  }, [projects, isTeamMember, currentUser])

  const filteredProjects = useMemo(() => {
    return visibleProjects.filter(p =>
      !p.archived &&
      (p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.leadId && users.find(u => u.id === p.leadId)?.name.toLowerCase().includes(search.toLowerCase())))
    )
  }, [visibleProjects, search, users])

  const groupedByLead = useMemo(() => {
    const groups: Record<string, typeof projects> = {}
    filteredProjects.forEach(p => {
      const leadId = p.leadId || 'no_lead'
      if (!groups[leadId]) groups[leadId] = []
      groups[leadId].push(p)
    })
    return groups
  }, [filteredProjects])

  const toggleLead = (id: string) => {
    setExpandedLeads(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const toggleProjectExpansion = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setExpandedProjects(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  return (
    <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
      <DropdownMenuTrigger asChild>
        {customTrigger ? (
          <div>{customTrigger}</div>
        ) : (
          <div role="button" className={cn(
            "flex items-center space-x-2 text-sm transition-colors w-full text-left cursor-pointer group",
            (selectedProject || selectedTask) ? "text-gray-900" : "text-[#03a9f4] hover:text-[#0288d1]"
          )}>
            {selectedProject ? (
              <div className="flex items-center space-x-2 min-w-0 w-full overflow-hidden">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: selectedProject.color }} />
                <span className="truncate font-normal leading-normal block">
                  {selectedProject.name}{selectedTask ? ` : ${selectedTask.name}` : ''}
                </span>
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                <Plus className="h-4 w-4 stroke-[1.2px]" />
                <span className="font-normal text-[13px]">Project</span>
              </div>
            )}
          </div>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[360px] p-0 shadow-2xl bg-white border border-gray-100 rounded-sm mt-1 z-[100] max-h-[85vh] flex flex-col">
        <div className="p-3 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-[15px] w-[15px] text-gray-400" strokeWidth={1} />
            <input
              autoFocus
              placeholder="Search Project or Project Lead"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-sm focus:outline-none focus:border-[#03a9f4] placeholder:text-gray-400"
            />
          </div>
        </div>

        <div className="overflow-y-auto py-1 scrollbar-hide flex-1">

          {/* No project — always visible at top */}
          <div
            onClick={() => { onClear(); setDropdownOpen(false) }}
            className={cn(
              'flex items-center px-4 py-2.5 cursor-pointer transition-colors border-b border-gray-100',
              !selectedProjectId ? 'text-[#03a9f4] font-medium bg-blue-50/30' : 'text-gray-500 hover:bg-gray-50'
            )}
          >
            <span className="text-[13px]">No Project</span>
          </div>

          {Object.entries(groupedByLead).map(([leadId, leadProjects]) => {
            const lead = users.find(u => u.id === leadId)
            const leadName = lead?.name || leadProjects[0]?.leadName || (leadId === 'no_lead' ? 'NO PROJECT LEAD' : 'NO PROJECT LEAD')
            const isLeadExpanded = expandedLeads.includes(leadId) || search.length > 0

            return (
              <div key={leadId} className="mt-1">
                <div
                  className="px-4 py-2 flex items-center justify-between group/lead cursor-pointer hover:bg-gray-50/80 transition-colors"
                  onClick={() => toggleLead(leadId)}
                >
                  <div className="flex items-center space-x-1">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest tabular-nums">
                      {leadName}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-400">
                    <span className="text-[11px] font-medium">{leadProjects.length} Projects</span>
                    {isLeadExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setActiveLead({ id: leadId, name: leadName })
                        setModalOpen(true)
                        setDropdownOpen(false)
                      }}
                      className="p-1 hover:bg-gray-100 rounded-sm transition-colors text-gray-400 hover:text-[#03a9f4]"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {isLeadExpanded && (
                  <div className="py-0.5">
                    {leadProjects.map((project) => {
                      // Team members only see tasks assigned to them
                      const projectTasks = tasks.filter(t => {
                        if (t.projectId !== project.id) return false
                        if (isTeamMember && currentUser && t.assignees?.length) {
                          return t.assignees.some(a => a.id === currentUser.id)
                        }
                        return true
                      })
                      const isProjectExpanded = expandedProjects.includes(project.id) || search.length > 0
                      const isSelected = selectedProjectId === project.id && !selectedTaskId

                      return (
                        <div key={project.id}>
                          <div
                            className={cn(
                              "w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors cursor-pointer group/project",
                              isSelected && "bg-blue-50/40"
                            )}
                            onClick={() => onSelect(project.id)}
                          >
                            <div className="flex items-center space-x-3 min-w-0 flex-1">
                              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: project.color }} />
                              <span className={cn(
                                "text-[13px] truncate flex-1",
                                isSelected ? "text-[#03a9f4] font-medium" : "text-gray-700"
                              )}>
                                {project.name}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                              <div
                                className="flex items-center space-x-1 text-gray-400 hover:text-gray-600 transition-colors px-1 whitespace-nowrap"
                                onClick={(e) => projectTasks.length > 0 && toggleProjectExpansion(project.id, e)}
                              >
                                <span className="text-[11px] font-medium tabular-nums">{projectTasks.length} {projectTasks.length === 1 ? 'Task' : 'Tasks'}</span>
                                {projectTasks.length > 0 && (
                                  isProjectExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                                )}
                              </div>
                              <Star className={cn(
                                "h-3.5 w-3.5 transition-colors",
                                isSelected ? "text-[#03a9f4] fill-[#03a9f4]" : "text-gray-300 hover:text-gray-400"
                              )} />
                            </div>
                          </div>

                          {isProjectExpanded && projectTasks.length > 0 && (
                            <div className="bg-gray-50/30">
                              {projectTasks.map((task) => {
                                const isTaskSelected = selectedTaskId === task.id
                                return (
                                  <div
                                    key={task.id}
                                    className={cn(
                                      "w-full flex items-center justify-between pl-9 pr-4 py-2 hover:bg-gray-100/50 transition-colors cursor-pointer group/task",
                                      isTaskSelected && "bg-blue-50/60"
                                    )}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      onSelect(project.id, task.id)
                                    }}
                                  >
                                    <span className={cn(
                                      "text-[12px]",
                                      isTaskSelected ? "text-[#03a9f4] font-medium" : "text-gray-500"
                                    )}>
                                      {task.name}
                                    </span>
                                    <Star className={cn(
                                      "h-3 w-3 transition-colors",
                                      isTaskSelected ? "text-[#03a9f4] fill-[#03a9f4]" : "text-gray-300 hover:text-gray-400"
                                    )} />
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </DropdownMenuContent>

      <ProjectLeadModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        leadId={activeLead.id}
        leadName={activeLead.name}
        onSelect={onSelect}
        selectedProjectId={selectedProjectId}
        selectedTaskId={selectedTaskId}
      />
    </DropdownMenu>
  )
}
