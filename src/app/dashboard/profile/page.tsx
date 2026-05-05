'use client'

import { useAuthStore } from '@/lib/stores/auth-store'
import { Mail, Briefcase, Clock, ShieldCheck, User as UserIcon } from 'lucide-react'

export default function ProfilePage() {
  const { user } = useAuthStore()

  const userInitials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2)
    : 'NS'

  return (
    <div className="w-full h-full bg-[#f2f6f8] animate-in fade-in duration-300">

      {/* Profile Header Band */}
      <div className="w-full bg-white border-b border-gray-200 px-4 py-8">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center md:items-center space-y-4 md:space-y-0 md:space-x-6 text-center md:text-left">
          <div className="relative group">
            <div className="h-20 w-20 md:h-24 md:w-24 bg-pink-500 rounded-sm flex items-center justify-center text-white text-2xl md:text-3xl font-black italic tracking-tighter shadow-md transition-transform group-hover:scale-[1.02]">
              {userInitials}
            </div>
            <div className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 bg-green-500 border-2 md:border-4 border-white h-5 w-5 md:h-6 md:w-6 rounded-full shadow-sm" title="Online" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tighter italic truncate">
              {user?.name || 'Nishit Sangani'}
            </h1>
            <div className="flex flex-col sm:flex-row items-center mt-1 sm:space-x-3 space-y-2 sm:space-y-0">
              <span className="text-[10px] md:text-[13px] font-bold text-[#03a9f4] uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-sm border border-blue-100">
                Authorized User
              </span>
              <span className="text-[10px] md:text-xs text-gray-400 font-medium">
                Trackify Pro Member
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Left Column: Stats/Status */}
        <div className="col-span-1 space-y-6">
          <div className="bg-white rounded-sm border border-gray-200 overflow-hidden shadow-sm">
            <div className="bg-[#f0f7fb] px-4 py-3 border-b border-[#d6e5ef]">
              <h3 className="text-[13px] font-black text-slate-600 uppercase tracking-widest">Account Status</h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center transition-all">
                <div className="h-2 w-2 rounded-full bg-green-500 mr-3 animate-pulse" />
                <span className="text-sm font-bold text-gray-700">Verified & Active</span>
              </div>
              <p className="text-[13px] leading-relaxed text-gray-500 font-medium">
                Your account is currently synced and managed by the security policy.
              </p>
            </div>
          </div>

          <div className="bg-[#03a9f4] p-5 rounded-sm shadow-lg text-white relative overflow-hidden group">
            <div className="relative z-10">
              <h4 className="text-xs font-black uppercase tracking-tighter opacity-80 mb-1">Company Managed</h4>
              <p className="text-sm font-medium leading-normal">
                Personal details are locked by your administrator. Contact support for changes.
              </p>
            </div>
            <ShieldCheck className="absolute -right-4 -bottom-4 h-24 w-24 opacity-10 -rotate-12 transition-transform group-hover:rotate-0" />
          </div>
        </div>

        {/* Right Column: Information Grid */}
        <div className="col-span-1 md:col-span-2">
          <div className="bg-white rounded-sm border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-[#f0f7fb] px-6 py-4 border-b border-[#d6e5ef] flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-700 uppercase tracking-widest">Personal Identity</h2>
              <UserIcon className="h-4 w-4 text-slate-400" />
            </div>

            <div className="divide-y divide-gray-50">
              <div className="flex items-center min-h-[64px] px-6 py-4 hover:bg-[#fcfdfe] transition-colors group">
                <div className="w-1/3 flex items-center text-[13px] font-bold text-gray-400 uppercase tracking-wider">
                  <Briefcase className="w-3.5 h-3.5 mr-2 text-gray-300 group-hover:text-[#03a9f4] transition-colors" />
                  Full Name
                </div>
                <div className="w-2/3 text-[16px] font-bold text-gray-800">
                  {user?.name || 'Nishit Sangani'}
                </div>
              </div>

              <div className="flex items-center min-h-[64px] px-6 py-4 hover:bg-[#fcfdfe] transition-colors group">
                <div className="w-1/3 flex items-center text-[13px] font-bold text-gray-400 uppercase tracking-wider">
                  <Mail className="w-3.5 h-3.5 mr-2 text-gray-300 group-hover:text-[#03a9f4] transition-colors" />
                  Identity
                </div>
                <div className="w-2/3 text-[16px] font-bold text-gray-800">
                  {user?.email || 'nishit@inheritx.com'}
                </div>
              </div>

              <div className="flex items-center min-h-[64px] px-6 py-4 hover:bg-[#fcfdfe] transition-colors group">
                <div className="w-1/3 flex items-center text-[13px] font-bold text-gray-400 uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5 mr-2 text-gray-300 group-hover:text-[#03a9f4] transition-colors" />
                  Clock Format
                </div>
                <div className="w-2/3 text-[16px] font-bold text-gray-800">
                  12-Hour (Standard)
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50/20">
                <div className="flex items-start space-x-3">
                  <div className="mt-0.5">
                    <div className="p-1 bg-white border border-gray-200 rounded-sm">
                      <ShieldCheck className="h-3 w-3 text-[#03a9f4]" />
                    </div>
                  </div>
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-tight leading-normal">
                    Secure organizational profile. All modifications must be requested through your administrator.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
