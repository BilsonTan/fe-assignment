import React, { useState, useSyncExternalStore } from 'react'
import {
  getScenarioState,
  setScenario,
  setDelay,
  subscribeScenario,
  type Scenario,
} from '../../mocks/scenario'
import './debug-menu.css'

export const DebugMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)

  // Subscribe to the persisted scenario store so the active states stay in sync.
  const { scenario, delayMs } = useSyncExternalStore(
    subscribeScenario,
    getScenarioState,
    getScenarioState,
  )

  // Persist the choice, then reload so the whole app re-boots into the new
  // scenario. The scenario is read back from localStorage on startup, so this
  // is a normal page load (the MSW worker starts the same way it does for any
  // visitor) — no service-worker race, works identically locally and deployed.
  const applyAndReload = () => {
    window.location.reload()
  }

  const chooseScenario = (next: Scenario) => {
    setScenario(next)
    applyAndReload()
  }

  const toggleSlowNetwork = () => {
    setDelay(delayMs === 2000 ? null : 2000)
    applyAndReload()
  }

  const resetToNormal = () => {
    setScenario('normal')
    setDelay(null)
    applyAndReload()
  }

  const isNormal = scenario === 'normal' && delayMs == null

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
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'inherit',
              }}
            >
              ✕
            </button>
          </div>
          <p className="debug-menu-desc">
            Simulate loading, empty, and error states. Selecting one reloads the
            app into that scenario.
          </p>

          <div className="debug-actions-list">
            <button
              type="button"
              className={`debug-action-btn ${isNormal ? 'active' : ''}`}
              aria-pressed={isNormal}
              onClick={resetToNormal}
            >
              <span>Normal</span>
              {isNormal && <span aria-hidden="true">✓</span>}
            </button>

            <button
              type="button"
              className={`debug-action-btn ${scenario === 'error' ? 'active' : ''}`}
              aria-pressed={scenario === 'error'}
              onClick={() => chooseScenario('error')}
            >
              <span>Trigger Error (scenario=error)</span>
            </button>

            <button
              type="button"
              className={`debug-action-btn ${scenario === 'empty' ? 'active' : ''}`}
              aria-pressed={scenario === 'empty'}
              onClick={() => chooseScenario('empty')}
            >
              <span>Empty Lists (scenario=empty)</span>
            </button>

            <button
              type="button"
              className={`debug-action-btn ${delayMs === 2000 ? 'active' : ''}`}
              aria-pressed={delayMs === 2000}
              onClick={toggleSlowNetwork}
            >
              <span>Slow Network (delay=2000)</span>
            </button>
          </div>

          <div className="debug-tip-box">
            <span className="debug-tip-label">💡 Test Transfer Failure (T7):</span>
            <span className="debug-tip-text">
              On the <strong>Amount</strong> step, type <code>#fail</code> in the{' '}
              <strong>Note (optional)</strong> field, then continue to Review and
              confirm — the transfer is rejected and your money stays put.
            </span>
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
        <span aria-hidden="true">🛠</span>
        <span>Debug</span>
      </button>
    </div>
  )
}
