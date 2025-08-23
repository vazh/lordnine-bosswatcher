'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Typography } from '@mui/material'

interface Boss {
    id: number
    name: string
    level: number
}

interface DeathTimeModalProps {
    open: boolean
    boss: Boss
    onClose: () => void
    onSuccess: () => void
}

export default function DeathTimeModal({ open, boss, onClose, onSuccess }: DeathTimeModalProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [deathTime, setDeathTime] = useState(() => {
        const now = new Date();
        now.setSeconds(0, 0); // round to nearest minute

        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");

        return `${year}-${month}-${day}T${hours}:${minutes}`; // local time
    });


    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                throw new Error('Not authenticated')
            }

            const { error } = await supabase
                .from('boss_deaths')
                .insert({
                    boss_id: boss.id,
                    death_time: new Date(deathTime).toISOString(),
                    user_id: user.id
                })

            if (error) throw error

            onSuccess()
        } catch (error) {
            console.error('Error recording death:', error)
            alert('Failed to record boss death. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Typography variant="h6" component="div">
                    Record Death: {boss.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Level {boss.level}
                </Typography>
            </DialogTitle>

            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <Box sx={{ pt: 1 }}>
                        <TextField
                            fullWidth
                            label="Death Time"
                            type="datetime-local"
                            value={deathTime}
                            onChange={(e) => setDeathTime(e.target.value)}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            required
                        />
                    </Box>
                </DialogContent>

                <DialogActions>
                    <Button onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={isLoading}
                        sx={{
                            background: 'linear-gradient(45deg, #7c3aed 30%, #a855f7 90%)',
                            '&:hover': {
                                background: 'linear-gradient(45deg, #6d28d9 30%, #9333ea 90%)',
                            }
                        }}
                    >
                        {isLoading ? 'Recording...' : 'Record Death'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}