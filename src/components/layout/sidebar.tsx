'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Clock,
  Calendar,
  LayoutGrid,
  PieChart,
  Users,
  Briefcase,
  Menu,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSidebarStore } from '@/lib/stores/sidebar-store'

const menuItems = [
  { label: 'Time Tracker', icon: Clock, href: '/dashboard/tracker' },
  { label: 'Calendar', icon: Calendar, href: '/dashboard/calendar' },
  { label: 'Dashboard', icon: LayoutGrid, href: '/dashboard', section: 'Analyze' },
  { label: 'Reports', icon: PieChart, href: '/dashboard/reports' },
  { label: 'Projects', icon: Briefcase, href: '/dashboard/projects', section: 'Manage' },
  { label: 'Team', icon: Users, href: '/dashboard/team' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { isCollapsed, isMobileOpen, toggle, toggleMobile, setMobileOpen } = useSidebarStore()

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[100] md:hidden transition-opacity border-none animate-in fade-in" 
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={cn(
        "bg-white border-r border-[#e4eaee] flex flex-col h-full flex-shrink-0 transition-all duration-300 z-[101]",
        // Mobile: Fixed, slide-in from left
        "fixed md:static inset-y-0 left-0 w-64 md:translate-x-0 transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none",
        isMobileOpen ? "translate-x-0" : "-translate-x-full",
        // Desktop: Relative, width changes based on collapse
        isCollapsed ? "md:w-[60px]" : "md:w-52"
      )}>
        {/* Sidebar Header */}
        <div className="h-12 flex items-center px-4 border-b border-gray-200 flex-shrink-0 bg-white z-10">
          <div className="flex items-center justify-between w-full min-w-0">
            <div className="flex items-center min-w-0">
              <button onClick={toggle} className="p-1 hover:bg-gray-50 rounded group transition-colors flex-shrink-0 cursor-pointer hidden md:block">
                <Menu className="h-[18px] w-[18px] text-gray-400 group-hover:text-gray-600 stroke-[1.2px]" />
              </button>
              
              {!isCollapsed && (
                <div className="md:ml-3 flex items-center min-w-0">
                  <span className="text-xl font-black text-gray-900 tracking-tighter">LogSpan<span className="text-[#03a9f4]">X</span></span>
                </div>
              )}
            </div>

            {/* Mobile close button */}
            <button onClick={toggleMobile} className="p-1 hover:bg-gray-50 rounded text-gray-400 md:hidden">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide py-2 pt-0">
          {menuItems.map((item, index) => {
            const isActive = pathname === item.href
            const showSection = item.section && (index === 0 || menuItems[index - 1]?.section !== item.section)

            return (
              <div key={item.href}>
                {showSection && !isCollapsed && (
                  <div className="px-4 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-2 whitespace-nowrap">
                    {item.section}
                  </div>
                )}

                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center px-5 py-2.5 relative group",
                    isActive
                      ? "bg-[#f2f9ff] text-[#03a9f4] border-l-4 border-[#03a9f4]"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent",
                    isCollapsed && "md:px-0 md:justify-center md:border-l-0"
                  )}
                >
                  {isCollapsed && isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#03a9f4] hidden md:block" />
                  )}

                  <item.icon className={cn(
                    "h-[18px] w-[18px] stroke-[1.2px]",
                    (!isCollapsed || isMobileOpen) && "mr-4",
                    isActive ? "text-[#03a9f4]" : "text-gray-500 group-hover:text-gray-800"
                  )} />

                  {(!isCollapsed || isMobileOpen) && (
                    <span className={cn(
                      "text-[12px] font-bold uppercase tracking-wider whitespace-nowrap",
                      isActive ? "text-[#03a9f4]" : ""
                    )}>
                      {item.label}
                    </span>
                  )}

                  {/* Collapsed Tooltip (Desktop Only) */}
                  {isCollapsed && (
                    <div className="fixed left-[58px] px-2 py-0.5 bg-gray-900 text-white text-[10px] font-bold rounded-sm shadow-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-[100] translate-x-1 group-hover:translate-x-0 hidden md:flex items-center h-6 mt-[7px]">
                      <div className="absolute -left-[3px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-gray-900 rotate-45" />
                      {item.label}
                    </div>
                  )}
                </Link>
              </div>
            )
          })}
        </div>
      </aside>
    </>
  )
}
