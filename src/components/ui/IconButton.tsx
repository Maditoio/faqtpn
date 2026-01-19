import React from 'react'

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  label?: string
}

/**
 * Circular icon button component
 * All icons MUST be wrapped in circular containers as per design requirements
 */
export function IconButton({
  icon,
  variant = 'primary',
  size = 'md',
  label,
  className = '',
  ...props
}: IconButtonProps) {
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
  }
  
  const sizes = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
  }

  return (
    <button
      className={`rounded-full flex items-center justify-center transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      aria-label={label}
      title={label}
      {...props}
    >
      {icon}
    </button>
  )
}
