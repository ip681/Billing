import { authFetch } from './client'
import type { Invoice, InvoiceCreateInput, InvoiceListItem } from '../types/invoice'

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => null)
    throw new Error(error?.detail ?? `Request failed: ${response.status}`)
  }
  return response.json()
}

export interface InvoiceFilters {
  counterparty_id?: number
  date_from?: string
  date_to?: string
  status?: string
}

export async function listInvoices(filters: InvoiceFilters = {}): Promise<InvoiceListItem[]> {
  const params = new URLSearchParams()
  if (filters.counterparty_id) params.set('counterparty_id', String(filters.counterparty_id))
  if (filters.date_from) params.set('date_from', filters.date_from)
  if (filters.date_to) params.set('date_to', filters.date_to)
  if (filters.status) params.set('status', filters.status)
  const query = params.toString()
  const response = await authFetch(`/api/invoices${query ? `?${query}` : ''}`)
  return handleResponse(response)
}

export async function getInvoice(id: number): Promise<Invoice> {
  const response = await authFetch(`/api/invoices/${id}`)
  return handleResponse(response)
}

export async function createInvoice(data: InvoiceCreateInput): Promise<Invoice> {
  const response = await authFetch('/api/invoices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return handleResponse(response)
}

export async function openInvoicePdf(id: number): Promise<void> {
  const response = await authFetch(`/api/invoices/${id}/pdf`)
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }
  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank')
}
