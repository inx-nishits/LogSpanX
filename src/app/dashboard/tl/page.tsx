'use client'

import { useAuthStore } from '@/lib/stores/auth-store'
import { ListFilter, ClipboardCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DashboardView } from '@/components/dashboard/dashboard-view'

export default function TLDashboard() {
    const { user } = useAuthStore()

    return (
        <div className="flex flex-col h-full bg-[#f2f6f8]">
            <div className="px-8 pt-8 flex justify-end">
                <div className="flex space-x-3">
                    <Button className="bg-[#03a9f4] hover:bg-[#0288d1] text-white shadow-sm cursor-pointer rounded-sm px-6 h-9 text-[15px] font-bold uppercase tracking-wider">
                        <ListFilter className="mr-2 h-4 w-4" /> Assign Tasks
                    </Button>
                    <Button variant="outline" className="border-gray-200 text-gray-500 bg-white hover:bg-gray-50 shadow-sm cursor-pointer rounded-sm px-6 h-9 text-[15px] font-bold uppercase tracking-wider">
                        <ClipboardCheck className="mr-2 h-4 w-4" /> Approve Timesheets
                    </Button>
                </div>
            </div>

            <DashboardView />
        </div>
    )
}
