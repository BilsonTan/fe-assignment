import React from 'react'
import { useThemeContext } from '../../context'
import type { Segment } from '../../types'
import './header.css'

const SEGMENTS: { value: Segment; label: string }[] = [
  { value: 'retail', label: 'Retail' },
  { value: 'premium', label: 'Premium' },
]

export const SegmentSwitch: React.FC = () => {
  const { segment, setSegment } = useThemeContext()

  // Arrow keys move between options like a native radiogroup (WAI-ARIA).
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      setSegment(SEGMENTS[(index + 1) % SEGMENTS.length].value)
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      setSegment(SEGMENTS[(index - 1 + SEGMENTS.length) % SEGMENTS.length].value)
    }
  }

  return (
    <div className="segment-switch" role="radiogroup" aria-label="Customer tier">
      {SEGMENTS.map((option, index) => {
        const isActive = segment === option.value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            // Roving tabindex: only the selected option is in the tab order.
            tabIndex={isActive ? 0 : -1}
            className={`segment-btn ${isActive ? 'active' : ''}`}
            onClick={() => setSegment(option.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
