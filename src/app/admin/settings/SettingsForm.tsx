'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface SettingsFormProps {
  initialRate: string
}

export function SettingsForm({ initialRate }: SettingsFormProps) {
  const router = useRouter()
  const [rate, setRate] = useState(initialRate)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'agent_commission_rate',
          value: rate
        })
      })

      if (!response.ok) {
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
    <form onSubmit={handleSubmit} className="max-w-md">
      <Input
        type="number"
        label="Default Commission Rate (%)"
        value={rate}
        onChange={(e) => setRate(e.target.value)}
        step="0.01"
        min="0"
        max="100"
        required
      />
      <div className="mt-4">
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
      {message && (
        <p className={`mt-2 text-sm ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
          {message}
        </p>
      )}
    </form>
  )
}
