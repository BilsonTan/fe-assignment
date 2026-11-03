import type { ApiErrorBody } from './types'
import { getScenarioState } from '../mocks/scenario'

/**
 * Small typed fetch wrapper. Build your query functions on top of this.
 *
 * MSW intercepts these requests in the browser and in tests, so the same
 * `/api/...` paths work locally and in the deployed demo.
 */
const BASE_URL = import.meta.env.BASE_URL

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly fields?: Record<string, string>
  readonly meta?: Record<string, unknown>

  constructor(status: number, body: ApiErrorBody | null) {
    super(body?.error.message ?? `Request failed (${status})`)
    this.name = 'ApiError'
    this.status = status
    this.code = body?.error.code ?? 'UNKNOWN'
    this.fields = body?.error.fields
    this.meta = body?.error.meta
  }
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const cleanPath = path.replace(/^\//, '')
  const origin =
    typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : 'http://localhost:5173'
  const url = new URL(`${BASE_URL}${cleanPath}`, origin)

  // Propagate the active demo scenario (error/empty/delay) onto every request
  // so the MSW handlers can honour it. The scenario is persisted to localStorage
  // by the debug menu (see src/mocks/scenario.ts) and read back on a normal page
  // reload, and getScenarioState() only reports a scenario while debug mode is
  // on — so the behaviour is identical in local dev and the deployed build, and
  // never leaks into a non-debug session.
  const { scenario, delayMs } = getScenarioState()
  if (scenario !== 'normal' && !url.searchParams.has('scenario')) {
    url.searchParams.set('scenario', scenario)
  }
  if (delayMs != null && !url.searchParams.has('delay')) {
    url.searchParams.set('delay', String(delayMs))
  }

  const response = await fetch(url.toString(), init)
  const body = (await response.json().catch(() => null)) as
    | T
    | ApiErrorBody
    | null

  if (!response.ok) {
    throw new ApiError(response.status, body as ApiErrorBody | null)
  }

  return body as T
}
