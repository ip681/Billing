export interface Counterparty {
  id: number
  name: string
  eik: string
  vat_number: string | null
  address: string
  mol: string | null
  email: string | null
  phone: string | null
  created_at: string
  updated_at: string
}

export interface CounterpartyInput {
  name: string
  eik: string
  vat_number: string | null
  address: string
  mol: string | null
  email: string | null
  phone: string | null
}
