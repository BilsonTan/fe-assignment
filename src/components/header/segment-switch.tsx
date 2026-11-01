import React from 'react'
import { useThemeContext } from '../../context'
import './header.css'

export const SegmentSwitch: React.FC = () => {
  const { segment, setSegment } = useThemeContext()

  return (
    <div
      className="segment-switch"
      role="radiogroup"
      aria-label="Customer tier"
    >
      <button
        type="button"
        role="radio"
        aria-checked={segment === 'retail'}
        className={`segment-btn ${segment === 'retail' ? 'active' : ''}`}
        onClick={() => setSegment('retail')}
      >
        Retail
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={segment === 'premium'}
        className={`segment-btn ${segment === 'premium' ? 'active' : ''}`}
        onClick={() => setSegment('premium')}
      >
        Premium
      </button>
    </div>
  )
}
