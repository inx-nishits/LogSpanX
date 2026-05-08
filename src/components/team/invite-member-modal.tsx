'use client'

import { useState } from 'react'
import { Mail, UserPlus, Shield, User, Loader2, Crown, X } from 'lucide-react'
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
    onInvite: (emails: string[], role: UserType['role']) => Promise<{ invited: string[]; skipped: string[] }>
}

const ROLES: { id: UserType['role']; title: string; desc: string; icon: React.ElementType }[] = [
    {
        id: 'admin',
        title: 'Admin',
        desc: 'Can manage projects, roles, and non-owner user entries.',
        icon: Crown
    },
    {
        id: 'group_lead',
        title: 'Group Lead',
        desc: 'Can manage projects, assign tasks, and approve team timesheets.',
        icon: Shield
    },
    {
        id: 'member',
        title: 'Member',
        desc: 'Can track time on assigned tasks and view personal reports.',
        icon: User
    },
]

export function InviteMemberModal({ isOpen, onClose, onInvite }: InviteMemberModalProps) {
    const [emailInput, setEmailInput] = useState('')
    const [emails, setEmails] = useState<string[]>([])
    const [selectedRole, setSelectedRole] = useState<UserType['role']>('member')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [result, setResult] = useState<{ invited: string[]; skipped: string[] } | null>(null)

    const addEmail = (raw: string) => {
        const parsed = raw.split(/[\s,;]+/).map(e => e.trim()).filter(e => e.includes('@'))
        if (parsed.length === 0) return
        setEmails(prev => [...new Set([...prev, ...parsed])])
        setEmailInput('')
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
            e.preventDefault()
            addEmail(emailInput)
        }
    }

    const removeEmail = (email: string) => setEmails(prev => prev.filter(e => e !== email))

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const finalEmails = emailInput.trim() ? [...new Set([...emails, ...emailInput.split(/[\s,;]+/).map(e => e.trim()).filter(e => e.includes('@'))])] : emails
        if (finalEmails.length === 0) return

        setIsSubmitting(true)
        try {
            const res = await onInvite(finalEmails, selectedRole)
            setResult(res)
            setEmails([])
            setEmailInput('')
            setSelectedRole('member')
        } catch (error) {
            console.error('Failed to invite:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleClose = () => {
        setResult(null)
        setEmails([])
        setEmailInput('')
        setSelectedRole('member')
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden bg-white border-none shadow-2xl rounded-sm">
                <DialogHeader className="px-6 pt-6 pb-4 bg-gray-50/50 border-b border-gray-100">
                    <div className="flex items-center space-x-2 text-[#03a9f4] mb-1">
                        <UserPlus className="h-5 w-5" />
                        <span className="text-[11px] font-bold uppercase tracking-widest">Team Management</span>
                    </div>
                    <DialogTitle className="text-2xl font-bold text-gray-900 tracking-tight">Invite new member</DialogTitle>
                    <DialogDescription className="text-sm text-gray-500">
                        Send invitations to one or more people and assign their starting role.
                    </DialogDescription>
                </DialogHeader>

                {result ? (
                    <div className="px-6 py-6 space-y-4">
                        {result.invited.length > 0 && (
                            <div className="rounded-sm bg-green-50 border border-green-100 p-4">
                                <p className="text-[12px] font-bold text-green-700 uppercase tracking-wider mb-1">Invitations sent</p>
                                <p className="text-[13px] text-green-800">{result.invited.join(', ')}</p>
                            </div>
                        )}
                        {result.skipped.length > 0 && (
                            <div className="rounded-sm bg-amber-50 border border-amber-100 p-4">
                                <p className="text-[12px] font-bold text-amber-700 uppercase tracking-wider mb-1">Already have an account</p>
                                <p className="text-[13px] text-amber-800">{result.skipped.join(', ')}</p>
                            </div>
                        )}
                        <DialogFooter className="pt-2">
                            <Button onClick={handleClose} className="bg-[#03a9f4] hover:bg-[#0288d1] text-white rounded-sm py-5 text-[14px]">
                                Done
                            </Button>
                        </DialogFooter>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Email Addresses</label>
                            <div className="min-h-[44px] w-full border border-gray-200 rounded-sm px-3 py-2 flex flex-wrap gap-1.5 focus-within:border-[#03a9f4] transition-colors bg-white">
                                {emails.map(email => (
                                    <span key={email} className="inline-flex items-center gap-1 bg-[#e3f2fd] text-[#0288d1] text-[12px] px-2 py-0.5 rounded-sm">
                                        {email}
                                        <button type="button" onClick={() => removeEmail(email)} className="hover:text-[#01579b]">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                ))}
                                <div className="relative flex-1 min-w-[180px] flex items-center">
                                    <Mail className="absolute left-0 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder={emails.length === 0 ? 'colleague@company.com, ...' : 'Add more...'}
                                        value={emailInput}
                                        onChange={(e) => setEmailInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        onBlur={() => addEmail(emailInput)}
                                        className="w-full pl-6 text-sm outline-none placeholder:text-gray-300 bg-transparent"
                                    />
                                </div>
                            </div>
                            <p className="text-[11px] text-gray-400">Separate multiple emails with comma, space, or Enter</p>
                        </div>

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
                                onClick={handleClose}
                                className="text-gray-400 hover:text-gray-600 text-[13px] font-medium"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting || (emails.length === 0 && !emailInput.trim())}
                                className="bg-[#03a9f4] hover:bg-[#0288d1] text-white min-w-[120px] shadow-md shadow-blue-100 rounded-sm py-5 text-[14px]"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                                    </>
                                ) : (
                                    `Send Invitation${emails.length > 1 ? 's' : ''}`
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    )
}
