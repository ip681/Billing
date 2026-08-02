import { authFetch } from './client'
import type { Counterparty, CounterpartyInput } from '../types/counterparty'

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => null)
    throw new Error(error?.detail ?? `Request failed: ${response.status}`)
  }
  return response.json()
}

export async function listCounterparties(): Promise<Counterparty[]> {
  const response = await authFetch('/api/counterparties')
  return handleResponse(response)
}

export async function createCounterparty(
  data: CounterpartyInput,
): Promise<Counterparty> {
  const response = await authFetch('/api/counterparties', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return handleResponse(response)
}

export async function updateCounterparty(
  id: number,
  data: CounterpartyInput,
): Promise<Counterparty> {
  const response = await authFetch(`/api/counterparties/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return handleResponse(response)
}

export async function deleteCounterparty(id: number): Promise<void> {
  const response = await authFetch(`/api/counterparties/${id}`, { method: 'DELETE' })
  if (!response.ok) {
    throw new Error(`Delete failed: ${response.status}`)
  }
}
