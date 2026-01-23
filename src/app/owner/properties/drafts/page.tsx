'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { OwnerPropertyNav } from '@/components/owner/OwnerPropertyNav'

interface Draft {
  id: string
  title: string
  description?: string
  propertyType?: string
  price?: number
  location?: string
  bedrooms?: number
  bathrooms?: number
  updatedAt: string
  images?: Array<{ url: string }>
}

export default function DraftsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; draftId: string | null; title: string }>({
    isOpen: false,
    draftId: null,
    title: '',
  })
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchDrafts()
  }, [])

  const fetchDrafts = async () => {
    try {
      const response = await fetch('/api/owner/properties/drafts')
      if (response.ok) {
        const data = await response.json()
        setDrafts(data.drafts)
      }
    } catch (error) {
      console.error('Error fetching drafts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleContinue = (draftId: string) => {
    router.push(`/owner/properties/new?draft=${draftId}`)
  }

  const handleDeleteClick = (draftId: string, title: string) => {
    setDeleteDialog({
      isOpen: true,
      draftId,
      title,
    })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.draftId) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/properties/${deleteDialog.draftId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setDrafts(drafts.filter(d => d.id !== deleteDialog.draftId))
        setDeleteDialog({ isOpen: false, draftId: null, title: '' })
      } else {
        console.error('Failed to delete draft')
      }
    } catch (error) {
      console.error('Error deleting draft:', error)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Secondary Navigation */}
      <OwnerPropertyNav />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Draft Properties</h1>
          <p className="text-gray-600 mt-2">Continue where you left off</p>
        </div>

        {drafts.length === 0 ? (
          <Card>
            <div className="p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No drafts yet</h3>
              <p className="text-gray-600 mb-6">
                Start creating a property listing and save it as a draft to continue later.
              </p>
              <Button
                variant="primary"
                onClick={() => router.push('/owner/properties/new')}
              >
                Create Your First Listing
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {drafts.map((draft) => (
              <Card key={draft.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {draft.images && draft.images.length > 0 ? (
                  <img
                    src={draft.images[0].url}
                    alt={draft.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Draft
                    </span>
                    {draft.propertyType && (
                      <span className="text-xs text-gray-500">
                        {draft.propertyType.replace(/_/g, ' ')}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
                    {draft.title}
                  </h3>
                  
                  {draft.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {draft.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                    {draft.price && (
                      <span className="font-semibold text-blue-600">
                        {new Intl.NumberFormat(undefined, { 
                          style: 'currency', 
                          currency: 'ZAR', 
                          minimumFractionDigits: 0 
                        }).format(draft.price)}/mo
                      </span>
                    )}
                    {draft.bedrooms && (
                      <span>{draft.bedrooms} bed</span>
                    )}
                    {draft.bathrooms && (
                      <span>{draft.bathrooms} bath</span>
                    )}
                  </div>
                  
                  <div className="text-xs text-gray-500 mb-4">
                    Last updated {new Date(draft.updatedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleContinue(draft.id)}
                      className="flex-1"
                    >
                      Continue
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleDeleteClick(draft.id, draft.title)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, draftId: null, title: '' })}
        onConfirm={handleDeleteConfirm}
        title="Delete Draft?"
        message={`Are you sure you want to delete "${deleteDialog.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleting}
      />
    </div>
  )
}
