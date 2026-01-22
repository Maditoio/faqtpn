'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Badge } from '@/components/ui/Badge'
import Link from 'next/link'

interface PropertyMetric {
  id: string
  title: string
  status: string
  listedDate: string
  rentedDate: string | null
  firstInteractionDate: string | null
  daysToRent: number | null
  daysToFirstInteraction: number | null
  totalFavorites: number
  price: number | null
  bedrooms: number | null
  propertyType: string | null
  location: string | null
}

interface AnalyticsData {
  summary: {
    totalProperties: number
    totalRented: number
    avgDaysToRent: number | null
    avgDaysToFirstInteraction: number | null
    totalFavorites: number
    avgFavoritesPerProperty: number
    statusBreakdown: Record<string, number>
  }
  properties: PropertyMetric[]
}

export default function OwnerAnalytics() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'daysToRent' | 'daysToFirstInteraction' | 'favorites'>('daysToRent')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (session && session.user.role !== 'HOME_OWNER' && session.user.role !== 'SUPER_ADMIN') {
      router.push('/dashboard')
    } else if (status === 'authenticated') {
      fetchAnalytics()
    }
  }, [session, status, router])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/owner/analytics')
      const data = await response.json()
      setAnalytics(data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-gray-500">Failed to load analytics data.</p>
      </div>
    )
  }

  const { summary, properties } = analytics

  // Sort properties based on selected metric
  const sortedProperties = [...properties].sort((a, b) => {
    if (sortBy === 'daysToRent') {
      if (a.daysToRent === null) return 1
      if (b.daysToRent === null) return -1
      return a.daysToRent - b.daysToRent
    } else if (sortBy === 'daysToFirstInteraction') {
      if (a.daysToFirstInteraction === null) return 1
      if (b.daysToFirstInteraction === null) return -1
      return a.daysToFirstInteraction - b.daysToFirstInteraction
    } else {
      return b.totalFavorites - a.totalFavorites
    }
  })

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
      APPROVED: 'success',
      PENDING: 'warning',
      RENTED: 'info',
      DRAFT: 'warning',
      SUSPENDED: 'danger',
      DELETED: 'danger',
    }
    return <Badge variant={variants[status] || 'info'}>{status}</Badge>
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Property Analytics</h1>
          <Link href="/owner/dashboard">
            <button className="text-blue-600 hover:text-blue-800 font-medium">
              ← Back to Dashboard
            </button>
          </Link>
        </div>
        <p className="text-gray-600">
          Track performance metrics for your rental listings
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="text-sm font-medium text-gray-500 mb-2">Total Properties</div>
          <div className="text-3xl font-bold text-gray-900">{summary.totalProperties}</div>
          <div className="text-xs text-gray-500 mt-1">
            {summary.totalRented} rented
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-sm font-medium text-gray-500 mb-2">Avg. Days to Rent</div>
          <div className="text-3xl font-bold text-blue-600">
            {summary.avgDaysToRent !== null ? summary.avgDaysToRent : '—'}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {summary.totalRented > 0 ? `Based on ${summary.totalRented} rentals` : 'No rentals yet'}
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-sm font-medium text-gray-500 mb-2">Avg. Days to First Interest</div>
          <div className="text-3xl font-bold text-green-600">
            {summary.avgDaysToFirstInteraction !== null ? summary.avgDaysToFirstInteraction : '—'}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Time to first favorite/like
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-sm font-medium text-gray-500 mb-2">Total Favorites</div>
          <div className="text-3xl font-bold text-purple-600">{summary.totalFavorites}</div>
          <div className="text-xs text-gray-500 mt-1">
            {summary.avgFavoritesPerProperty} avg. per property
          </div>
        </Card>
      </div>

      {/* Status Breakdown Chart */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Property Status Breakdown</h2>
        <div className="space-y-3">
          {Object.entries(summary.statusBreakdown).map(([status, count]) => {
            if (count === 0) return null
            const percentage = (count / summary.totalProperties) * 100
            return (
              <div key={status}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{status}</span>
                  <span className="text-gray-500">{count} ({percentage.toFixed(0)}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Property Details Table */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Property Performance</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('daysToRent')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                sortBy === 'daysToRent'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Days to Rent
            </button>
            <button
              onClick={() => setSortBy('daysToFirstInteraction')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                sortBy === 'daysToFirstInteraction'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Days to Interest
            </button>
            <button
              onClick={() => setSortBy('favorites')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                sortBy === 'favorites'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Favorites
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Listed Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  First Interest
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Days to Interest
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rented Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Days to Rent
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Favorites
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedProperties.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    No properties found
                  </td>
                </tr>
              ) : (
                sortedProperties.map((property) => (
                  <tr key={property.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                        {property.title}
                      </div>
                      <div className="text-xs text-gray-500">
                        {property.location} • {property.bedrooms || 0} bed
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(property.status)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {formatDate(property.listedDate)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {formatDate(property.firstInteractionDate)}
                    </td>
                    <td className="px-4 py-3">
                      {property.daysToFirstInteraction !== null ? (
                        <span className="text-sm font-semibold text-green-600">
                          {property.daysToFirstInteraction} days
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {formatDate(property.rentedDate)}
                    </td>
                    <td className="px-4 py-3">
                      {property.daysToRent !== null ? (
                        <span className="text-sm font-semibold text-blue-600">
                          {property.daysToRent} days
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {property.totalFavorites}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
