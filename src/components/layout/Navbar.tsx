'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/Button'
import { IconButton } from '@/components/ui/IconButton'
import { NotificationBell } from '@/components/NotificationBell'
import {
  HomeIcon,
  HeartIcon,
  DashboardIcon,
  LogoutIcon,
  MenuIcon,
  XIcon,
} from '@/components/icons/Icons'

export function Navbar() {
  const { data: session } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <HomeIcon className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">RentHub</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/properties">
              <Button variant="ghost" size="sm">
                Browse Properties
              </Button>
            </Link>

            {session ? (
              <>
                {session.user.role === 'USER' && (
                  <>
                    <Link href="/favorites">
                      <IconButton
                        icon={<HeartIcon className="w-5 h-5" />}
                        variant="ghost"
                        size="md"
                        label="Favorites"
                      />
                    </Link>
                    <Link href="/dashboard">
                      <Button variant="ghost" size="sm">
                        Dashboard
                      </Button>
                    </Link>
                  </>
                )}

                {session.user.role === 'HOME_OWNER' && (
                  <Link href="/owner/dashboard">
                    <Button variant="ghost" size="sm">
                      My Properties
                    </Button>
                  </Link>
                )}

                {session.user.role === 'SUPER_ADMIN' && (
                  <Link href="/admin/dashboard">
                    <Button variant="ghost" size="sm">
                      Admin Panel
                    </Button>
                  </Link>
                )}

                <div className="flex items-center space-x-3">
                  <NotificationBell />
                  <Link href="/profile">
                    <button className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-xs">
                          {session.user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="hidden md:inline">{session.user.name}</span>
                    </button>
                  </Link>
                  <IconButton
                    icon={<LogoutIcon className="w-5 h-5" />}
                    variant="secondary"
                    size="md"
                    onClick={handleSignOut}
                    label="Sign Out"
                  />
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button variant="primary" size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <IconButton
              icon={
                mobileMenuOpen ? (
                  <XIcon className="w-6 h-6" />
                ) : (
                  <MenuIcon className="w-6 h-6" />
                )
              }
              variant="ghost"
              size="md"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              label="Menu"
            />
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200">
          <div className="px-4 py-3 space-y-3">
            <Link href="/properties" className="block">
              <Button variant="ghost" size="sm" className="w-full justify-start">
                Browse Properties
              </Button>
            </Link>

            {session ? (
              <>
                {session.user.role === 'USER' && (
                  <>
                    <Link href="/favorites" className="block">
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        Favorites
                      </Button>
                    </Link>
                    <Link href="/dashboard" className="block">
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        Dashboard
                      </Button>
                    </Link>
                  </>
                )}

                {session.user.role === 'HOME_OWNER' && (
                  <Link href="/owner/dashboard" className="block">
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      My Properties
                    </Button>
                  </Link>
                )}

                {session.user.role === 'SUPER_ADMIN' && (
                  <Link href="/admin/dashboard" className="block">
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      Admin Panel
                    </Button>
                  </Link>
                )}

                <div className="pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-700 mb-2">{session.user.name}</p>
                  <div className="space-y-2">
                    <Link href="/profile" className="block">
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        Profile Settings
                      </Button>
                    </Link>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full"
                      onClick={handleSignOut}
                    >
                      Sign Out
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="block">
                  <Button variant="ghost" size="sm" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/register" className="block">
                  <Button variant="primary" size="sm" className="w-full">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
