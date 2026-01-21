'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Home, 
  Trash2,
  Filter,
  Heart,
  TrendingUp,
  Calendar,
  BarChart3,
  CheckCircle2,
  XCircle
} from 'lucide-react'

type PropertyStatus = 'PENDING' | 'APPROVED' | 'SUSPENDED' | 'RENTED' | 'DELETED'

interface Property {
  id: string
  title: string
  location: string
  price: number
  status: PropertyStatus
  created_at: string
  updated_at: string
  favoritesCount: number
}

interface StatusData {
  properties: Property[]
  breakdown: Record<PropertyStatus, number>
  stats: {
    thisWeek: number
    thisMonth: number
    thisYear: number
    approvalRate: number
    rejectionRate: number
    pendingRate: number
  }
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

const statusConfig: Record<PropertyStatus, {
  label: string
  icon: any
  color: string
  bgColor: string
  description: string
}> = {
  PENDING: {
    label: 'Pending Approval',
    icon: Clock,
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50 border-yellow-200',
    description: 'Awaiting admin approval to be listed',
  },
  APPROVED: {
    label: 'Active',
    icon: CheckCircle,
    color: 'text-green-700',
    bgColor: 'bg-green-50 border-green-200',
    description: 'Listed and visible to potential renters',
  },
  SUSPENDED: {
    label: 'Suspended',
    icon: AlertCircle,
    color: 'text-red-700',
    bgColor: 'bg-red-50 border-red-200',
    description: 'Suspended by admin, not visible to public',
  },
  RENTED: {
    label: 'Rented',
    icon: Home,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 border-blue-200',
    description: 'Property has been rented out',
  },
  DELETED: {
    label: 'Deleted',
    icon: Trash2,
    color: 'text-gray-700',
    bgColor: 'bg-gray-50 border-gray-200',
    description: 'Marked for deletion',
  },
}

export default function PropertiesStatusPage() {
  const { data: session } = useSession()
  const [data, setData] = useState<StatusData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<PropertyStatus | 'ALL'>('ALL')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  useEffect(() => {
    fetchData()
  }, [filter, page, limit])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/owner/properties/status?page=${page}&limit=${limit}&status=${filter}`)
      const result = await response.json()
      
      if (response.ok) {
        setData(result)
        setError(null)
      } else {
        setError(result.error || 'Failed to load property status')
        console.error('API Error:', result)
      }
    } catch (error) {
      console.error('Error fetching properties status:', error)
      setError('Network error - please try again')
    } finally {
      setLoading(false)
    }
  }

  const filteredProperties = data?.properties || []

  const handleFilterChange = (newFilter: PropertyStatus | 'ALL') => {
    setFilter(newFilter)
    setPage(1) // Reset to first page when filter changes
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Data</h3>
              <p className="text-red-700 mb-4">{error}</p>
              <button
                onClick={() => {
                  setError(null)
                  setLoading(true)
                  fetchData()
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-500">No data available</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Property Status Overview
          </h1>
          <p className="text-gray-600">
            View and understand the status of all your properties. Only <strong>APPROVED</strong> properties are visible on the public home page.
          </p>
        </div>

        {/* Time-Based Stats */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Listing Activity
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="w-8 h-8 text-blue-600" />
                <span className="text-3xl font-bold text-gray-900">
                  {data.stats.thisWeek}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-700">Listed This Week</p>
              <p className="text-xs text-gray-500 mt-1">Last 7 days</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="w-8 h-8 text-indigo-600" />
                <span className="text-3xl font-bold text-gray-900">
                  {data.stats.thisMonth}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-700">Listed This Month</p>
              <p className="text-xs text-gray-500 mt-1">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="w-8 h-8 text-purple-600" />
                <span className="text-3xl font-bold text-gray-900">
                  {data.stats.thisYear}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-700">Listed This Year</p>
              <p className="text-xs text-gray-500 mt-1">{new Date().getFullYear()}</p>
            </div>
          </div>

          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Status Distribution
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">Approval Rate</span>
                </div>
                <span className="text-3xl font-bold text-green-600">
                  {data.stats.approvalRate}%
                </span>
              </div>
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${data.stats.approvalRate}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {data.breakdown.APPROVED || 0} out of {data.pagination.total} properties approved
                </p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-8 h-8 text-yellow-600" />
                  <span className="text-sm font-medium text-gray-700">Pending Rate</span>
                </div>
                <span className="text-3xl font-bold text-yellow-600">
                  {data.stats.pendingRate}%
                </span>
              </div>
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${data.stats.pendingRate}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {data.breakdown.PENDING || 0} properties awaiting approval
                </p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <XCircle className="w-8 h-8 text-red-600" />
                  <span className="text-sm font-medium text-gray-700">Rejection Rate</span>
                </div>
                <span className="text-3xl font-bold text-red-600">
                  {data.stats.rejectionRate}%
                </span>
              </div>
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${data.stats.rejectionRate}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {data.breakdown.SUSPENDED || 0} properties suspended
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {/* All Properties Card */}
          <button
            onClick={() => handleFilterChange('ALL')}
            className={`p-4 rounded-lg border-2 transition-all ${
              filter === 'ALL'
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Filter className="w-5 h-5 text-indigo-600" />
              <span className="text-2xl font-bold text-gray-900">
                {data.pagination.total}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-700">All Properties</p>
          </button>

          {/* Status Cards */}
          {(['PENDING', 'APPROVED', 'RENTED', 'SUSPENDED', 'DELETED'] as PropertyStatus[]).map((status) => {
            const config = statusConfig[status]
            const count = data.breakdown[status] || 0
            const Icon = config.icon

            return (
              <button
                key={status}
                onClick={() => handleFilterChange(status)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  filter === status
                    ? `border-${config.color.split('-')[1]}-500 ${config.bgColor}`
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`w-5 h-5 ${config.color}`} />
                  <span className="text-2xl font-bold text-gray-900">
                    {count}
                  </span>
                </div>
                <p className={`text-sm font-medium ${config.color}`}>
                  {config.label}
                </p>
              </button>
            )
          })}
        </div>

        {/* Info Box */}
        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">
                Why are only {data.breakdown.APPROVED || 0} properties visible?
              </h3>
              <p className="text-sm text-blue-800">
                Only properties with <strong>APPROVED</strong> status appear on the public home page. 
                Other properties may be pending admin approval, rented out, suspended, or deleted.
              </p>
            </div>
          </div>
        </div>

        {/* Properties List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {filter === 'ALL' ? 'All Properties' : `${statusConfig[filter as PropertyStatus].label} Properties`}
                <span className="ml-2 text-gray-500 font-normal">
                  ({data.pagination.total})
                </span>
              </h2>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Show:</label>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value))
                    setPage(1)
                  }}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
          </div>

          {filteredProperties.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500">
                No properties found{filter !== 'ALL' ? ` with ${statusConfig[filter as PropertyStatus].label.toLowerCase()} status` : ''}.
              </p>
              <Link
                href="/owner/dashboard"
                className="mt-4 inline-block text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredProperties.map((property) => {
                const config = statusConfig[property.status]
                const Icon = config.icon

                return (
                  <div
                    key={property.id}
                    className="px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/properties/${property.id}`}
                          className="text-lg font-medium text-gray-900 hover:text-indigo-600"
                        >
                          {property.title}
                        </Link>
                        <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                          <span>{property.location}</span>
                          <span>{new Intl.NumberFormat(undefined, { style: 'currency', currency: 'ZAR', minimumFractionDigits: 0 }).format(property.price)}/month</span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            {property.favoritesCount}
                          </span>
                        </div>
                        <div className="mt-2 text-xs text-gray-400">
                          Created: {new Date(property.createdAt).toLocaleDateString()} · 
                          Updated: {new Date(property.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="ml-6 flex-shrink-0">
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${config.bgColor} ${config.color}`}
                        >
                          <Icon className="w-4 h-4" />
                          {config.label}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Pagination */}
          {filteredProperties.length > 0 && data.pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((data.pagination.page - 1) * data.pagination.limit) + 1} to{' '}
                  {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of{' '}
                  {data.pagination.total} results
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <div className="flex items-center gap-1">
                    {[...Array(data.pagination.totalPages)].map((_, i) => {
                      const pageNum = i + 1
                      // Show first page, last page, current page, and pages around current
                      if (
                        pageNum === 1 ||
                        pageNum === data.pagination.totalPages ||
                        (pageNum >= page - 1 && pageNum <= page + 1)
                      ) {
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`px-3 py-2 text-sm font-medium rounded-lg ${
                              page === pageNum
                                ? 'bg-indigo-600 text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {pageNum}
                          </button>
                        )
                      } else if (pageNum === page - 2 || pageNum === page + 2) {
                        return <span key={pageNum} className="px-2 text-gray-400">...</span>
                      }
                      return null
                    })}
                  </div>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === data.pagination.totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Status Legend */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Status Descriptions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(statusConfig).map(([status, config]) => {
              const Icon = config.icon
              return (
                <div key={status} className="flex items-start">
                  <Icon className={`w-5 h-5 ${config.color} mt-0.5 mr-3 flex-shrink-0`} />
                  <div>
                    <p className="font-medium text-gray-900">{config.label}</p>
                    <p className="text-sm text-gray-600">{config.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
