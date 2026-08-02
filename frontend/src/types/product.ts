export interface Product {
  id: number
  name: string
  unit: string
  unit_price: string
  created_at: string
  updated_at: string
}

export interface ProductInput {
  name: string
  unit: string
  unit_price: string
}
