'use client'

import { useAuthStore } from '@/lib/stores/auth-store'
import { TimerBar } from '@/components/tracker/timer-bar'
import { DashboardView } from '@/components/dashboard/dashboard-view'

export default function MemberDashboard() {
    const { user } = useAuthStore()

    if (!user) return null

    return (
        <div className="flex flex-col h-full bg-[#f2f6f8]">
            {/* Personalized Header & Tracker */}
            <div className="p-8 pb-0">
                <h1 className="text-xl font-normal text-gray-500 tracking-tight">How&apos;s your day going, <span className="font-bold text-gray-900">{user.name.split(' ')[0]}</span>?</h1>
                {/* <div className="mt-6 bg-white p-2 rounded-sm border border-[#e4eaee] shadow-sm max-w-[1400px]">
                    <TimerBar />
                </div> */}
            </div>

            <DashboardView />
        </div>
    )
}
