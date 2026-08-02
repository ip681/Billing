export interface Company {
  id: number
  name: string
  eik: string
  address: string
  is_vat_registered: boolean
  vat_exempt_reason: string | null
  logo_filename: string | null
  next_invoice_number: number
  created_at: string
  updated_at: string
}

export interface CompanyInput {
  name: string
  eik: string
  address: string
  is_vat_registered: boolean
  vat_exempt_reason: string | null
}

export interface CompanyMember {
  id: number
  email: string
  full_name: string | null
  role: string | null
}
