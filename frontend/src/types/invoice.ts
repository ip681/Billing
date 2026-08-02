export interface InvoiceItemInput {
  product_id: number
  quantity: string
}

export interface InvoiceCreateInput {
  counterparty_id: number
  issue_date: string
  items: InvoiceItemInput[]
}

export interface InvoiceItem {
  id: number
  product_id: number | null
  product_name: string
  product_unit: string
  product_unit_price: string
  product_vat_rate: string | null
  quantity: string
  line_subtotal: string
  line_vat: string
  line_total: string
}

export interface Invoice {
  id: number
  invoice_number: string
  issue_date: string
  counterparty_id: number
  counterparty_name: string
  counterparty_eik: string
  counterparty_vat_number: string | null
  counterparty_address: string
  counterparty_mol: string | null
  company_name: string
  company_eik: string
  company_address: string
  company_is_vat_registered: boolean
  company_vat_exempt_reason: string | null
  subtotal: string
  vat_amount: string
  total: string
  status: string
  items: InvoiceItem[]
  created_at: string
  updated_at: string
}

export interface InvoiceListItem {
  id: number
  invoice_number: string
  issue_date: string
  counterparty_name: string
  total: string
  status: string
}
