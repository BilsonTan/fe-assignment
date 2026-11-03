/**
 * Runtime scenario controller for the debug menu.
 *
 * Why this exists
 * ---------------
 * The brief's demo hooks (`?scenario=error`, `?scenario=empty`, `?delay=…`) are
 * read by the MSW handlers from the *request* URL. The original debug menu set
 * those params on `window.location` and did a full page reload so that
 * `apiFetch` would copy them onto every request.
 *
 * That reload-based approach is brittle in a deployed (static host) build: the
 * hard navigation re-boots the app, which re-registers the MSW service worker,
 * and `main.tsx` races worker startup against a 2.5s timeout. On a cold service
 * worker over HTTPS that handshake can lose the race, MSW silently stops
 * intercepting, and the `/api/...` calls fall through to the static host (404) —
 * so the "simulated error" looked broken in production but fine locally.
 *
 * This module instead persists the active scenario (localStorage). The debug
 * menu writes it here and triggers a normal `window.location.reload()`; on the
 * fresh load this state is read back and `apiFetch` appends the scenario/delay
 * to every request. Because it's an ordinary page load (not a race-y re-entry),
 * the MSW worker starts the same way it does for any visitor — reliable both
 * locally and on the deployed static host.
 */

export type Scenario = 'normal' | 'error' | 'empty'

interface ScenarioState {
  scenario: Scenario
  /** Artificial latency in ms, or null for the handler default (~500ms). */
  delayMs: number | null
}

const STORAGE_KEY = 'meridian_debug_scenario'

function readInitialState(): ScenarioState {
  if (typeof window === 'undefined') {
    return { scenario: 'normal', delayMs: null }
  }

  // Seed from the URL once (so a shared `?scenario=error` link still works),
  // then from localStorage so a manual toggle survives a refresh.
  const params = new URLSearchParams(window.location.search)
  const urlScenario = params.get('scenario')
  const urlDelay = params.get('delay')

  if (urlScenario === 'error' || urlScenario === 'empty' || urlDelay) {
    return {
      scenario:
        urlScenario === 'error' || urlScenario === 'empty'
          ? urlScenario
          : 'normal',
      delayMs: urlDelay ? Number(urlDelay) : null,
    }
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored) as ScenarioState
  } catch {
    // Ignore storage/parse errors and fall back to defaults.
  }

  return { scenario: 'normal', delayMs: null }
}

let state: ScenarioState = readInitialState()
const listeners = new Set<() => void>()

const DEBUG_FLAG_KEY = 'meridian_debug_enabled'

/**
 * The debug menu is a developer/evaluator tool, not a customer feature, so it
 * stays hidden unless explicitly enabled with `?debug=1` in the URL. The flag
 * is persisted so it survives the reloads the menu triggers; append
 * `?debug=0` to hide it again.
 */
export function isDebugEnabled(): boolean {
  if (typeof window === 'undefined') return false

  const params = new URLSearchParams(window.location.search)
  const flag = params.get('debug')

  try {
    if (flag === '1') {
      localStorage.setItem(DEBUG_FLAG_KEY, '1')
      return true
    }
    if (flag === '0') {
      localStorage.removeItem(DEBUG_FLAG_KEY)
      return false
    }
    return localStorage.getItem(DEBUG_FLAG_KEY) === '1'
  } catch {
    return flag === '1'
  }
}

function persist(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Non-fatal: the scenario still applies for this session.
  }
}

export function getScenarioState(): ScenarioState {
  return state
}

export function setScenario(scenario: Scenario): void {
  state = { ...state, scenario }
  persist()
  listeners.forEach((fn) => fn())
}

export function setDelay(delayMs: number | null): void {
  state = { ...state, delayMs }
  persist()
  listeners.forEach((fn) => fn())
}

export function subscribeScenario(fn: () => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
