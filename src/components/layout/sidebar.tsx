'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  LayoutGrid,
  Clock,
  Calendar,
  Users,
  Briefcase,
  UserCircle,
  Tag,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ClipboardList,
  Grid3X3,
  CalendarRange,
  Receipt,
  TimerOff,
  Activity,
  CheckSquare,
  FileText,
  Menu,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSidebarStore } from '@/lib/stores/sidebar-store'
import { useAuthStore } from '@/lib/stores/auth-store'
import { User } from '@/lib/types'

const REPORTS_FLYOUT = [
  {
    section: 'Time',
    items: [
      { label: 'Summary', href: '/dashboard/reports/summary' },
      { label: 'Detailed', href: '/dashboard/reports/detailed' },
      { label: 'Weekly', href: '/dashboard/reports/weekly' },
      { label: 'Shared', href: '/dashboard/reports/shared' },
    ],
  },
  {
    section: 'Team',
    items: [
      { label: 'Attendance', href: '/dashboard/reports/attendance' },
      { label: 'Assignments', href: '/dashboard/reports/assignments' },
    ],
  },
  {
    section: 'Expense',
    items: [
      { label: 'Detailed', href: '/dashboard/reports/expense' },
    ],
  },
]

function ReportsFlyout({ visible, top }: { visible: boolean; top: number }) {
  const pathname = usePathname()
  if (!visible) return null
  return (
    <div
      className="fixed z-[200] bg-white border border-[#e4eaee] shadow-xl rounded-sm py-2 w-[180px]"
      style={{ left: '208px', top }}
    >
      {REPORTS_FLYOUT.map(group => (
        <div key={group.section}>
          <div className="px-4 pt-3 pb-1 text-[11px] font-bold text-[#999] uppercase tracking-wider">
            {group.section}
          </div>
          {group.items.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'block px-4 py-2 text-[14px] transition-colors hover:bg-[#f0f7fb] hover:text-[#03a9f4]',
                pathname === item.href ? 'text-[#03a9f4] bg-[#f0f7fb]' : 'text-[#333]'
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      ))}
    </div>
  )
}

interface MenuItem {
  label: string
  icon: any
  href: string
  section?: string
  expandable?: boolean
}

const getMenuItems = (role: User['role']) => {
  const dashHref = role === 'owner' ? '/dashboard/pm' : role === 'admin' ? '/dashboard/tl' : '/dashboard/member'

  const topItems: MenuItem[] = [
    { label: 'Time Tracker', icon: Clock, href: '/dashboard/tracker' },
    { label: 'Calendar', icon: Calendar, href: '/dashboard/calendar' },
  ]

  const analyzeItems: MenuItem[] = [
    { label: 'Dashboard', icon: LayoutGrid, href: dashHref, section: 'Analyze' },
    { label: 'Reports', icon: BarChart3, href: '/dashboard/reports', expandable: true },
  ]

  const manageItems: MenuItem[] = [
    { label: 'Projects', icon: Briefcase, href: '/dashboard/projects', section: 'Manage' },
    { label: 'Team', icon: Users, href: '/dashboard/team' },
    { label: 'Project Lead', icon: UserCircle, href: '/dashboard/project-lead' },
    { label: 'Tags', icon: Tag, href: '/dashboard/tags' },
  ]

  const extraItems: MenuItem[] = [
    { label: 'Timesheet', icon: ClipboardList, href: '/dashboard/timesheet' },
    { label: 'Kiosks', icon: Grid3X3, href: '/dashboard/kiosks' },
    { label: 'Schedule', icon: CalendarRange, href: '/dashboard/schedule' },
    { label: 'Expenses', icon: Receipt, href: '/dashboard/expenses' },
    { label: 'Time Off', icon: TimerOff, href: '/dashboard/time-off' },
    { label: 'Activity', icon: Activity, href: '/dashboard/activity', expandable: true },
    { label: 'Approvals', icon: CheckSquare, href: '/dashboard/approvals' },
    { label: 'Invoices', icon: FileText, href: '/dashboard/invoices' },
  ]

  // Role-based filtering
  if (role === 'member' || role === 'viewer') {
    return {
      topItems,
      analyzeItems,
      manageItems: manageItems.filter(i => !['Team', 'Project Lead'].includes(i.label)),
      extraItems,
    }
  }

  return { topItems, analyzeItems, manageItems, extraItems }
}

export function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuthStore()
  const { isCollapsed, isMobileOpen, toggle, toggleMobile, setMobileOpen } = useSidebarStore()
  const [showMore, setShowMore] = useState(false)
  const [reportsHovered, setReportsHovered] = useState(false)
  const [flyoutTop, setFlyoutTop] = useState(0)
  const reportsRef = useRef<HTMLDivElement>(null)

  const { topItems, analyzeItems, manageItems, extraItems } = getMenuItems(user?.role || 'member')

  const renderItem = (item: MenuItem) => {
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
    const isReports = item.label === 'Reports'

    if (isReports) {
      return (
        <div
          key={item.href}
          ref={reportsRef}
          onMouseEnter={() => {
            if (reportsRef.current) {
              setFlyoutTop(reportsRef.current.getBoundingClientRect().top)
            }
            setReportsHovered(true)
          }}
          onMouseLeave={() => setReportsHovered(false)}
          className="relative"
        >
          <Link
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              'flex items-center px-5 py-2 relative group',
              isActive
                ? 'bg-[#f2f9ff] text-[#03a9f4] border-l-[3px] border-[#03a9f4]'
                : 'text-[#555] hover:bg-[#f8fafb] hover:text-[#333] border-l-[3px] border-transparent',
              isCollapsed && 'md:px-0 md:justify-center md:border-l-0'
            )}
          >
            <item.icon className={cn(
              'h-[16px] w-[16px] stroke-[1.5px]',
              (!isCollapsed || isMobileOpen) && 'mr-3.5',
              isActive ? 'text-[#03a9f4]' : 'text-[#8a9bae] group-hover:text-[#5a6b7b]'
            )} />
            {(!isCollapsed || isMobileOpen) && (
              <span className={cn('text-[14px] font-normal whitespace-nowrap flex-1', isActive && 'text-[#03a9f4] font-medium')}>
                {item.label}
              </span>
            )}
            {(!isCollapsed || isMobileOpen) && (
              <ChevronRight className="h-3 w-3 text-[#8a9bae]" />
            )}
          </Link>
          <ReportsFlyout visible={reportsHovered} top={flyoutTop} />
        </div>
      )
    }

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => setMobileOpen(false)}
        className={cn(
          "flex items-center px-5 py-2 relative group",
          isActive
            ? "bg-[#f2f9ff] text-[#03a9f4] border-l-[3px] border-[#03a9f4]"
            : "text-[#555] hover:bg-[#f8fafb] hover:text-[#333] border-l-[3px] border-transparent",
          isCollapsed && "md:px-0 md:justify-center md:border-l-0"
        )}
      >
        {isCollapsed && isActive && (
          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#03a9f4] hidden md:block" />
        )}

        <item.icon className={cn(
          "h-[16px] w-[16px] stroke-[1.5px]",
          (!isCollapsed || isMobileOpen) && "mr-3.5",
          isActive ? "text-[#03a9f4]" : "text-[#8a9bae] group-hover:text-[#5a6b7b]"
        )} />

        {(!isCollapsed || isMobileOpen) && (
          <span className={cn(
            "text-[14px] font-normal whitespace-nowrap",
            isActive ? "text-[#03a9f4] font-medium" : ""
          )}>
            {item.label}
          </span>
        )}

        {item.expandable && item.label !== 'Reports' && (!isCollapsed || isMobileOpen) && (
          <ChevronDown className="h-3 w-3 ml-auto text-[#8a9bae]" />
        )}

        {/* Collapsed Tooltip */}
        {isCollapsed && (
          <div className="fixed left-[58px] px-2 py-0.5 bg-gray-900 text-white text-[10px] font-bold rounded-sm shadow-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-[100] translate-x-1 group-hover:translate-x-0 hidden md:flex items-center h-6 mt-[7px]">
            <div className="absolute -left-[3px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-gray-900 rotate-45" />
            {item.label}
          </div>
        )}
      </Link>
    )
  }

  const renderSection = (label: string) => {
    if (isCollapsed) return null
    return (
      <div className="px-5 pt-5 pb-1.5 text-[11px] font-bold text-[#999] uppercase tracking-wider whitespace-nowrap">
        {label}
      </div>
    )
  }

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
        "fixed md:static inset-y-0 left-0 w-52 md:translate-x-0 transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none",
        isMobileOpen ? "translate-x-0" : "-translate-x-full",
        isCollapsed ? "md:w-[60px]" : "md:w-52"
      )}>
        {/* Sidebar Header */}
        <div className="h-12 flex items-center px-4 border-b border-[#e4eaee] flex-shrink-0 bg-white z-10">
          <div className="flex items-center justify-between w-full min-w-0">
            <div className="flex items-center min-w-0">
              <button onClick={toggle} className="p-1 hover:bg-gray-50 rounded group transition-colors flex-shrink-0 cursor-pointer hidden md:block">
                <Menu className="h-[16px] w-[16px] text-[#8a9bae] group-hover:text-[#5a6b7b] stroke-[1.5px]" />
              </button>

              {!isCollapsed && (
                <div className="md:ml-2.5 flex items-center min-w-0">
                  <span className="text-lg font-black text-[#333] tracking-tighter">LogSpan<span className="text-[#03a9f4]">X</span></span>
                </div>
              )}
            </div>

            <button onClick={toggleMobile} className="p-1 hover:bg-gray-50 rounded text-[#8a9bae] md:hidden">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide py-1">
          {/* Top items (no section label) */}
          {topItems.map(renderItem)}

          {/* Analyze section */}
          {renderSection('Analyze')}
          {analyzeItems.map(renderItem)}

          {/* Manage section */}
          {renderSection('Manage')}
          {manageItems.map(renderItem)}

          {/* Show More / Show Less toggle */}
          {(!isCollapsed || isMobileOpen) && (
            <button
              onClick={() => setShowMore(!showMore)}
              className="flex items-center px-5 py-2 w-full text-[13px] font-normal text-[#999] hover:text-[#555] transition-colors cursor-pointer"
            >
              {showMore ? (
                <>
                  <ChevronUp className="h-3 w-3 mr-2.5" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3 mr-2.5" />
                  Show More
                </>
              )}
            </button>
          )}

          {/* Extra items (shown when expanded) */}
          {showMore && extraItems.map(renderItem)}
        </div>
      </aside>
    </>
  )
}
