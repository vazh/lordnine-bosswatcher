'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import BossTracker from '@/components/BossTracker'
import AuthButton from '@/components/AuthButton'

export default function Home() {
  const [session, setSession] = useState<any>(null)
  const [bosses, setBosses] = useState<any[]>([])
  const [deaths, setDeaths] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    // Fetch bosses and deaths
    const fetchData = async () => {
      try {
        const [bossesResponse, deathsResponse] = await Promise.all([
          supabase.from('bosses').select('*').order('level', { ascending: true }),
          supabase.from('boss_deaths').select('*').order('created_at', { ascending: false })
        ])

        setBosses(bossesResponse.data || [])
        setDeaths(deathsResponse.data || [])
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-white text-lg">Loading boss data...</div>
        </div>
      </main>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Lord Nine Boss Tracker</h1>
          <p className="text-slate-300">Track boss spawn times and never miss a fight</p>
        </div>
        <div className="flex items-center gap-4">
          {session ? (
            <div className="flex items-center gap-4">
              <span className="text-slate-300">Welcome, {session.user.email}</span>
              <AuthButton />
            </div>
          ) : (
            <a href="/login" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors">
              Sign In to Record Deaths
            </a>
          )}
        </div>
      </div>
      
      <BossTracker bosses={bosses} deaths={deaths} isAuthenticated={!!session} />
    </main>
  )
}