'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/lib/stores/auth-store'

export default function ResetPasswordPage() {
  const router = useRouter()
  const { resetPassword } = useAuthStore()

  const [token, setToken] = useState('')

  useEffect(() => {
    const urlToken = new URLSearchParams(window.location.search).get('token') ?? ''
    setToken(urlToken)
  }, [])
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!token.trim()) {
      setError('Reset token is required.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsLoading(true)

    try {
      await resetPassword(token.trim(), newPassword)
      setIsSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reset password.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#f1f1f4] flex flex-col items-center pt-[10vh] pb-6">
        <div className="w-full max-w-[400px] bg-white rounded-sm shadow-[0_4px_16px_rgba(11,12,14,0.08)] px-10 py-10 text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-50 mb-6">
            <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-[20px] font-normal text-gray-800 mb-2">Password updated</h2>
          <p className="text-[13px] text-gray-600 mb-8">
            Your password has been changed. You can log in with the new password now.
          </p>
          <button
            onClick={() => router.replace('/login')}
            className="w-full h-11 flex items-center justify-center bg-[#03a9f4] hover:bg-[#0288d1] text-white rounded-sm text-sm font-medium transition-colors cursor-pointer"
          >
            Go to Log in
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f1f1f4] flex flex-col items-center pt-[10vh] pb-6">
      <div className="w-full max-w-[400px] bg-white rounded-sm shadow-[0_4px_16px_rgba(11,12,14,0.08)] px-10 py-10">
        <div className="flex justify-center mb-8">
          <img src="/Trackify.svg" alt="Trackify" className="h-10 object-contain" />
        </div>

        <h1 className="text-[20px] font-normal text-gray-800 text-center mb-1">Set a new password</h1>
        <div className="flex justify-center items-center text-[13px] text-gray-600 mb-8 text-center px-4">
          <span>Choose a new password for your account.</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-sm bg-red-50 p-3 mb-2">
              <div className="text-xs text-red-800 text-center font-medium">{error}</div>
            </div>
          )}

          <Input
            id="token"
            name="token"
            type="text"
            required
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="w-full h-11 text-sm bg-white border-[#d7e2ea] placeholder-gray-400 focus-visible:ring-1 focus-visible:ring-[#03a9f4] focus-visible:border-[#03a9f4] rounded-sm"
            placeholder="Reset token"
          />

          <div className="relative">
            <Input
              id="newPassword"
              name="newPassword"
              type={showPassword ? 'text' : 'password'}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full h-11 text-sm bg-white border-[#d7e2ea] pr-10 placeholder-gray-400 focus-visible:ring-1 focus-visible:ring-[#03a9f4] focus-visible:border-[#03a9f4] rounded-sm"
              placeholder="New password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              {showPassword ? <EyeOff className="h-4 w-4 stroke-[1.5px]" /> : <Eye className="h-4 w-4 stroke-[1.5px]" />}
            </button>
          </div>

          <div className="relative">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full h-11 text-sm bg-white border-[#d7e2ea] pr-10 placeholder-gray-400 focus-visible:ring-1 focus-visible:ring-[#03a9f4] focus-visible:border-[#03a9f4] rounded-sm"
              placeholder="Confirm new password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((value) => !value)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4 stroke-[1.5px]" /> : <Eye className="h-4 w-4 stroke-[1.5px]" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 flex items-center justify-center bg-[#03a9f4] hover:bg-[#0288d1] text-white rounded-sm text-sm font-medium transition-colors cursor-pointer mt-2"
          >
            {isLoading ? 'Updating...' : 'Update password'}
          </button>

          <div className="text-center pt-4">
            <Link href="/login" className="text-[13px] text-[#03a9f4] hover:underline hover:text-[#0288d1]">
              Back to Log in
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
