'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useDataStore, SharedReportData } from '@/lib/stores/data-store'
import { format } from 'date-fns'
import { Skeleton } from '@/components/ui/skeleton'
import { SummaryBarChart } from '@/app/dashboard/reports/summary/summary-bar-chart'
import { SummaryDonut } from '@/app/dashboard/reports/summary/summary-donut'
import { SummaryTable } from '@/app/dashboard/reports/summary/summary-table'
import { Clock, Calendar, Download, Printer, Share2 } from 'lucide-react'

export default function SharedReportPage() {
  const params = useParams()
  const token = params.token as string
  const { getSharedReport, projects } = useDataStore()
  const [report, setReport] = useState<SharedReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    setLoading(true)
    getSharedReport(token)
      .then(setReport)
      .catch(err => {
        console.error('Failed to load shared report:', err)
        setError('This shared report could not be found or has expired.')
      })
      .finally(() => setLoading(false))
  }, [token, getSharedReport])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <Skeleton className="h-12 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-8">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <Clock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Report Not Found</h1>
          <p className="text-gray-600">{error || 'Something went wrong while loading this report.'}</p>
          <a href="/" className="inline-block px-6 py-2 bg-[#03a9f4] text-white rounded-md font-medium hover:bg-[#0288d1] transition-colors">
            Go to Home
          </a>
        </div>
      </div>
    )
  }

  const { reportDetails, data } = report
  const fmtSecs = (s: number) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    return `${h}h ${m}m`
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans antialiased pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#03a9f4] rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-[#03a9f4]/20">
              L
            </div>
            <div>
              <h1 className="text-[18px] font-bold text-gray-900">{reportDetails.name}</h1>
              <p className="text-[13px] text-gray-500">Shared Report • Trackify</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2.5 text-gray-400 hover:text-[#03a9f4] hover:bg-[#03a9f4]/5 rounded-lg transition-all" title="Print">
              <Printer className="w-5 h-5" />
            </button>
            <button className="p-2.5 text-gray-400 hover:text-[#03a9f4] hover:bg-[#03a9f4]/5 rounded-lg transition-all" title="Download PDF">
              <Download className="w-5 h-5" />
            </button>
            <div className="h-6 w-px bg-gray-200 mx-1" />
            <button className="flex items-center gap-2 px-4 py-2 bg-[#03a9f4] text-white rounded-lg font-bold text-[14px] hover:bg-[#0288d1] shadow-lg shadow-[#03a9f4]/20 transition-all">
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-[13px] font-bold text-gray-400 uppercase tracking-wider mb-2">Total Duration</p>
            <h2 className="text-3xl font-bold text-gray-900">{fmtSecs(data.totalDuration)}</h2>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-[13px] font-bold text-gray-400 uppercase tracking-wider mb-2">Generated On</p>
            <div className="flex items-center gap-2 text-gray-900 font-bold text-xl">
              <Calendar className="w-5 h-5 text-[#03a9f4]" />
              {format(new Date(), 'MMM d, yyyy')}
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-[13px] font-bold text-gray-400 uppercase tracking-wider mb-2">Status</p>
            <div className="flex items-center gap-2 text-green-600 font-bold text-xl">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
              Live View
            </div>
          </div>
        </div>

        {/* Charts & Table Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Report Analysis</h3>
            <div className="flex bg-gray-50 p-1 rounded-lg">
              <button className="px-4 py-1.5 bg-white shadow-sm rounded-md text-[13px] font-bold text-[#03a9f4]">Table View</button>
              <button className="px-4 py-1.5 text-[13px] font-bold text-gray-500 hover:text-gray-900 transition-colors">Visuals</button>
            </div>
          </div>
          
          <div className="flex flex-col lg:flex-row min-h-[500px]">
            <div className="flex-1 border-r border-gray-50">
              <SummaryTable 
                rows={(data.groupings as any[]) || []} 
                onRowClick={() => {}} 
              />
            </div>
            <div className="w-full lg:w-[400px] p-8 flex items-center justify-center bg-gray-50/30">
               <SummaryDonut 
                  data={((data.groupings as any[]) || []).map(g => ({
                    name: g.title,
                    value: g.duration,
                    color: g.color || '#03a9f4'
                  }))} 
                  totalLabel={fmtSecs(data.totalDuration)} 
               />
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center">
          <p className="text-[13px] text-gray-400">
            Trackify Time Tracking & Reporting • This report is read-only.
          </p>
        </div>
      </main>
    </div>
  )
}
