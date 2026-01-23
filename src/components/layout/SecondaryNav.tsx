'use client'

import React from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/Button'

export function SecondaryNav() {
  const { data: session } = useSession()

  return (
    <div className="bg-gray-100 border-b border-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          <div className="flex items-center space-x-4">
            <Link href="/list-property">
              <Button variant="ghost" size="sm" className="font-bold text-gray-700 hover:text-gray-900">
                List Your Property
              </Button>
            </Link>

            {session && (
              <Link href="/agent">
                <Button variant="ghost" size="sm" className="font-bold text-blue-600 hover:text-blue-700">
                  Become an Agent & Earn
                </Button>
              </Link>
            )}
          </div>

          <div className="text-sm text-gray-600">
            Need help? <a href="mailto:support@faqtpn.com" className="text-blue-600 hover:text-blue-700 font-semibold">Contact us</a>
          </div>
        </div>
      </div>
    </div>
  )
}
