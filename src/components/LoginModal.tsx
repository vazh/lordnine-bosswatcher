'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  Box, 
  Typography,
  Alert
} from '@mui/material'

interface LoginModalProps {
  open: boolean
  onClose: () => void
}

export default function LoginModal({ open, onClose }: LoginModalProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const supabase = createClient()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setMessage('')

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        setMessage('Check your email for the confirmation link!')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        // Modal will close automatically via useEffect in parent component
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setEmail('')
    setPassword('')
    setError('')
    setMessage('')
    setIsSignUp(false)
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h5" component="div" sx={{ textAlign: 'center', color: 'primary.main', fontWeight: 'bold' }}>
          Lord Nine
        </Typography>
        <Typography variant="subtitle1" sx={{ textAlign: 'center', color: 'text.secondary' }}>
          Boss Tracker
        </Typography>
      </DialogTitle>
      
      <form onSubmit={handleAuth}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {error && (
              <Alert severity="error">{error}</Alert>
            )}
            {message && (
              <Alert severity="success">{message}</Alert>
            )}
            
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              variant="outlined"
            />
            
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              variant="outlined"
            />
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ flexDirection: 'column', gap: 1, p: 3 }}>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading}
            sx={{ 
              py: 1.5,
              background: 'linear-gradient(45deg, #7c3aed 30%, #a855f7 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #6d28d9 30%, #9333ea 90%)',
              }
            }}
          >
            {isLoading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </Button>
          
          <Button
            onClick={() => setIsSignUp(!isSignUp)}
            sx={{ color: 'primary.main' }}
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </Button>
          
          <Button onClick={handleClose} color="inherit">
            Cancel
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}