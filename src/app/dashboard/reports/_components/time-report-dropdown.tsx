'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

export function TimeReportDropdown() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('click', h)
    return () => document.removeEventListener('click', h)
  }, [])

  return (
    <div className="relative mr-3" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-3 h-[34px] text-[14px] text-[#555] bg-white border border-[#d0d8de] rounded hover:border-[#aaa] cursor-pointer font-medium"
      >
        TIME REPORT <ChevronDown className="h-3.5 w-3.5 text-[#aaa]" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-[#e4eaee] shadow-lg z-[200] min-w-[180px] py-1">
          <button
            onClick={() => setOpen(false)}
            className="w-full text-left px-4 py-2.5 text-[14px] text-[#333] bg-[#f5f7f9] font-medium cursor-pointer"
          >
            Time report
          </button>
          <button
            onClick={() => setOpen(false)}
            className="w-full text-left px-4 py-2.5 text-[14px] text-[#555] hover:bg-[#f5f7f9] cursor-pointer"
          >
            Team report
          </button>
          <button
            onClick={() => setOpen(false)}
            className="w-full text-left px-4 py-2.5 text-[14px] text-[#555] hover:bg-[#f5f7f9] cursor-pointer"
          >
            Expense report
          </button>
        </div>
      )}
    </div>
  )
}
