'use client'

import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export default function AuthButton() {
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <Button
      onClick={handleSignOut}
      variant="outline"
      className="border-slate-600 text-white hover:bg-slate-700"
    >
      <LogOut className="h-4 w-4 mr-2" />
      Sign Out
    </Button>
  )
}