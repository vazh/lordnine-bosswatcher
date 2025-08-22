export interface RespawnData {
  respawn_minutes: number
}

export interface ScheduleEntry {
  day: number   // 1 = Monday? or whatever convention you use
  hour: number
  minute: number
}

export interface ScheduleData {
  schedule: ScheduleEntry[]
}

export type SpawnData = RespawnData | ScheduleData

export interface Boss {
  id: number
  name: string
  level: number
  spawn_type: 'fixed_schedule' | 'respawn_timer'
  spawn_data: SpawnData
}

export interface BossDeath {
  id: number
  boss_id: number
  death_time: string
  user_id: string | null
}

export interface BossTrackerProps {
  bosses: Boss[]
  deaths: BossDeath[]
  isAuthenticated: boolean
}