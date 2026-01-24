import React from 'react'

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  }

  return (
    <div className="flex items-center justify-center py-8">
      <div
        className={`${sizes[size]} border-blue-600 border-t-transparent rounded-full animate-spin`}
        aria-label="Loading"
      />
    </div>
  )
}
