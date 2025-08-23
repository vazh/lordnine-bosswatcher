'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { calculateNextSpawn, formatTimeUntilSpawn } from '@/lib/utils'
import { Paper, Typography } from '@mui/material'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import DeathTimeModal from './DeathTimeModal'
import { LocalHospital as Skull, Schedule } from '@mui/icons-material'
import { format } from "date-fns";
import { Boss, BossDeath, BossTrackerProps } from '@/lib/boss'

export default function BossTracker({ bosses, deaths, isAuthenticated }: BossTrackerProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedBoss, setSelectedBoss] = useState<Boss | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

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
        return { status: 'Unknown', nextSpawn: null }
      }
      return { status: 'Available', nextSpawn: null }
    }

    const timeUntil = formatTimeUntilSpawn(nextSpawn)
    if (timeUntil === 'Available now') {
      return { status: 'Available', nextSpawn }
    }

    return { status: timeUntil, nextSpawn }
  }

  const handleDeathRecorded = () => {
    setIsModalOpen(false)
    window.location.reload() // Simple refresh
  }

  // Prepare data for DataGrid
  const rows = bosses.map(boss => {
    const lastDeath = getLastDeath(boss.id)
    const statusInfo = getBossStatus(boss)

    return {
      id: boss.id,
      level: boss.level,
      name: boss.name,
      lastDeath: lastDeath ? format(lastDeath, "dd-MM-yyyy HH:mm") : 'Not recorded',
      nextSpawnStatus: statusInfo.nextSpawn
        ? `${format(statusInfo.nextSpawn, "dd-MM-yyyy HH:mm")} (${statusInfo.status})`
        : statusInfo.status,
      boss: boss // Keep full boss object for actions
    }
  })

  // Define columns
  const baseColumns: GridColDef[] = [
    {
      field: 'level',
      headerName: 'Level',
      width: 100,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'name',
      headerName: 'Boss Name',
      width: 200,
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'lastDeath',
      headerName: 'Last Death',
      width: 200,
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {params.value !== 'Not recorded' && <Skull sx={{ color: 'error.main', fontSize: 18 }} />}
          <Typography variant="body2" color={params.value === 'Not recorded' ? 'text.secondary' : 'text.primary'}>
            {params.value}
          </Typography>
        </div>
      ),
    },
    {
      field: 'nextSpawnStatus',
      headerName: 'Next Spawn (Status)',
      width: 250,
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Schedule sx={{ color: 'info.main', fontSize: 18 }} />
          <Typography variant="body2">
            {params.value}
          </Typography>
        </div>
      ),
    },
  ]

  // Add action column only if authenticated
  const columns = isAuthenticated ? [
    ...baseColumns,
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <button
          onClick={() => {
            setSelectedBoss(params.row.boss)
            setIsModalOpen(true)
          }}
          style={{
            background: 'linear-gradient(45deg, #7c3aed 30%, #a855f7 90%)',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.3s ease',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.4)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          Record Death
        </button>
      ),
    },
  ] : baseColumns

  return (
    <>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3, color: 'primary.main', fontWeight: 'bold' }}>
          Boss Spawn Status
        </Typography>

        <div style={{ height: '100%', width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSizeOptions={[50]}
            rowSelection={false}
            sx={{
              '& .MuiDataGrid-root': {
                border: 'none',
              },
            }}
          />
        </div>
      </Paper>

      {selectedBoss && (
        <DeathTimeModal
          open={isModalOpen}
          boss={selectedBoss}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleDeathRecorded}
        />
      )}
    </>
  )
}