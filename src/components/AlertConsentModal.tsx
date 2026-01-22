'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface AlertConsentModalProps {
  onAccept: () => void
  onDecline: () => void
  isLoading?: boolean
}

export function AlertConsentModal({ onAccept, onDecline, isLoading }: AlertConsentModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-4">
            <svg
              className="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-bold mb-2">Enable Property Alerts?</h2>
          
          <p className="text-gray-600 mb-4">
            Stay updated when new listings match your search criteria, especially in your preferred areas.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">What you&apos;ll receive:</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start">
                <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Real-time notifications when properties match your saved searches</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Instant alerts for new listings in your preferred locations</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Email and in-app notifications (you control preferences)</span>
              </li>
            </ul>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-6">
            <p className="text-xs text-gray-600">
              <span className="font-semibold">Privacy note:</span> You can disable alerts anytime from your profile settings. 
              We only send notifications for properties matching your explicit search criteria.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={onDecline}
              variant="secondary"
              className="flex-1"
              disabled={isLoading}
            >
              Not Now
            </Button>
            <Button
              onClick={onAccept}
              variant="primary"
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? 'Enabling...' : 'Enable Alerts'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
