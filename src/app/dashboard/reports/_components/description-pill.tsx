'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search, X, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export function DescriptionPill() {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('click', h)
    return () => document.removeEventListener('click', h)
  }, [])

  return (
    <>
      <div className="w-px h-5 bg-[#e4eaee] flex-shrink-0" />
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen(o => !o)}
          className={cn(
            'flex items-center gap-1 px-4 h-[52px] text-[14px] transition-colors cursor-pointer',
            open || value ? 'text-[#03a9f4]' : 'text-[#555] hover:text-[#333]'
          )}
        >
          Description
          {value && value !== '__without__' && (
            <span className="ml-1 bg-[#03a9f4] text-white text-[11px] font-bold rounded-full w-[16px] h-[16px] flex items-center justify-center">1</span>
          )}
          <ChevronDown className="h-3 w-3 text-[#aaa]" />
        </button>
        {open && (
          <div className="absolute top-full left-0 mt-0.5 bg-white border border-[#e4eaee] shadow-lg z-[300] w-[300px] py-3 px-3">
            <div className="flex items-center gap-2 px-3 h-[38px] border border-[#d0d8de] rounded bg-white mb-3">
              <Search className="h-4 w-4 text-[#bbb] flex-shrink-0" />
              <input
                autoFocus
                value={value === '__without__' ? '' : value}
                onChange={e => setValue(e.target.value)}
                placeholder="Enter description..."
                className="flex-1 text-[14px] outline-none placeholder:text-[#bbb] bg-transparent"
              />
              {value && value !== '__without__' && (
                <button onClick={() => setValue('')} className="text-[#bbb] hover:text-[#555]">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <div
              className="flex items-center gap-2.5 px-1 py-1.5 cursor-pointer hover:bg-[#f5f7f9] rounded"
              onClick={() => setValue(v => v === '__without__' ? '' : '__without__')}
            >
              <div className={cn(
                'w-[15px] h-[15px] border flex items-center justify-center flex-shrink-0 transition-colors',
                value === '__without__' ? 'bg-[#03a9f4] border-[#03a9f4]' : 'border-[#bbb] bg-white'
              )}>
                {value === '__without__' && <Check className="h-2.5 w-2.5 text-white stroke-[3px]" />}
              </div>
              <span className="text-[14px] text-[#333]">Without description</span>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
