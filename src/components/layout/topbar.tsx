'use client'

import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Bell,
  User,
  LogOut,
  Menu
} from 'lucide-react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useSidebarStore } from '@/lib/stores/sidebar-store'
import { useDataStore } from '@/lib/stores/data-store'

export function Topbar() {
  const { user, logout } = useAuthStore()
  const { toggleMobile } = useSidebarStore()
  const resetData = useDataStore((state) => state.reset)
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    resetData()
    router.push('/login')
  }

  return (
    <header className="flex items-center justify-between px-4 h-[50px] bg-white border-b border-gray-200 z-[40] flex-shrink-0">
      {/* Left side: Mobile Toggle & App Name */}
      <div className="flex items-center space-x-3">
        <button
          onClick={toggleMobile}
          className="p-1 hover:bg-gray-50 rounded md:hidden text-gray-400 group cursor-pointer"
        >
          <Menu className="h-5 w-5 stroke-[1.5px]" />
        </button>
        <span className="text-sm font-medium text-gray-700 tracking-tight hidden sm:inline">
          Trackify
        </span>
      </div>

      {/* Right side: App Actions & User */}
      <div className="flex items-center space-x-1 h-full">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600 transition-colors relative cursor-pointer">
              <Bell className="h-[18px] w-[18px] stroke-[1.2px]" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[320px] shadow-2xl bg-white border border-gray-100 rounded-sm mt-1 p-0">
            <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
              <p className="text-[11px] font-bold text-gray-900 uppercase tracking-widest">Notifications</p>
              <button className="text-[10px] text-[#03a9f4] hover:underline cursor-pointer">Mark all as read</button>
            </div>
            <div className="max-h-[300px] overflow-y-auto scrollbar-hide py-8 flex flex-col items-center justify-center">
              <p className="text-xs text-gray-400 font-medium italic">No new notifications</p>
            </div>
            <div className="p-2 border-t border-gray-50 text-center bg-gray-50/30">
              <button className="text-[11px] text-[#03a9f4] font-bold uppercase tracking-wider hover:underline w-full py-1 cursor-pointer">View all</button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-4 w-[1px] bg-gray-200 mx-2" />

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded group ml-1 transition-colors cursor-pointer">
              <div className="h-8 w-8 bg-pink-500 rounded-sm flex items-center justify-center shadow-sm">
                <span className="text-[11px] font-black text-white uppercase italic tracking-tighter">
                  {user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2) : 'NS'}
                </span>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 shadow-2xl bg-white border border-gray-100 rounded-sm mt-1 p-0 overflow-hidden">
            <div className="px-4 py-4 border-b border-gray-50 flex items-center space-x-3 bg-gray-50/50">
              <div className="h-10 w-10 bg-pink-500 rounded-full flex items-center justify-center shadow-inner flex-shrink-0">
                <span className="text-base font-black text-white uppercase italic tracking-tighter">
                  {user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2) : 'NS'}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{user?.name || 'Nishit Sangani'}</p>
                <p className="text-[11px] text-gray-500 truncate">{user?.email || 'nishit@inheritx.com'}</p>
              </div>
            </div>
            <DropdownMenuItem onClick={() => router.push('/dashboard/profile')} className="py-3 px-4 cursor-pointer flex items-center text-gray-700 text-sm">
              <User className="mr-3 h-4 w-4 text-gray-400" />
              My Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="text-red-500 font-bold uppercase text-[11px] px-4 py-3 hover:bg-red-50 border-t border-gray-50 cursor-pointer flex items-center">
              <LogOut className="mr-3 h-4 w-4 text-red-500" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
