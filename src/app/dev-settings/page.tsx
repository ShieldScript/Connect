'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Settings, RotateCcw, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function DevSettingsPage() {
  const router = useRouter()
  const [isResetting, setIsResetting] = useState(false)

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex items-center gap-3 text-red-700 mb-2">
            <AlertCircle className="w-6 h-6" />
            <h1 className="text-xl font-bold">Not Available</h1>
          </div>
          <p className="text-red-600">Developer settings are only available in development mode.</p>
        </div>
      </div>
    )
  }

  const handleResetOnboarding = async () => {
    if (!confirm('Are you sure you want to reset your onboarding? This will set your onboarding level to 0.')) {
      return
    }

    setIsResetting(true)

    try {
      // Get current user's person ID from the profile API
      const profileRes = await fetch('/api/persons/me')
      if (!profileRes.ok) {
        throw new Error('Failed to fetch user profile')
      }
      const { person } = await profileRes.json()

      // Call reset endpoint
      const resetRes = await fetch('/api/dev/reset-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personId: person.id }),
      })

      if (!resetRes.ok) {
        const error = await resetRes.json()
        throw new Error(error.error || 'Failed to reset onboarding')
      }

      toast.success('Onboarding reset successfully! Redirecting to dashboard...')

      // Redirect to dashboard after 1 second
      setTimeout(() => {
        router.push('/')
        router.refresh()
      }, 1000)
    } catch (error: any) {
      console.error('Error resetting onboarding:', error)
      toast.error(error.message || 'Failed to reset onboarding')
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Developer Settings</h1>
          </div>
          <p className="text-gray-600 text-sm">
            Tools for testing and debugging the application. Only available in development mode.
          </p>
        </div>

        {/* Development Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-yellow-900 mb-1">Development Mode Only</h3>
              <p className="text-sm text-yellow-700">
                These settings are disabled in production and should only be used for testing purposes.
              </p>
            </div>
          </div>
        </div>

        {/* Reset Onboarding Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Reset Onboarding</h2>
              <p className="text-sm text-gray-600">
                Reset your onboarding progress to level 0. This allows you to test the onboarding flow from the beginning.
              </p>
            </div>
            <RotateCcw className="w-6 h-6 text-gray-400 flex-shrink-0" />
          </div>

          <button
            onClick={handleResetOnboarding}
            disabled={isResetting}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResetting ? (
              <>
                <span className="inline-block animate-spin mr-2">⟳</span>
                Resetting...
              </>
            ) : (
              'Reset Onboarding'
            )}
          </button>
        </div>

        {/* Navigation */}
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/')}
            className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
