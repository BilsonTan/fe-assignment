import React from 'react'
import { useThemeContext } from '../../context'
import './header.css'

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useThemeContext()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      className="theme-toggle-btn"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="theme-toggle-icon" aria-hidden="true">
        {isDark ? '☼' : '◐'}
      </span>
      <span className="sr-only">
        {isDark ? 'Light mode' : 'Dark mode'}
      </span>
    </button>
  )
}
