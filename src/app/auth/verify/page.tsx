'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

function VerifyEmailContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Invalid verification link')
      return
    }

    // Verify email
    fetch(`/api/auth/verify?token=${token}`)
      .then(async (res) => {
        const data = await res.json()
        
        if (res.ok) {
          setStatus('success')
          setMessage(data.message)
        } else {
          setStatus('error')
          setMessage(data.error || 'Verification failed')
        }
      })
      .catch(() => {
        setStatus('error')
        setMessage('Something went wrong. Please try again.')
      })
  }, [token])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        {status === 'loading' && (
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-purple-600" />
            <h1 className="text-2xl font-bold text-gray-900">Verifying Email...</h1>
            <p className="mt-2 text-gray-600">Please wait while we verify your email address.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Email Verified! 🎉</h1>
            <p className="mt-2 text-gray-600">{message}</p>
            <Button
              onClick={() => router.push('/auth/login')}
              className="mt-6 w-full"
            >
              Continue to Login
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Verification Failed</h1>
            <p className="mt-2 text-gray-600">{message}</p>
            <div className="mt-6 space-y-2">
              <Button
                onClick={() => router.push('/auth/register')}
                className="w-full"
                variant="secondary"
              >
                Register Again
              </Button>
              <Button
                onClick={() => router.push('/auth/login')}
                className="w-full"
                variant="ghost"
              >
                Back to Login
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-purple-600" />
          <h1 className="text-2xl font-bold text-gray-900">Loading...</h1>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
