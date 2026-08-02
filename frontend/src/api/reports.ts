import { authFetch } from './client'
import type { TurnoverByCounterparty, TurnoverByPeriod } from '../types/report'

export interface ReportFilters {
  date_from?: string
  date_to?: string
}

function buildQuery(filters: ReportFilters): string {
  const params = new URLSearchParams()
  if (filters.date_from) params.set('date_from', filters.date_from)
  if (filters.date_to) params.set('date_to', filters.date_to)
  const query = params.toString()
  return query ? `?${query}` : ''
}

export async function getTurnoverByPeriod(
  filters: ReportFilters = {},
): Promise<TurnoverByPeriod[]> {
  const response = await authFetch(`/api/reports/turnover-by-period${buildQuery(filters)}`)
  if (!response.ok) throw new Error(`Request failed: ${response.status}`)
  return response.json()
}

export async function getTurnoverByCounterparty(
  filters: ReportFilters = {},
): Promise<TurnoverByCounterparty[]> {
  const response = await authFetch(`/api/reports/turnover-by-counterparty${buildQuery(filters)}`)
  if (!response.ok) throw new Error(`Request failed: ${response.status}`)
  return response.json()
}
