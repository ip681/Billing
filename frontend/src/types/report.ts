export interface TurnoverByPeriod {
  period: string
  invoice_count: number
  total: string
}

export interface TurnoverByCounterparty {
  counterparty_id: number
  counterparty_name: string
  invoice_count: number
  total: string
}
