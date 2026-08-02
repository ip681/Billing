import { authFetch } from './client'
import type { Product, ProductInput } from '../types/product'

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => null)
    throw new Error(error?.detail ?? `Request failed: ${response.status}`)
  }
  return response.json()
}

export async function listProducts(): Promise<Product[]> {
  const response = await authFetch('/api/products')
  return handleResponse(response)
}

export async function createProduct(data: ProductInput): Promise<Product> {
  const response = await authFetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return handleResponse(response)
}

export async function updateProduct(id: number, data: ProductInput): Promise<Product> {
  const response = await authFetch(`/api/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return handleResponse(response)
}

export async function deleteProduct(id: number): Promise<void> {
  const response = await authFetch(`/api/products/${id}`, { method: 'DELETE' })
  if (!response.ok) {
    throw new Error(`Delete failed: ${response.status}`)
  }
}
