import type { Company, CompanyInput } from './company'

export interface User {
  id: number
  email: string
  full_name: string | null
  company_id: number | null
  role: string | null
  created_at: string
}

export interface AuthResponse {
  access_token: string
  user: User
}

export interface MeResponse {
  user: User
  company: Company | null
}

export interface RegisterInput {
  email: string
  password: string
  full_name: string | null
  company: CompanyInput | null
}

export interface LoginInput {
  email: string
  password: string
}
