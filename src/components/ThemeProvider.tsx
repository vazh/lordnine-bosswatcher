'use client'

import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import type { DataGridProps } from '@mui/x-data-grid';
import type { Components } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Components {
    MuiDataGrid?: Components['MuiButton'];
  }
}

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#7c3aed', // Purple
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#a855f7',
    },
    background: {
      default: 'rgba(0, 0, 0, 0)',
      paper: 'rgba(30, 41, 59, 0.8)',
    },
    text: {
      primary: '#ffffff',
      secondary: '#cbd5e1',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(148, 163, 184, 0.1)',
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: 'none',
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
          },
          '& .MuiDataGrid-columnHeaders': {
            borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
            backgroundColor: 'rgba(30, 41, 59, 0.5)',
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: 'rgba(124, 58, 237, 0.1)',
          },
        },
      },
    },
  },
})

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <MuiThemeProvider theme={darkTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  )
}