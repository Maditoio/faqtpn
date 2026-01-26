'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface SettingsFormProps {
  initialRate: string
  initialMapEnabled: boolean
}

export function SettingsForm({ initialRate, initialMapEnabled }: SettingsFormProps) {
  const router = useRouter()
  const [rate, setRate] = useState(initialRate)
  const [mapEnabled, setMapEnabled] = useState(initialMapEnabled)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      // Update credit rate
      const creditResponse = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'owner_credit_rate',
          value: rate
        })
      })

      // Update map feature toggle
      const mapResponse = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'enable_map_view',
          value: mapEnabled ? 'true' : 'false'
        })
      })

      if (!creditResponse.ok || !mapResponse.ok) {
        throw new Error('Failed to update settings')
      }

      setMessage('Settings updated successfully!')
      router.refresh()
    } catch (error) {
      setMessage('Error updating settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="max-w-md">
        <Input
          type="number"
          label="Owner Credit Rate (%)"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          step="0.01"
          min="0"
          max="100"
          required
        />
        <p className="text-sm text-gray-500 mt-1">
          Percentage of listing price credited back to owner wallet when they list properties
        </p>
      </div>

      <div className="max-w-md">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={mapEnabled}
            onChange={(e) => setMapEnabled(e.target.checked)}
            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <div>
            <span className="text-sm font-medium text-gray-900">
              Enable Map View
            </span>
            <p className="text-sm text-gray-500">
              Allow users to view properties on an interactive map
            </p>
          </div>
        </label>
      </div>

      <div className="pt-4">
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
      {message && (
        <p className={`text-sm ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
          {message}
        </p>
      )}
    </form>
  )
}
