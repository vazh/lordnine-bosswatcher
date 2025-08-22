'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { calculateNextSpawn, formatTimeUntilSpawn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import DeathTimeForm from './DeathTimeForm'
import { Clock, Skull, Calendar } from 'lucide-react'
import { format } from "date-fns";

interface Boss {
  id: number
  name: string
  level: number
  spawn_type: 'fixed_schedule' | 'respawn_timer'
  spawn_data: any
}

interface BossDeath {
  id: number
  boss_id: number
  death_time: string
  user_id: string | null
}

interface BossTrackerProps {
  bosses: Boss[]
  deaths: BossDeath[]
  isAuthenticated: boolean
}

export default function BossTracker({ bosses, deaths, isAuthenticated }: BossTrackerProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedBoss, setSelectedBoss] = useState<Boss | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  const getLastDeath = (bossId: number) => {
    const bossDeath = deaths.find(d => d.boss_id === bossId)
    return bossDeath ? new Date(bossDeath.death_time) : undefined
  }

  const getBossStatus = (boss: Boss) => {
    const lastDeath = getLastDeath(boss.id)
    const nextSpawn = calculateNextSpawn(boss, lastDeath)
    
    if (!nextSpawn) {
      if (boss.spawn_type === 'respawn_timer' && !lastDeath) {
        return { status: 'unknown', text: 'No death recorded', variant: 'secondary' as const }
      }
      return { status: 'available', text: 'Available', variant: 'default' as const }
    }
    
    const timeUntil = formatTimeUntilSpawn(nextSpawn)
    if (timeUntil === 'Available now') {
      return { status: 'available', text: 'Available', variant: 'default' as const }
    }
    
    return { status: 'waiting', text: timeUntil, variant: 'destructive' as const }
  }

  const handleDeathRecorded = () => {
    setIsDialogOpen(false)
    window.location.reload() // Simple refresh - in production, use proper state management
  }

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Boss Spawn Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700">
                <TableHead className="text-slate-300">Level</TableHead>
                <TableHead className="text-slate-300">Boss Name</TableHead>
                <TableHead className="text-slate-300">Last Death</TableHead>
                <TableHead className="text-slate-300">Next Spawn</TableHead>
                <TableHead className="text-slate-300">Status</TableHead>
                <TableHead className="text-slate-300">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bosses.map(boss => {
                const lastDeath = getLastDeath(boss.id)
                const nextSpawn = calculateNextSpawn(boss, lastDeath)
                const status = getBossStatus(boss)
                
                return (
                  <TableRow key={boss.id} className="border-slate-700 hover:bg-slate-700/50">
                    <TableCell className="text-white font-medium">{boss.level}</TableCell>
                    <TableCell className="text-white font-semibold">{boss.name}</TableCell>
                    <TableCell className="text-slate-300">
                      {lastDeath ? (
                        <div className="flex items-center gap-1">
                          <Skull className="h-4 w-4 text-red-400" />
                          {format(lastDeath, "dd-MM-yyyy HH:mm")}
                        </div>
                      ) : (
                        <span className="text-slate-500">Not recorded</span>
                      )}
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {nextSpawn ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-blue-400" />
                          {format(nextSpawn, "dd-MM-yyyy HH:mm")}
                        </div>
                      ) : (
                        <span className="text-slate-500">
                          {boss.spawn_type === 'fixed_schedule' ? 'Check schedule' : 'Unknown'}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.variant} className="font-medium">
                        {status.text}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {isAuthenticated ? (
                        <Dialog open={isDialogOpen && selectedBoss?.id === boss.id} onOpenChange={setIsDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-slate-600 text-white hover:bg-slate-700"
                              onClick={() => setSelectedBoss(boss)}
                            >
                              Record Death
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-slate-800 border-slate-700">
                            <DialogHeader>
                              <DialogTitle className="text-white">
                                Record Death: {selectedBoss?.name}
                              </DialogTitle>
                            </DialogHeader>
                            {selectedBoss && (
                              <DeathTimeForm 
                                boss={selectedBoss} 
                                onSuccess={handleDeathRecorded}
                              />
                            )}
                          </DialogContent>
                        </Dialog>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-slate-600 text-slate-400 cursor-not-allowed opacity-50"
                          disabled
                        >
                          Sign In Required
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}