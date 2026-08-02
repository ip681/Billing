import { authFetch } from './client'
import type { AuthResponse, LoginInput, MeResponse, RegisterInput } from '../types/auth'

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => null)
    const detail = error?.detail
    const message = Array.isArray(detail) ? detail[0]?.msg : detail
    throw new Error(message ?? `Request failed: ${response.status}`)
  }
  return response.json()
}

export async function register(data: RegisterInput): Promise<AuthResponse> {
  const response = await authFetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return handleResponse(response)
}

export async function login(data: LoginInput): Promise<AuthResponse> {
  const response = await authFetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return handleResponse(response)
}

export async function getMe(): Promise<MeResponse> {
  const response = await authFetch('/api/auth/me')
  return handleResponse(response)
}
