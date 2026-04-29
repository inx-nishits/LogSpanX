'use client'

import { useState } from 'react'
import { Mail, UserPlus, Shield, User, Eye, X, Loader2 } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { User as UserType } from '@/lib/types'

interface InviteMemberModalProps {
    isOpen: boolean
    onClose: () => void
    onInvite: (email: string, role: UserType['role']) => Promise<void>
}

const ROLES: { id: UserType['role']; title: string; desc: string; icon: any }[] = [
    {
        id: 'admin',
        title: 'Team Lead (Admin)',
        desc: 'Can manage projects, assign tasks, and approve team timesheets.',
        icon: Shield
    },
    {
        id: 'member' as const,
        title: 'Team Member',
        desc: 'Can track time on assigned tasks and view personal reports.',
        icon: User
    },
]

export function InviteMemberModal({ isOpen, onClose, onInvite }: InviteMemberModalProps) {
    const [email, setEmail] = useState('')
    const [selectedRole, setSelectedRole] = useState<UserType['role']>('member')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) return

        setIsSubmitting(true)
        try {
            await onInvite(email, selectedRole)
            setEmail('')
            setSelectedRole('member')
            onClose()
        } catch (error) {
            console.error('Failed to invite:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden bg-white border-none shadow-2xl rounded-sm">
                <DialogHeader className="px-6 pt-6 pb-4 bg-gray-50/50 border-b border-gray-100">
                    <div className="flex items-center space-x-2 text-[#03a9f4] mb-1">
                        <UserPlus className="h-5 w-5" />
                        <span className="text-[11px] font-bold uppercase tracking-widest">Team Management</span>
                    </div>
                    <DialogTitle className="text-2xl font-bold text-gray-900 tracking-tight">Invite new member</DialogTitle>
                    <DialogDescription className="text-sm text-gray-500">
                        Send an invitation to join LogSpanX and assign their starting role.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
                    {/* Email Input */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="email"
                                required
                                placeholder="colleague@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-sm focus:outline-none focus:border-[#03a9f4] transition-colors text-sm placeholder:text-gray-300"
                            />
                        </div>
                    </div>

                    {/* Role Selection */}
                    <div className="space-y-3">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Assign Role</label>
                        <div className="space-y-2">
                            {ROLES.map((role) => (
                                <div
                                    key={role.id}
                                    onClick={() => setSelectedRole(role.id)}
                                    className={cn(
                                        "flex items-start p-3 border rounded-sm cursor-pointer transition-all group",
                                        selectedRole === role.id
                                            ? "border-[#03a9f4] bg-blue-50/30"
                                            : "border-gray-100 hover:border-gray-200 bg-white"
                                    )}
                                >
                                    <div className={cn(
                                        "p-2 rounded-sm mr-3 transition-colors",
                                        selectedRole === role.id ? "bg-[#03a9f4] text-white" : "bg-gray-50 text-gray-400 group-hover:text-gray-600"
                                    )}>
                                        <role.icon className="h-4 w-4 stroke-[1.5px]" />
                                    </div>
                                    <div className="flex-1">
                                        <p className={cn(
                                            "text-[13px] font-bold leading-none mb-1",
                                            selectedRole === role.id ? "text-gray-900" : "text-gray-700"
                                        )}>
                                            {role.title}
                                        </p>
                                        <p className="text-[11px] text-gray-400 font-medium leading-tight">
                                            {role.desc}
                                        </p>
                                    </div>
                                    <div className={cn(
                                        "h-4 w-4 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5",
                                        selectedRole === role.id ? "border-[#03a9f4] bg-[#03a9f4]" : "border-gray-200"
                                    )}>
                                        {selectedRole === role.id && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <DialogFooter className="pt-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 text-[13px] font-medium"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || !email}
                            className="bg-[#03a9f4] hover:bg-[#0288d1] text-white min-w-[120px] shadow-md shadow-blue-100 rounded-sm py-5 text-[14px]"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                                </>
                            ) : (
                                'Send Invitation'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
