import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Simple client-side only setup to avoid server component issues
export const createClient = () => createClientComponentClient()

export type Database = {
  public: {
    Tables: {
      bosses: {
        Row: {
          id: number
          name: string
          level: number
          spawn_type: 'fixed_schedule' | 'respawn_timer'
          spawn_data: any
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          level: number
          spawn_type: 'fixed_schedule' | 'respawn_timer'
          spawn_data: any
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          level?: number
          spawn_type?: 'fixed_schedule' | 'respawn_timer'
          spawn_data?: any
          created_at?: string
        }
      }
      boss_deaths: {
        Row: {
          id: number
          boss_id: number
          death_time: string
          user_id: string | null
          created_at: string
        }
        Insert: {
          id?: number
          boss_id: number
          death_time: string
          user_id?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          boss_id?: number
          death_time?: string
          user_id?: string | null
          created_at?: string
        }
      }
    }
  }
}