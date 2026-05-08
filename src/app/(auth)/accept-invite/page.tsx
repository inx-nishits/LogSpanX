'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/lib/stores/auth-store'
import { getDashboardRoute } from '@/lib/rbac'

function AcceptInviteForm() {
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const router = useRouter()
  const searchParams = useSearchParams()
  const inviteToken = searchParams.get('token') ?? ''

  const { acceptInvite } = useAuthStore()

  useEffect(() => {
    if (!inviteToken) setError('Invalid or missing invite link.')
  }, [inviteToken])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteToken) return
    setIsLoading(true)
    setError('')

    try {
      const success = await acceptInvite(inviteToken, name, password)
      if (success) {
        const role = useAuthStore.getState().user?.role ?? 'member'
        router.replace(getDashboardRoute(role))
      } else {
        setError(useAuthStore.getState().error || 'Failed to accept invite. The link may have expired.')
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f1f1f4] flex flex-col items-center pt-[10vh] pb-6">
      <div className="w-full max-w-[400px] bg-white rounded-sm shadow-[0_4px_16px_rgba(11,12,14,0.08)] px-10 py-10">
        <div className="flex justify-center mb-8">
          <img src="/Trackify.svg" alt="Trackify" className="h-10 w-auto object-contain" />
        </div>

        <h1 className="text-[20px] font-normal text-gray-800 text-center mb-1">
          Accept Invitation
        </h1>
        <p className="text-[13px] text-gray-500 text-center mb-8">
          Set up your name and password to get started.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-sm bg-red-50 p-3">
              <div className="text-xs text-red-800 text-center font-medium">{error}</div>
            </div>
          )}

          <Input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-11 text-sm bg-white border-[#d7e2ea] placeholder-gray-400 focus-visible:ring-1 focus-visible:ring-[#03a9f4] focus-visible:border-[#03a9f4] rounded-sm"
            placeholder="Full name"
          />

          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 text-sm bg-white border-[#d7e2ea] pr-10 placeholder-gray-400 focus-visible:ring-1 focus-visible:ring-[#03a9f4] focus-visible:border-[#03a9f4] rounded-sm"
              placeholder="Choose password (min 8 chars)"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              {showPassword ? <EyeOff className="h-4 w-4 stroke-[1.5px]" /> : <Eye className="h-4 w-4 stroke-[1.5px]" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading || !inviteToken}
            className="w-full h-11 flex items-center justify-center bg-[#03a9f4] hover:bg-[#0288d1] text-white rounded-sm text-sm font-medium transition-colors cursor-pointer mt-2 disabled:opacity-60"
          >
            {isLoading ? 'Setting up...' : 'Join Workspace'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function AcceptInvitePage() {
  return (
    <Suspense>
      <AcceptInviteForm />
    </Suspense>
  )
}
