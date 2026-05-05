'use client'

import { useToastStore } from '@/lib/stores/toast-store'
import { X, AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

const icons = {
  error: <AlertCircle className="h-4 w-4 flex-shrink-0" />,
  success: <CheckCircle className="h-4 w-4 flex-shrink-0" />,
  warning: <AlertTriangle className="h-4 w-4 flex-shrink-0" />,
  info: <Info className="h-4 w-4 flex-shrink-0" />,
}

const styles = {
  error: 'bg-red-600 text-white',
  success: 'bg-[#2e7d32] text-white',
  warning: 'bg-[#f57c00] text-white',
  info: 'bg-[#0288d1] text-white',
}

export function GlobalToast() {
  const { toasts, dismiss } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 items-center">
      {toasts.map(t => (
        <div key={t.id}
          className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-md shadow-2xl min-w-[300px] max-w-[480px]',
            'animate-in slide-in-from-bottom-4 fade-in duration-200',
            styles[t.type]
          )}>
          {icons[t.type]}
          <span className="text-[14px] font-medium flex-1">{t.message}</span>
          <button onClick={() => dismiss(t.id)} className="hover:opacity-70 transition-opacity ml-2">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
