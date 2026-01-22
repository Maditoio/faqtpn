'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import PropertyWizard from '@/components/property/PropertyWizard'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

function PropertyWizardWrapper() {
  const searchParams = useSearchParams()
  const draftId = searchParams.get('draft')
  const [draftData, setDraftData] = useState<any>(null)
  const [loading, setLoading] = useState(!!draftId)
  const [existingDrafts, setExistingDrafts] = useState<any[]>([])
  const [showDraftModal, setShowDraftModal] = useState(false)
  const [checkingDrafts, setCheckingDrafts] = useState(!draftId)

  useEffect(() => {
    if (draftId) {
      fetchDraft(draftId)
    } else {
      // Check for existing drafts when starting new property
      checkForDrafts()
    }
  }, [draftId])

  const checkForDrafts = async () => {
    try {
      const response = await fetch('/api/owner/properties/drafts')
      if (response.ok) {
        const data = await response.json()
        if (data.drafts && data.drafts.length > 0) {
          setExistingDrafts(data.drafts)
          setShowDraftModal(true)
        }
      }
    } catch (error) {
      console.error('Error checking drafts:', error)
    } finally {
      setCheckingDrafts(false)
    }
  }

  const fetchDraft = async (id: string) => {
    try {
      const response = await fetch(`/api/properties/${id}`)
      if (response.ok) {
        const data = await response.json()
        setDraftData(data.property)
      }
    } catch (error) {
      console.error('Error fetching draft:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleContinueDraft = (draft: any) => {
    setShowDraftModal(false)
    window.location.href = `/owner/properties/new?draft=${draft.id}`
  }

  const handleCreateNew = () => {
    setShowDraftModal(false)
    setCheckingDrafts(false)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (loading || checkingDrafts) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <>
      <PropertyWizard draftId={draftId || undefined} initialData={draftData} />
      
      {/* Draft Suggestion Modal */}
      {showDraftModal && existingDrafts.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-3xl font-bold text-gray-900 mb-2">You Have Unfinished Drafts</h3>
            <p className="text-gray-600 mb-6">
              Would you like to continue working on an existing draft or start a new property listing?
            </p>
            
            <div className="space-y-3 mb-6">
              {existingDrafts.map((draft) => (
                <div
                  key={draft.id}
                  className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer group"
                  onClick={() => handleContinueDraft(draft)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-bold text-lg text-gray-900 group-hover:text-blue-700 mb-1">
                        {draft.title || 'Untitled Property'}
                      </h4>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                        {draft.propertyType && (
                          <span className="inline-flex items-center gap-1">
                            <span className="font-medium">Type:</span>
                            <span>{draft.propertyType.replace('_', ' ')}</span>
                          </span>
                        )}
                        {draft.city && (
                          <span className="inline-flex items-center gap-1">
                            <span className="font-medium">Location:</span>
                            <span>{draft.city}</span>
                          </span>
                        )}
                        {draft.price && (
                          <span className="inline-flex items-center gap-1">
                            <span className="font-medium">Price:</span>
                            <span>R{draft.price}</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Last updated: {formatDate(draft.updatedAt)}
                      </p>
                    </div>
                    <button
                      className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleContinueDraft(draft)
                      }}
                    >
                      Continue →
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-6">
              <button
                onClick={handleCreateNew}
                className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all font-medium"
              >
                ✨ Start Fresh with a New Property
              </button>
            </div>

            <p className="text-center text-sm text-gray-500 mt-4">
              💡 Tip: Drafts are saved automatically as you fill in the form
            </p>
          </div>
        </div>
      )}
    </>
  )
}

export default function NewPropertyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <PropertyWizardWrapper />
    </Suspense>
  )
}
