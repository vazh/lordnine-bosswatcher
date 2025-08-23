'use client'

import { createClient } from '@/lib/supabase'
import { Button } from '@mui/material'
import { Logout } from '@mui/icons-material'

export default function AuthButton() {
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  return (
    <Button
      onClick={handleSignOut}
      variant="outlined"
      startIcon={<Logout />}
      sx={{ 
        borderColor: 'rgba(255, 255, 255, 0.3)',
        color: 'white',
        '&:hover': {
          borderColor: 'rgba(255, 255, 255, 0.5)',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
        }
      }}
    >
      Sign Out
    </Button>
  )
}