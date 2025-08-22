'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Boss {
  id: number
  name: string
  level: number
}

interface DeathTimeFormProps {
  boss: Boss
  onSuccess: () => void
}

export default function DeathTimeForm({ boss, onSuccess }: DeathTimeFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [deathTime, setDeathTime] = useState(() => {
    const now = new Date();

    // If there are any seconds or milliseconds, bump to the next minute
    if (now.getSeconds() > 0 || now.getMilliseconds() > 0) {
      now.setMinutes(now.getMinutes() + 1);
    }

    now.setSeconds(0, 0);

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  })

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Not authenticated')
      }

      const { error } = await supabase
        .from('boss_deaths')
        .insert({
          boss_id: boss.id,
          death_time: new Date(deathTime).toISOString(),
          user_id: user.id
        })

      if (error) throw error

      onSuccess()
    } catch (error) {
      console.error('Error recording death:', error)
      alert('Failed to record boss death. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="deathTime" className="text-slate-300">
          Death Time
        </Label>
        <Input
          id="deathTime"
          type="datetime-local"
          value={deathTime}
          onChange={(e) => setDeathTime(e.target.value)}
          className="bg-slate-700 border-slate-600 text-white"
          required
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {isLoading ? 'Recording...' : 'Record Death'}
        </Button>
      </div>
    </form>
  )
}