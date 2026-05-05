'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/lib/stores/auth-store'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')
  
  const router = useRouter()
  const { forgotPassword } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      await forgotPassword(email)
      setIsSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.')
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
          <h2 className="text-[20px] font-normal text-gray-800 mb-2">
            Check your email
          </h2>
          <p className="text-[13px] text-gray-600 mb-8">
            We&apos;ve sent a password reset link to{' '}
            <strong className="font-semibold text-gray-800">{email}</strong>
          </p>
          <button
            onClick={() => router.push('/login')}
            className="w-full h-11 flex items-center justify-center bg-[#03a9f4] hover:bg-[#0288d1] text-white rounded-sm text-sm font-medium transition-colors cursor-pointer"
          >
            Back to Log in
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

        <h1 className="text-[20px] font-normal text-gray-800 text-center mb-1">
          Reset Password
        </h1>
        <div className="flex justify-center items-center text-[13px] text-gray-600 mb-8 text-center px-4">
          <span>Enter your email and we&apos;ll send you a recovery link.</span>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-sm bg-red-50 p-3 mb-2">
              <div className="text-xs text-red-800 text-center font-medium">{error}</div>
            </div>
          )}

          <div>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 text-sm bg-white border-[#d7e2ea] placeholder-gray-400 focus-visible:ring-1 focus-visible:ring-[#03a9f4] focus-visible:border-[#03a9f4] rounded-sm"
              placeholder="Enter email"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 flex items-center justify-center bg-[#03a9f4] hover:bg-[#0288d1] text-white rounded-sm text-sm font-medium transition-colors cursor-pointer mt-2"
          >
            {isLoading ? 'Sending...' : 'Send reset link'}
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
