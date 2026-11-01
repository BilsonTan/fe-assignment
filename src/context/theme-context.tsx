import React, { createContext, useContext, useEffect, useState } from 'react'
import type { Segment, Theme } from '../types'

interface ThemeContextType {
  theme: Theme
  segment: Segment
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
  toggleSegment: () => void
  setSegment: (segment: Segment) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const THEME_STORAGE_KEY = 'meridian_theme'
const SEGMENT_STORAGE_KEY = 'meridian_segment'

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light'
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null
    if (stored === 'light' || stored === 'dark') return stored
    if (typeof window.matchMedia === 'function') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
    }
    return 'light'
  })

  const [segment, setSegmentState] = useState<Segment>(() => {
    if (typeof window === 'undefined') return 'retail'
    const stored = localStorage.getItem(SEGMENT_STORAGE_KEY) as Segment | null
    if (stored === 'retail' || stored === 'premium') return stored
    return 'retail'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.setAttribute('data-segment', segment)
    localStorage.setItem(SEGMENT_STORAGE_KEY, segment)
  }, [segment])

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  const setTheme = (nextTheme: Theme) => {
    setThemeState(nextTheme)
  }

  const toggleSegment = () => {
    setSegmentState((prev) => (prev === 'retail' ? 'premium' : 'retail'))
  }

  const setSegment = (nextSegment: Segment) => {
    setSegmentState(nextSegment)
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        segment,
        toggleTheme,
        setTheme,
        toggleSegment,
        setSegment,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export const useThemeContext = (): ThemeContextType => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider')
  }
  return context
}
