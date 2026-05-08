'use client'

import { useState } from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { TimerBar } from '@/components/tracker/timer-bar'
import { TimeEntryList } from '@/components/tracker/time-entry-list'

export default function TrackerPage() {
  const { user } = useAuthStore()
  const [refreshKey, setRefreshKey] = useState(0)

  if (!user) return null

  return (
    <div className="min-h-full flex flex-col bg-[#f2f6f8]">
      <div className="w-full px-4 pt-4 pb-2 overflow-visible">
        <div className="min-w-[1000px] w-full">
          <TimerBar onEntryAdded={() => setRefreshKey(k => k + 1)} />
        </div>
      </div>
      <div className="w-full px-4 py-4 overflow-x-auto hidden-scrollbar">
        <div className="min-w-[1000px] w-full">
          <TimeEntryList userId={user.id} refreshKey={refreshKey} />
        </div>
      </div>
    </div>
  )
}
