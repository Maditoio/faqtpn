'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Users,
  Home,
  TrendingUp,
  TrendingDown,
  Building2,
  CheckCircle,
  XCircle,
  Heart,
  Mail,
  DollarSign,
  MapPin,
  BarChart3,
  Activity,
} from 'lucide-react'

interface AdminStats {
  overview: {
    totalUsers: number
    totalOwners: number
    totalProperties: number
    totalRegularUsers: number
    totalFavorites: number
    totalContacts: number
    averagePrice: number
  }
  statusBreakdown: Record<string, number>
  rates: {
    approvalRate: number
    rejectionRate: number
    occupancyRate: number
  }
  growth: {
    newUsers: number
    newProperties: number
    userGrowth: number
    propertyGrowth: number
    range: string
  }
  topOwners: Array<{
    ownerId: string
    _count: number
    owner?: {
      id: string
      name: string | null
      email: string
    }
  }>
  topLocations: Array<{
    location: string
    _count: number
  }>
  propertiesByMonth: Array<{
    month: Date
    count: number
  }>
  usersByRole: Record<string, number>
}

export default function AdminStatsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState('month')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (session?.user?.role !== 'SUPER_ADMIN') {
      router.push('/')
    } else {
      fetchStats()
    }
  }, [session, status, router, timeRange])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/stats?range=${timeRange}`)
      const result = await response.json()

      if (response.ok) {
        setStats(result)
        setError(null)
      } else {
        setError(result.error || 'Failed to load statistics')
      }
    } catch (err) {
      setError('Network error - please try again')
      console.error('Error fetching stats:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <XCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-red-900 text-center mb-2">
              Error Loading Data
            </h3>
            <p className="text-red-700 text-center mb-4">{error}</p>
            <button
              onClick={fetchStats}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Platform Analytics
            </h1>
            <p className="text-gray-600">
              Comprehensive overview of platform performance and activity
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Time Range:</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="year">Last Year</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Platform Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 text-blue-600" />
                <span className="text-3xl font-bold text-gray-900">
                  {stats.overview.totalUsers.toLocaleString()}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-700">Total Users</p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.overview.totalRegularUsers} renters, {stats.overview.totalOwners} owners
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <Home className="w-8 h-8 text-indigo-600" />
                <span className="text-3xl font-bold text-gray-900">
                  {stats.overview.totalProperties.toLocaleString()}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-700">Total Properties</p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.statusBreakdown.APPROVED || 0} active listings
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <Heart className="w-8 h-8 text-pink-600" />
                <span className="text-3xl font-bold text-gray-900">
                  {stats.overview.totalFavorites.toLocaleString()}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-700">Total Favorites</p>
              <p className="text-xs text-gray-500 mt-1">User engagement</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <Mail className="w-8 h-8 text-green-600" />
                <span className="text-3xl font-bold text-gray-900">
                  {stats.overview.totalContacts.toLocaleString()}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-700">Property Contacts</p>
              <p className="text-xs text-gray-500 mt-1">Owner inquiries</p>
            </div>
          </div>
        </div>

        {/* Growth Metrics */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Growth Metrics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">New Users</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {stats.growth.newUsers.toLocaleString()}
                  </p>
                </div>
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                  stats.growth.userGrowth >= 0 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {stats.growth.userGrowth >= 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  {Math.abs(stats.growth.userGrowth)}%
                </div>
              </div>
              <p className="text-xs text-gray-500">
                in last {stats.growth.range === 'week' ? '7 days' : stats.growth.range === 'month' ? '30 days' : stats.growth.range === 'year' ? 'year' : 'period'}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">New Properties</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {stats.growth.newProperties.toLocaleString()}
                  </p>
                </div>
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                  stats.growth.propertyGrowth >= 0 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {stats.growth.propertyGrowth >= 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  {Math.abs(stats.growth.propertyGrowth)}%
                </div>
              </div>
              <p className="text-xs text-gray-500">
                in last {stats.growth.range === 'week' ? '7 days' : stats.growth.range === 'month' ? '30 days' : stats.growth.range === 'year' ? 'year' : 'period'}
              </p>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Performance Metrics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <span className="text-3xl font-bold text-green-600">
                  {stats.rates.approvalRate}%
                </span>
              </div>
              <p className="text-sm font-medium text-gray-700">Approval Rate</p>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${stats.rates.approvalRate}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <XCircle className="w-8 h-8 text-red-600" />
                <span className="text-3xl font-bold text-red-600">
                  {stats.rates.rejectionRate}%
                </span>
              </div>
              <p className="text-sm font-medium text-gray-700">Rejection Rate</p>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-600 h-2 rounded-full transition-all"
                  style={{ width: `${stats.rates.rejectionRate}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <Building2 className="w-8 h-8 text-blue-600" />
                <span className="text-3xl font-bold text-blue-600">
                  {stats.rates.occupancyRate}%
                </span>
              </div>
              <p className="text-sm font-medium text-gray-700">Occupancy Rate</p>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${stats.rates.occupancyRate}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 text-purple-600" />
                <span className="text-2xl font-bold text-gray-900">
                  TSh {(stats.overview.averagePrice / 1000).toFixed(0)}k
                </span>
              </div>
              <p className="text-sm font-medium text-gray-700">Avg. Price</p>
              <p className="text-xs text-gray-500 mt-1">Per month</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Top Owners */}
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Top Property Owners
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {stats.topOwners.slice(0, 5).map((owner, index) => (
                  <div key={owner.ownerId} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-semibold text-sm">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900">
                          {owner.owner?.name || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-500">{owner.owner?.email}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                      {owner._count} properties
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Locations */}
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Popular Locations
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {stats.topLocations.slice(0, 5).map((location, index) => (
                  <div key={location.location} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600 font-semibold text-sm">
                        {index + 1}
                      </span>
                      <p className="font-medium text-gray-900">{location.location}</p>
                    </div>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                      {location._count} properties
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/admin/properties"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Home className="w-8 h-8 text-indigo-600" />
              <div>
                <p className="font-medium text-gray-900">Manage Properties</p>
                <p className="text-sm text-gray-500">Review and approve listings</p>
              </div>
            </Link>
            <Link
              href="/admin/users"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">Manage Users</p>
                <p className="text-sm text-gray-500">View and manage all users</p>
              </div>
            </Link>
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Activity className="w-8 h-8 text-purple-600" />
              <div>
                <p className="font-medium text-gray-900">Admin Dashboard</p>
                <p className="text-sm text-gray-500">Main admin interface</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
