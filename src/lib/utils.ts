import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, addMinutes, isAfter, startOfDay, addDays } from 'date-fns'
import { Boss, RespawnData, ScheduleData } from "./boss";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateNextSpawn(boss: Boss, lastDeath?: Date) {
  const now = new Date()
  
  if (boss.spawn_type === 'respawn_timer' && lastDeath) {
    const respawnData = boss.spawn_data as RespawnData
    const nextSpawn = addMinutes(lastDeath, respawnData.respawn_minutes)
    return isAfter(nextSpawn, now) ? nextSpawn : null
  }
  
  if (boss.spawn_type === 'fixed_schedule') {
    const scheduleData = boss.spawn_data as ScheduleData
    const schedule = scheduleData.schedule
    let nextSpawn: Date | null = null
    
    // Check next 14 days for upcoming spawn
    for (let i = 0; i < 14; i++) {
      const checkDate = addDays(startOfDay(now), i)
      const dayOfWeek = checkDate.getDay()
      
      const todaySpawns = schedule.filter((s: any) => s.day === dayOfWeek)
      
      for (const spawn of todaySpawns) {
        const spawnTime = new Date(checkDate)
        spawnTime.setHours(spawn.hour, spawn.minute, 0, 0)
        
        if (isAfter(spawnTime, now)) {
          if (!nextSpawn || isAfter(nextSpawn, spawnTime)) {
            nextSpawn = spawnTime
          }
        }
      }
    }
    
    return nextSpawn
  }
  
  return null
}

export function formatTimeUntilSpawn(spawnTime: Date) {
  const now = new Date()
  const diff = spawnTime.getTime() - now.getTime()
  
  if (diff <= 0) return 'Available now'
  
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (hours > 24) {
    const days = Math.floor(hours / 24)
    const remainingHours = hours % 24
    return `${days}d ${remainingHours}h ${minutes}m`
  }
  
  return `${hours}h ${minutes}m`
}