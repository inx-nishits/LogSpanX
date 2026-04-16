'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/lib/stores/auth-store'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  const router = useRouter()
  const { login } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const success = await login(email, password)
      if (success) {
        router.push('/dashboard')
      } else {
        setError('Invalid email or password')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f1f1f4] flex flex-col items-center pt-[10vh] pb-6">


      {/* Main Login Card */}
      <div className="w-full max-w-[400px] bg-white rounded-sm shadow-[0_4px_16px_rgba(11,12,14,0.08)] px-10 py-10">
        <div className="flex justify-center mb-8">
          <span className="text-3xl font-black text-gray-900 tracking-tighter">LogSpan<span className="text-[#03a9f4]">X</span></span>
        </div>

        <h1 className="text-[20px] font-normal text-gray-800 text-center mb-1">
          Log in
        </h1>
        <div className="flex justify-center items-center text-[13px] text-gray-600 mb-8">
          <span>Don't have an account?</span>
          <Link href="/signup" className="text-[#03a9f4] hover:underline hover:text-[#0288d1] ml-1">
            Sign up
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <button 
            type="button" 
            className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-white border border-[#d7e2ea] rounded-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.20455C17.64 8.56636 17.5827 7.95273 17.4764 7.36364H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8195H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.20455Z" fill="#4285F4"/>
              <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5614C11.2418 14.1014 10.2109 14.4205 9 14.4205C6.65591 14.4205 4.67182 12.8373 3.96409 10.71H0.957275V13.0418C2.43818 15.9832 5.48182 18 9 18Z" fill="#34A853"/>
              <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957275C0.347727 6.17318 0 7.54773 0 9C0 10.4523 0.347727 11.8268 0.957275 13.0418L3.96409 10.71Z" fill="#FBBC05"/>
              <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#EA4335"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-[10px] tracking-widest font-medium text-gray-400">
              <span className="bg-white px-3 uppercase tracking-wider">Or</span>
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
