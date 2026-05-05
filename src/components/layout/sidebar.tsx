'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3, LayoutGrid, Clock, Calendar, Users, Briefcase,
  UserCircle, Tag, ChevronRight, Menu, X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSidebarStore } from '@/lib/stores/sidebar-store'
import { useAuthStore } from '@/lib/stores/auth-store'
import { User } from '@/lib/types'

/* ── Reports flyout ─────────────────────────────────────────── */
const REPORTS_FLYOUT = [
  { section: 'Time', items: [
    { label: 'Summary',  href: '/dashboard/reports/summary'  },
    { label: 'Detailed', href: '/dashboard/reports/detailed' },
    { label: 'Weekly',   href: '/dashboard/reports/weekly'   },
    { label: 'Shared',   href: '/dashboard/reports/shared'   },
  ]},
  { section: 'Team', items: [
    { label: 'Attendance',  href: '/dashboard/reports/attendance'  },
    { label: 'Assignments', href: '/dashboard/reports/assignments' },
  ]},
  { section: 'Expense', items: [
    { label: 'Detailed', href: '/dashboard/reports/expense' },
  ]},
]

function ReportsFlyout({ visible, top }: { visible: boolean; top: number }) {
  const pathname = usePathname()
  if (!visible) return null
  return (
    <div
      className="fixed z-[200] bg-white border border-[#ddd] shadow-md rounded py-1 w-[176px]"
      style={{ left: 200, top }}
    >
      {REPORTS_FLYOUT.map(g => (
        <div key={g.section}>
          <p className="px-4 pt-3 pb-1 text-[11px] font-semibold text-[#aaa] uppercase tracking-wider">
            {g.section}
          </p>
          {g.items.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'block px-4 py-[9px] text-[15px] uppercase tracking-wide hover:bg-[#f0f0f0]',
                pathname.startsWith(item.href) ? 'bg-[#f0f0f0] text-[#333]' : 'text-[#555]'
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

/* ── Menu data ──────────────────────────────────────────────── */
interface MenuItem { label: string; icon: React.ElementType; href: string; chevron?: boolean }

const getMenuItems = (role: User['role']) => {
  const dashHref = role === 'owner' ? '/dashboard/pm' : role === 'admin' ? '/dashboard/tl' : '/dashboard/member'

  const topItems: MenuItem[] = [
    { label: 'Time Tracker', icon: Clock,    href: '/dashboard/tracker'  },
    { label: 'Calendar',     icon: Calendar, href: '/dashboard/calendar' },
  ]
  const analyzeItems: MenuItem[] = [
    { label: 'Dashboard', icon: LayoutGrid, href: dashHref },
    { label: 'Reports',   icon: BarChart3,  href: '/dashboard/reports', chevron: true },
  ]
  const manageItems: MenuItem[] = [
    { label: 'Projects',     icon: Briefcase,  href: '/dashboard/projects'     },
    { label: 'Team',         icon: Users,      href: '/dashboard/team'         },
    { label: 'Project Lead', icon: UserCircle, href: '/dashboard/project-lead' },
    { label: 'Tags',         icon: Tag,        href: '/dashboard/tags'         },
  ]

  const filteredManage = (role === 'admin' || role === 'member')
    ? manageItems.filter(i => !['Tags', 'Project Lead'].includes(i.label))
    : manageItems

  return { topItems, analyzeItems, manageItems: filteredManage }
}

/* ── section label ── */
const Section = ({ label, col }: { label: string; col: boolean }) =>
  col ? null : (
    <p className="px-[16px] pt-[18px] pb-[7px] text-[11px] font-semibold text-[#aaa] uppercase tracking-widest">
      {label}
    </p>
  )

/* ── single nav row ── */
const NavRow = ({
  item,
  pathname,
  col,
  reportsRef,
  setFlyoutTop,
  setReportsOpen,
  reportsOpen,
  flyoutTop,
  setMobileOpen,
}: {
  item: MenuItem
  pathname: string
  col: boolean
  reportsRef: React.RefObject<HTMLDivElement | null>
  setFlyoutTop: (top: number) => void
  setReportsOpen: (open: boolean) => void
  reportsOpen: boolean
  flyoutTop: number
  setMobileOpen: (open: boolean) => void
}) => {
  const active = pathname === item.href || pathname.startsWith(item.href + '/')
  const isRep = item.label === 'Reports'

  const inner = (
    <>
      <item.icon
        className={cn('flex-shrink-0 h-[18px] w-[18px] stroke-[1.5]', active ? 'text-[#555]' : 'text-[#888]')}
      />
      {!col && (
        <span className="flex-1 text-[15px] uppercase tracking-wide text-[#333] leading-none whitespace-nowrap">
          {item.label}
        </span>
      )}
      {!col && item.chevron && (
        <ChevronRight className="flex-shrink-0 h-[14px] w-[14px] text-[#bbb]" />
      )}
    </>
  )

  const cls = cn(
    'flex items-center w-full gap-[13px] px-[16px] py-[13px] transition-colors duration-100',
    active ? 'bg-[#ebebeb]' : 'bg-white hover:bg-[#f5f5f5]',
    col && 'justify-center px-0'
  )

  if (isRep) return (
    <div
      ref={reportsRef}
      onMouseEnter={() => {
        if (reportsRef.current) setFlyoutTop(reportsRef.current.getBoundingClientRect().top)
        setReportsOpen(true)
      }}
      onMouseLeave={() => setReportsOpen(false)}
    >
      <Link href={item.href} onClick={() => setMobileOpen(false)} className={cls}>{inner}</Link>
      <ReportsFlyout visible={reportsOpen} top={flyoutTop} />
    </div>
  )

  return (
    <Link href={item.href} onClick={() => setMobileOpen(false)} className={cls}>
      {inner}
    </Link>
  )
}

/* ── Sidebar ────────────────────────────────────────────────── */
export function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuthStore()
  const { isCollapsed, isMobileOpen, toggle, toggleMobile, setMobileOpen } = useSidebarStore()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showMore, setShowMore] = useState(false)
  const [reportsOpen, setReportsOpen] = useState(false)
  const [flyoutTop, setFlyoutTop] = useState(0)
  const reportsRef = useRef<HTMLDivElement>(null)

  const { topItems, analyzeItems, manageItems } = getMenuItems(user?.role || 'member')
  const col = isCollapsed && !isMobileOpen // true when desktop-collapsed

  return (
    <>
      {/* mobile overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-[100] md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={cn(
        'relative bg-white border-r border-[#e0e0e0] flex flex-col h-full flex-shrink-0 z-[101]',
        'fixed md:static inset-y-0 left-0 transition-all duration-200 ease-in-out shadow-xl md:shadow-none',
        isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        col ? 'md:w-[52px]' : 'md:w-[200px]',
        'w-[200px]'
      )}>

        {/* ── Header ── */}
        <div className="h-[50px] flex items-center px-[14px] border-b border-[#e0e0e0] flex-shrink-0 gap-3">
          <button
            onClick={toggle}
            className="hidden md:flex items-center justify-center text-[#999] hover:text-[#555] transition-colors flex-shrink-0"
          >
            <Menu className="h-[18px] w-[18px] stroke-[1.5]" />
          </button>
          {!col && (
            <span className="text-[22px] font-black text-[#333] tracking-tight leading-none ml-2">
              <Image src="/Trackify.svg" alt="Trackify" width={110} height={28} className="object-contain w-auto" />
            </span>
          )}
          <button onClick={toggleMobile} className="md:hidden ml-auto text-[#999] hover:text-[#555]">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Nav ── */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden">
          {topItems.map((i) => (
            <NavRow
              key={i.href}
              item={i}
              pathname={pathname}
              col={col}
              reportsRef={reportsRef}
              setFlyoutTop={setFlyoutTop}
              setReportsOpen={setReportsOpen}
              reportsOpen={reportsOpen}
              flyoutTop={flyoutTop}
              setMobileOpen={setMobileOpen}
            />
          ))}

          <Section label="Analyze" col={col} />
          {analyzeItems.map((i) => (
            <NavRow
              key={i.href}
              item={i}
              pathname={pathname}
              col={col}
              reportsRef={reportsRef}
              setFlyoutTop={setFlyoutTop}
              setReportsOpen={setReportsOpen}
              reportsOpen={reportsOpen}
              flyoutTop={flyoutTop}
              setMobileOpen={setMobileOpen}
            />
          ))}

          <Section label="Manage" col={col} />
          {manageItems.map((i) => (
            <NavRow
              key={i.href}
              item={i}
              pathname={pathname}
              col={col}
              reportsRef={reportsRef}
              setFlyoutTop={setFlyoutTop}
              setReportsOpen={setReportsOpen}
              reportsOpen={reportsOpen}
              flyoutTop={flyoutTop}
              setMobileOpen={setMobileOpen}
            />
          ))}
        </nav>

        {/* ── Clockify «» collapse button ── */}
        <button
          onClick={toggle}
          className="hidden md:flex items-center justify-center absolute -right-[13px] top-1/2 -translate-y-1/2 w-[26px] h-[26px] rounded-full bg-white border border-[#ddd] shadow-sm hover:bg-[#f5f5f5] transition-colors z-10 text-[#999]"
          title={col ? 'Expand' : 'Collapse'}
        >
          {col
            ? <span className="text-[11px] font-bold leading-none">{'>>'}</span>
            : <span className="text-[11px] font-bold leading-none">{'<<'}</span>}
        </button>

      </aside>
    </>
  )
}
