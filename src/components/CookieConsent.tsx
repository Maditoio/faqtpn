'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  const [preferences, setPreferences] = useState({
    necessary: true, // Always true, can't be disabled
    analytics: false,
    marketing: false,
  })

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookieConsent')
    if (!consent) {
      // Show banner after a short delay for better UX
      setTimeout(() => setShowBanner(true), 1000)
    } else {
      // Load saved preferences
      try {
        const saved = JSON.parse(consent)
        setPreferences(saved)
      } catch (e) {
        console.error('Error parsing cookie consent:', e)
      }
    }
  }, [])

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
    }
    savePreferences(allAccepted)
  }

  const handleRejectAll = () => {
    const onlyNecessary = {
      necessary: true,
      analytics: false,
      marketing: false,
    }
    savePreferences(onlyNecessary)
  }

  const handleSavePreferences = () => {
    savePreferences(preferences)
  }

  const savePreferences = (prefs: typeof preferences) => {
    localStorage.setItem('cookieConsent', JSON.stringify(prefs))
    localStorage.setItem('cookieConsentDate', new Date().toISOString())
    setPreferences(prefs)
    setShowBanner(false)
    setShowPreferences(false)
    
    // Here you can initialize analytics/marketing scripts based on consent
    if (prefs.analytics) {
      // Initialize analytics (e.g., Google Analytics)
      console.log('Analytics enabled')
    }
    if (prefs.marketing) {
      // Initialize marketing pixels (e.g., Facebook Pixel)
      console.log('Marketing cookies enabled')
    }
  }

  const handleShowPreferences = () => {
    setShowPreferences(true)
  }

  const handleClosePreferences = () => {
    setShowPreferences(false)
  }

  if (!showBanner) {
    return null
  }

  return (
    <>
      {/* Cookie Banner */}
      {!showPreferences && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-4 border-blue-600 shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex-1">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">
                    We Value Your Privacy
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
                    By clicking "Accept All", you consent to our use of cookies.{' '}
                    <button
                      onClick={handleShowPreferences}
                      className="text-blue-600 hover:text-blue-700 underline font-medium"
                    >
                      Customize preferences
                    </button>
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <Button
                  variant="secondary"
                  onClick={handleRejectAll}
                  className="w-full sm:w-auto whitespace-nowrap"
                >
                  Reject All
                </Button>
                <Button
                  variant="primary"
                  onClick={handleAcceptAll}
                  className="w-full sm:w-auto whitespace-nowrap bg-blue-600 hover:bg-blue-700"
                >
                  Accept All
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cookie Preferences Modal */}
      {showPreferences && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">Cookie Preferences</h3>
                <p className="text-gray-600">
                  Manage your cookie settings. You can enable or disable different types of cookies below.
                </p>
              </div>
              <button
                onClick={handleClosePreferences}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Necessary Cookies */}
              <div className="border-2 border-gray-200 rounded-lg p-5 bg-gray-50">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-bold text-lg text-gray-900 mb-2">
                      Necessary Cookies
                    </h4>
                    <p className="text-sm text-gray-700">
                      These cookies are essential for the website to function properly. They enable basic functions like page navigation and access to secure areas. The website cannot function properly without these cookies.
                    </p>
                  </div>
                  <div className="ml-4">
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">
                      Always Active
                    </div>
                  </div>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="border-2 border-gray-200 rounded-lg p-5 hover:border-blue-300 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-bold text-lg text-gray-900 mb-2">
                      Analytics Cookies
                    </h4>
                    <p className="text-sm text-gray-700">
                      These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve our website and services.
                    </p>
                  </div>
                  <label className="ml-4 relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-8 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className="border-2 border-gray-200 rounded-lg p-5 hover:border-blue-300 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-bold text-lg text-gray-900 mb-2">
                      Marketing Cookies
                    </h4>
                    <p className="text-sm text-gray-700">
                      These cookies are used to track visitors across websites. They are used to display ads that are relevant and engaging for individual users, making them more valuable for publishers and third-party advertisers.
                    </p>
                  </div>
                  <label className="ml-4 relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-8 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Button
                variant="secondary"
                onClick={handleRejectAll}
                className="flex-1"
              >
                Reject All
              </Button>
              <Button
                variant="primary"
                onClick={handleSavePreferences}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Save Preferences
              </Button>
              <Button
                variant="primary"
                onClick={handleAcceptAll}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Accept All
              </Button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              You can change your cookie preferences at any time by clicking the cookie settings link in the footer.
            </p>
          </div>
        </div>
      )}
    </>
  )
}
