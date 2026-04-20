'use client'

import { useState } from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useDataStore } from '@/lib/stores/data-store'
import { UserPlus, Mail, Shield, User as UserIcon, MoreHorizontal, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InviteMemberModal } from '@/components/team/invite-member-modal'
import { cn } from '@/lib/utils'

export default function TeamPage() {
  const { user, inviteUser } = useAuthStore()
  const { users } = useDataStore()
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  const canInvite = user?.role === 'owner' || user?.role === 'admin'

  return (
    <div className="p-6 space-y-6 bg-[#f2f6f8] min-h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Team Management</h1>
          <p className="text-sm text-gray-500">Manage your organization's members and their access levels.</p>
        </div>
        {canInvite && (
          <Button
            className="bg-[#03a9f4] hover:bg-[#0288d1] text-white shadow-md rounded-sm cursor-pointer"
            onClick={() => setIsInviteModalOpen(true)}
          >
            <UserPlus className="mr-2 h-4 w-4" /> Invite Member
          </Button>
        )}
      </div>

      <div className="bg-white rounded-sm border border-[#e4eaee] shadow-sm overflow-hidden mt-6">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              placeholder="Filter by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-sm focus:outline-none focus:border-[#03a9f4] placeholder:text-gray-400"
            />
          </div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-4">
            {filteredUsers.length} MEMBERS
          </p>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredUsers.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-[#03a9f4]/10 rounded-full flex items-center justify-center text-[#03a9f4] font-bold">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">{member.name}</h3>
                  <div className="flex items-center space-x-2 text-[11px] text-gray-400 font-medium">
                    <Mail className="h-3 w-3" />
                    <span>{member.email}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-8">
                <div className="flex flex-col items-end">
                  <div className={cn(
                    "flex items-center space-x-1 px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider",
                    member.role === 'owner' ? "bg-purple-100 text-purple-700" :
                      member.role === 'admin' ? "bg-blue-100 text-blue-700" :
                        "bg-gray-100 text-gray-600"
                  )}>
                    {member.role === 'owner' ? <Shield className="h-2.5 w-2.5" /> : <UserIcon className="h-2.5 w-2.5" />}
                    <span>{member.role}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 font-medium">Active now</p>
                </div>

                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onInvite={inviteUser}
      />
    </div>
  )
}
