'use client'

import { useState, useMemo } from 'react'
import { Plus, Search, Folder, Briefcase } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useDataStore } from '@/lib/stores/data-store'
import { cn } from '@/lib/utils'

interface ProjectPickerProps {
  selectedProjectId?: string
  onSelect: (projectId: string) => void
  onClear: () => void
}

export function ProjectPicker({ selectedProjectId, onSelect, onClear }: ProjectPickerProps) {
  const { projects, clients } = useDataStore()
  const [search, setSearch] = useState('')

  const selectedProject = projects.find(p => p.id === selectedProjectId)
  
  const filteredProjects = useMemo(() => {
    return projects.filter(p => !p.archived && p.name.toLowerCase().includes(search.toLowerCase()))
  }, [projects, search])

  const groupedProjects = useMemo(() => {
    const groups: Record<string, typeof projects> = {}
    filteredProjects.forEach(p => {
      const clientName = p.clientId ? clients.find(c => c.id === p.clientId)?.name || 'No Client' : 'No Client'
      if (!groups[clientName]) groups[clientName] = []
      groups[clientName].push(p)
    })
    return groups
  }, [filteredProjects, clients])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={cn(
          "flex items-center space-x-2 text-sm transition-colors w-full text-left cursor-pointer",
          selectedProject ? "text-gray-900 group-hover:text-[#03a9f4]" : "text-[#03a9f4] hover:text-[#0288d1]"
        )}>
          {selectedProject ? (
            <div className="flex items-center space-x-2 min-w-0 w-full overflow-hidden">
               <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: selectedProject.color }} />
               <span className="truncate font-normal leading-normal block">{selectedProject.name}</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1">
              <Plus className="h-4 w-4 stroke-[1.2px]" />
              <span className="font-normal text-[13px]">Project</span>
            </div>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[300px] p-0 shadow-2xl bg-white border border-gray-100 rounded-sm mt-1 z-[100]">
        <div className="p-3 border-b border-gray-50 bg-gray-50/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" strokeWidth={1} />
            <input
              autoFocus
              placeholder="Find project or client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-sm focus:outline-none focus:border-[#03a9f4]"
            />
          </div>
        </div>

        <div className="max-h-[350px] overflow-y-auto py-1 scrollbar-hide">
          <button onClick={() => { onClear(); setSearch('') }} className="w-full text-left px-4 py-2 text-sm text-[#03a9f4] hover:bg-blue-50/50 font-normal cursor-pointer">
            NO PROJECT
          </button>

          {Object.entries(groupedProjects).map(([clientName, clientProjects]) => (
            <div key={clientName} className="mt-2">
              <div className="px-4 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/50">
                {clientName}
              </div>
              {clientProjects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => { onSelect(project.id); setSearch('') }}
                  className={cn("w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors cursor-pointer", selectedProjectId === project.id && "bg-blue-50/50")}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: project.color }} />
                    <span className={cn("text-sm truncate", selectedProjectId === project.id ? "text-[#03a9f4] font-medium" : "text-gray-700")}>
                      {project.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
