'use client'

import { useState, useMemo } from 'react'
import { Search, X, Star, ChevronDown, ChevronUp } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useDataStore } from '@/lib/stores/data-store'
import { cn } from '@/lib/utils'

interface ProjectLeadModalProps {
  isOpen: boolean
  onClose: () => void
  leadId: string
  leadName: string
  onSelect: (projectId: string, taskId?: string) => void
  selectedProjectId?: string
  selectedTaskId?: string
}

export function ProjectLeadModal({ 
  isOpen, 
  onClose, 
  leadId, 
  leadName, 
  onSelect,
  selectedProjectId,
  selectedTaskId
}: ProjectLeadModalProps) {
  const { projects, tasks } = useDataStore()
  const [search, setSearch] = useState('')
  const [expandedProjects, setExpandedProjects] = useState<string[]>(['project_3'])

  const leadProjects = useMemo(() => {
    return projects.filter(p => 
      !p.archived && 
      (p.leadId === (leadId === 'no_lead' ? undefined : leadId)) &&
      (p.name.toLowerCase().includes(search.toLowerCase()))
    )
  }, [projects, leadId, search])

  const toggleProjectExpansion = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setExpandedProjects(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[90vw] p-0 gap-0 bg-white border-none shadow-2xl rounded-sm overflow-hidden flex flex-col max-h-[90vh]">
        <DialogHeader className="px-6 py-5 border-b border-gray-100 flex flex-row items-center justify-between">
          <DialogTitle className="text-2xl font-normal text-gray-400 tracking-tight">
            {leadName}
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 pb-2">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" strokeWidth={1} />
            <input
              autoFocus
              placeholder="Search Project or Project Lead"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 text-base bg-white border border-gray-200 rounded-sm focus:outline-none focus:border-[#03a9f4] placeholder:text-gray-400 shadow-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          {leadProjects.map((project) => {
            const projectTasks = tasks.filter(t => t.projectId === project.id)
            const isProjectExpanded = expandedProjects.includes(project.id) || search.length > 0
            const isSelected = selectedProjectId === project.id && !selectedTaskId

            return (
              <div key={project.id} className="mb-0.5">
                <div 
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors cursor-pointer group",
                    isSelected && "bg-blue-50/40"
                  )}
                  onClick={() => {
                    onSelect(project.id)
                    onClose()
                  }}
                >
                  <div className="flex items-center space-x-4 min-w-0 flex-1">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: project.color }} />
                    <span className={cn(
                      "text-[15px] truncate flex-1",
                      isSelected ? "text-[#03a9f4] font-medium" : "text-gray-600"
                    )}>
                      {project.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-6 flex-shrink-0 ml-4">
                    <div 
                      className="flex items-center space-x-2 text-gray-400 hover:text-gray-600 transition-colors px-1 whitespace-nowrap"
                      onClick={(e) => projectTasks.length > 0 && toggleProjectExpansion(project.id, e)}
                    >
                      <span className="text-xs font-medium tabular-nums">{projectTasks.length} {projectTasks.length === 1 ? 'Task' : 'Tasks'}</span>
                      {projectTasks.length > 0 && (
                        isProjectExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                    <Star className={cn(
                      "h-5 w-5 transition-colors",
                      isSelected ? "text-[#03a9f4] fill-[#03a9f4]" : "text-gray-200 hover:text-gray-300"
                    )} />
                  </div>
                </div>

                {isProjectExpanded && projectTasks.length > 0 && (
                  <div className="bg-gray-50/40 py-1">
                    {projectTasks.map((task) => {
                      const isTaskSelected = selectedTaskId === task.id
                      return (
                        <div 
                          key={task.id}
                          className={cn(
                            "w-full flex items-center justify-between pl-12 pr-6 py-3 hover:bg-gray-100/50 transition-colors cursor-pointer group/task",
                            isTaskSelected && "bg-blue-50/60"
                          )}
                          onClick={(e) => {
                            e.stopPropagation()
                            onSelect(project.id, task.id)
                            onClose()
                          }}
                        >
                          <span className={cn(
                            "text-[14px]",
                            isTaskSelected ? "text-[#03a9f4] font-medium" : "text-gray-400"
                          )}>
                            {task.name}
                          </span>
                          <Star className={cn(
                            "h-4 w-4 transition-colors",
                            isTaskSelected ? "text-[#03a9f4] fill-[#03a9f4]" : "text-gray-200 hover:text-gray-300"
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
      </DialogContent>
    </Dialog>
  )
}
