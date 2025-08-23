'use client'

import { useEffect, useState } from 'react'
import { createClient, Database } from '@/lib/supabase'
import { Session } from '@supabase/supabase-js'
import BossTracker from '@/components/BossTracker'
import AuthButton from '@/components/AuthButton'
import LoginModal from '@/components/LoginModal'
import { Container, Typography, Box, AppBar, Toolbar, IconButton } from '@mui/material'
import { Login } from '@mui/icons-material'

export default function Home() {

  type Boss = Database["public"]["Tables"]["bosses"]["Row"]
  type Death = Database["public"]["Tables"]["boss_deaths"]["Row"]

  const [session, setSession] = useState<Session | null>(null)
  const [bosses, setBosses] = useState<Boss[]>([])
  const [deaths, setDeaths] = useState<Death[]>([])
  const [loading, setLoading] = useState(true)
  const [loginOpen, setLoginOpen] = useState(false)
  
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
        if (session) setLoginOpen(false) // Close login modal on successful login
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
    <>
      <AppBar position="static" sx={{ background: 'rgba(30, 41, 59, 0.9)', backdropFilter: 'blur(10px)' }}>
        <Toolbar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'white' }}>
              Lord Nine Boss Tracker
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
              Track boss spawn times and never miss a fight
            </Typography>
          </Box>
          
          {session ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Welcome, {session.user.email}
              </Typography>
              <AuthButton />
            </Box>
          ) : (
            <IconButton 
              color="inherit" 
              onClick={() => setLoginOpen(true)}
              sx={{ 
                opacity: 0.7,
                '&:hover': { opacity: 1 }
              }}
            >
              <Login />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <BossTracker bosses={bosses} deaths={deaths} isAuthenticated={!!session} />
      </Container>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  )
}