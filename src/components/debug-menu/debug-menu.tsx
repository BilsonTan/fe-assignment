import React, { useState } from 'react'
import './debug-menu.css'

export const DebugMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)

  const currentSearch = typeof window !== 'undefined' ? window.location.search : ''
  const params = new URLSearchParams(currentSearch)
  const currentScenario = params.get('scenario') || 'normal'
  const currentDelay = params.get('delay')

  const applyScenario = (scenario: string | null, delay?: string | null) => {
    const nextParams = new URLSearchParams(window.location.search)
    if (scenario) {
      nextParams.set('scenario', scenario)
    } else {
      nextParams.delete('scenario')
    }

    if (delay) {
      nextParams.set('delay', delay)
    } else {
      nextParams.delete('delay')
    }

    const query = nextParams.toString()
    const nextUrl = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`
    window.location.href = nextUrl
  }

  return (
    <div className="debug-menu-container">
      {isOpen && (
        <div
          className="debug-menu-panel"
          role="dialog"
          aria-label="Debug test menu"
        >
          <div className="debug-menu-title">
            <span>Demo Hooks</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close debug menu"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
            >
              ✕
            </button>
          </div>
          <p className="debug-menu-desc">
            Test loading, empty, and error scenarios on the live mock API.
          </p>

          <div className="debug-actions-list">
            <button
              type="button"
              className={`debug-action-btn ${currentScenario === 'normal' && !currentDelay ? 'active' : ''}`}
              onClick={() => applyScenario(null, null)}
            >
              <span>Normal</span>
              <span aria-hidden="true">✓</span>
            </button>

            <button
              type="button"
              className={`debug-action-btn ${currentScenario === 'error' ? 'active' : ''}`}
              onClick={() => applyScenario('error')}
            >
              <span>Trigger Error (?scenario=error)</span>
            </button>

            <button
              type="button"
              className={`debug-action-btn ${currentScenario === 'empty' ? 'active' : ''}`}
              onClick={() => applyScenario('empty')}
            >
              <span>Empty Lists (?scenario=empty)</span>
            </button>

            <button
              type="button"
              className={`debug-action-btn ${currentDelay === '2000' ? 'active' : ''}`}
              onClick={() => applyScenario(currentScenario !== 'normal' ? currentScenario : null, '2000')}
            >
              <span>Slow Network (?delay=2000)</span>
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        className="debug-menu-toggle"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label="Toggle evaluator debug menu"
        title="Open debug menu"
      >
        <span>🛠</span>
        <span>Debug</span>
      </button>
    </div>
  )
}

