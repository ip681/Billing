import { API_BASE_URL, authFetch } from './client'
import type { Company, CompanyInput, CompanyMember } from '../types/company'

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => null)
    const detail = error?.detail
    const message = Array.isArray(detail) ? detail[0]?.msg : detail
    throw new Error(message ?? `Request failed: ${response.status}`)
  }
  return response.json()
}

export async function getCompany(): Promise<Company> {
  const response = await authFetch('/api/company')
  return handleResponse(response)
}

export async function createCompany(data: CompanyInput): Promise<Company> {
  const response = await authFetch('/api/company', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return handleResponse(response)
}

export async function updateCompany(data: CompanyInput): Promise<Company> {
  const response = await authFetch('/api/company', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return handleResponse(response)
}

export function logoUrl(logoFilename: string): string {
  return `${API_BASE_URL}/uploads/${logoFilename}`
}

export async function uploadCompanyLogo(file: File): Promise<Company> {
  const formData = new FormData()
  formData.append('file', file)
  const response = await authFetch('/api/company/logo', {
    method: 'POST',
    body: formData,
  })
  return handleResponse(response)
}

export async function deleteCompanyLogo(): Promise<Company> {
  const response = await authFetch('/api/company/logo', { method: 'DELETE' })
  return handleResponse(response)
}

export async function listMembers(): Promise<CompanyMember[]> {
  const response = await authFetch('/api/company/members')
  return handleResponse(response)
}

export async function addMember(email: string): Promise<CompanyMember> {
  const response = await authFetch('/api/company/members', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  return handleResponse(response)
}

export async function removeMember(userId: number): Promise<void> {
  const response = await authFetch(`/api/company/members/${userId}`, { method: 'DELETE' })
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }
}

export async function leaveCompany(): Promise<void> {
  const response = await authFetch('/api/company/members/leave', { method: 'POST' })
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }
}
