'use client'

import { usePermissionStore } from '@/lib/stores/permission-store'
import { ShieldOff, X } from 'lucide-react'

export function PermissionDeniedModal() {
  const { isOpen, hide } = usePermissionStore()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-[1px]"
      onClick={hide}>
      <div
        className="bg-white rounded-sm shadow-2xl w-full max-w-[420px] mx-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e4eaee]">
          <div className="flex items-center gap-2.5">
            <ShieldOff className="h-5 w-5 text-red-500" />
            <h2 className="text-[16px] font-semibold text-[#333]">Permission Denied</h2>
          </div>
          <button onClick={hide} className="text-[#aaa] hover:text-[#555] transition-colors cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-6">
          <p className="text-[14px] text-[#555] leading-relaxed">
            You don&apos;t have the right to perform this action. Please contact your workspace owner or admin if you believe this is a mistake.
          </p>
        </div>
        <div className="px-6 py-4 border-t border-[#e4eaee] flex justify-end">
          <button
            onClick={hide}
            className="px-6 h-[34px] bg-[#03a9f4] hover:bg-[#0288d1] text-white text-[13px] font-bold uppercase tracking-widest rounded-sm cursor-pointer transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  )
}
