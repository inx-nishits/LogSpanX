'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { getDashboardRoute } from '@/lib/rbac'
import { useAuthStore } from '@/lib/stores/auth-store'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const router = useRouter()
  const { login, authStatus, hasHydrated, error: authError } = useAuthStore()

  useEffect(() => {
    if (hasHydrated && authStatus === 'authenticated') {
      const currentRole = useAuthStore.getState().user?.role ?? 'team_member'
      router.replace(getDashboardRoute(currentRole))
    }
  }, [hasHydrated, authStatus, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const success = await login(email, password)
      if (success) {
        const currentRole = useAuthStore.getState().user?.role ?? 'team_member'
        router.replace(getDashboardRoute(currentRole))
      } else {
        setError(authError || 'Invalid email or password')
      }
    } catch {
      setError(authError || 'An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f1f1f4] flex flex-col items-center pt-[10vh] pb-6">

      {/* Main Login Card */}
      <div className="w-full max-w-[400px] bg-white rounded-sm shadow-[0_4px_16px_rgba(11,12,14,0.08)] px-10 py-10">
        <div className="flex justify-center mb-8">
          <img src="/Trackify.svg" alt="Trackify" className="h-10 w-auto object-contain" />
        </div>

        <h1 className="text-[20px] font-normal text-gray-800 text-center mb-1">
          Log in
        </h1>
        <div className="flex justify-center items-center text-[13px] text-gray-600 mb-8">
          <span>Don&apos;t have an account?</span>
          <Link href="/signup" className="text-[#03a9f4] hover:underline hover:text-[#0288d1] ml-1">
            Sign up
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
          </div>

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

          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 text-sm bg-white border-[#d7e2ea] pr-10 placeholder-gray-400 focus-visible:ring-1 focus-visible:ring-[#03a9f4] focus-visible:border-[#03a9f4] rounded-sm"
              placeholder="Choose password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 stroke-[1.5px]" />
              ) : (
                <Eye className="h-4 w-4 stroke-[1.5px]" />
              )}
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 flex items-center justify-center bg-[#03a9f4] hover:bg-[#0288d1] text-white rounded-sm text-sm font-medium transition-colors cursor-pointer mt-2"
          >
            {isLoading ? 'Wait...' : 'Log in'}
          </button>

          <div className="flex justify-between items-center pt-2">
            <div className="flex items-center space-x-2">
              <input
                id="remember"
                type="checkbox"
                className="w-[18px] h-[18px] rounded-sm border-gray-300 text-[#03a9f4] focus:ring-[#03a9f4] cursor-pointer"
              />
              <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
                Stay logged in
              </label>
            </div>
            <Link
              href="/forgot-password"
              className="text-[13px] text-[#03a9f4] hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 pb-2">
          <p className="text-[12px] text-gray-500 text-center">
            By logging in, you agree to the{' '}
            <Link href="/terms" className="text-gray-500 hover:text-gray-800 underline transition-colors">Terms of Use</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-gray-500 hover:text-gray-800 underline transition-colors">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
