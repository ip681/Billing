import { useEffect, useState } from 'react'
import { listCounterparties } from '../api/counterparties'
import { createInvoice, downloadInvoicePdf, getInvoice, listInvoices } from '../api/invoices'
import { listProducts } from '../api/products'
import type { Counterparty } from '../types/counterparty'
import type { Invoice, InvoiceListItem } from '../types/invoice'
import type { Product } from '../types/product'

interface LineForm {
  product_id: number | ''
  quantity: string
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10)
}

const STATUS_LABELS: Record<string, string> = {
  issued: 'Издадена',
  draft: 'Чернова',
  paid: 'Платена',
  cancelled: 'Сторнирана',
}

function statusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status
}

function InvoicesPage() {
  const [counterparties, setCounterparties] = useState<Counterparty[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [invoices, setInvoices] = useState<InvoiceListItem[]>([])
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [issueDate, setIssueDate] = useState(todayIsoDate())
  const [counterpartyId, setCounterpartyId] = useState<number | ''>('')
  const [lines, setLines] = useState<LineForm[]>([{ product_id: '', quantity: '1' }])

  const [filterCounterpartyId, setFilterCounterpartyId] = useState<number | ''>('')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')

  function refreshInvoices() {
    listInvoices({
      counterparty_id: filterCounterpartyId || undefined,
      date_from: filterDateFrom || undefined,
      date_to: filterDateTo || undefined,
    })
      .then(setInvoices)
      .catch(() => setError('Фактурите не могат да се заредят.'))
  }

  useEffect(() => {
    Promise.all([listCounterparties(), listProducts(), listInvoices()])
      .then(([cps, prods, invs]) => {
        setCounterparties(cps)
        setProducts(prods)
        setInvoices(invs)
      })
      .catch(() => setError('Данните не могат да се заредят.'))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function applyFilters(e: React.FormEvent) {
    e.preventDefault()
    refreshInvoices()
  }

  function clearFilters() {
    setFilterCounterpartyId('')
    setFilterDateFrom('')
    setFilterDateTo('')
    listInvoices()
      .then(setInvoices)
      .catch(() => setError('Фактурите не могат да се заредят.'))
  }

  function updateLine(index: number, patch: Partial<LineForm>) {
    setLines((prev) => prev.map((line, i) => (i === index ? { ...line, ...patch } : line)))
  }

  function addLine() {
    setLines((prev) => [...prev, { product_id: '', quantity: '1' }])
  }

  function removeLine(index: number) {
    setLines((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (counterpartyId === '') {
      setError('Изберете контрагент.')
      return
    }
    const items = lines.filter((l) => l.product_id !== '')
    if (items.length === 0) {
      setError('Добавете поне един ред с продукт.')
      return
    }

    setSaving(true)
    try {
      const invoice = await createInvoice({
        counterparty_id: counterpartyId,
        issue_date: issueDate,
        items: items.map((l) => ({
          product_id: l.product_id as number,
          quantity: l.quantity,
        })),
      })
      setLines([{ product_id: '', quantity: '1' }])
      setCounterpartyId('')
      setSelectedInvoice(invoice)
      refreshInvoices()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Издаването на фактурата не бе успешно.')
    } finally {
      setSaving(false)
    }
  }

  async function viewInvoice(id: number) {
    setError(null)
    try {
      const invoice = await getInvoice(id)
      setSelectedInvoice(invoice)
    } catch {
      setError('Фактурата не може да се зареди.')
    }
  }

  if (loading) {
    return <p>Зареждане...</p>
  }

  return (
    <section>
      <h1>Фактури</h1>

      <form className="card wide" onSubmit={handleSubmit}>
        <h2>Издаване на нова фактура</h2>
        <label>
          Контрагент
          <select
            value={counterpartyId}
            onChange={(e) =>
              setCounterpartyId(e.target.value ? Number(e.target.value) : '')
            }
            required
          >
            <option value="">— избери —</option>
            {counterparties.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Дата на издаване
          <input
            type="date"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
            required
          />
        </label>

        <table className="line-items">
          <thead>
            <tr>
              <th>Продукт</th>
              <th>Количество</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line, index) => (
              <tr key={index}>
                <td>
                  <select
                    value={line.product_id}
                    onChange={(e) =>
                      updateLine(index, {
                        product_id: e.target.value ? Number(e.target.value) : '',
                      })
                    }
                  >
                    <option value="">— избери —</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.unit_price} лв./{p.unit})
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={line.quantity}
                    onChange={(e) => updateLine(index, { quantity: e.target.value })}
                  />
                </td>
                <td>
                  <button type="button" className="btn-danger" onClick={() => removeLine(index)}>
                    Премахни
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="actions">
          <button type="button" onClick={addLine}>
            + Добави ред
          </button>
          <button type="submit" disabled={saving}>
            {saving ? 'Издаване...' : 'Издай фактура'}
          </button>
        </div>

        {error && <p role="alert">{error}</p>}
      </form>

      <form className="card inline" onSubmit={applyFilters}>
        <h2 style={{ width: '100%' }}>Филтриране</h2>
        <label>
          Контрагент
          <select
            value={filterCounterpartyId}
            onChange={(e) =>
              setFilterCounterpartyId(e.target.value ? Number(e.target.value) : '')
            }
          >
            <option value="">Всички</option>
            {counterparties.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          От дата
          <input
            type="date"
            value={filterDateFrom}
            onChange={(e) => setFilterDateFrom(e.target.value)}
          />
        </label>
        <label>
          До дата
          <input
            type="date"
            value={filterDateTo}
            onChange={(e) => setFilterDateTo(e.target.value)}
          />
        </label>
        <div className="actions">
          <button type="submit">Филтрирай</button>
          <button type="button" onClick={clearFilters}>
            Изчисти
          </button>
        </div>
      </form>

      <div className="card">
        <h2>Издадени фактури</h2>
        {invoices.length === 0 ? (
          <p className="muted">Няма издадени фактури.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Номер</th>
                <th>Дата</th>
                <th>Контрагент</th>
                <th>Обща сума</th>
                <th>Статус</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td>{inv.invoice_number}</td>
                  <td>{inv.issue_date}</td>
                  <td>{inv.counterparty_name}</td>
                  <td>{inv.total} лв.</td>
                  <td>
                    <span className="badge">{statusLabel(inv.status)}</span>
                  </td>
                  <td>
                    <button type="button" onClick={() => viewInvoice(inv.id)}>
                      Преглед
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedInvoice && (
        <div className="card">
          <h2>
            Фактура {selectedInvoice.invoice_number}{' '}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault()
                downloadInvoicePdf(selectedInvoice.id, selectedInvoice.invoice_number)
              }}
            >
              (PDF)
            </a>
          </h2>
          <p>
            <strong>Доставчик:</strong> {selectedInvoice.company_name} (ЕИК{' '}
            {selectedInvoice.company_eik})
            <br />
            {selectedInvoice.company_address}
          </p>
          <p>
            <strong>Получател:</strong> {selectedInvoice.counterparty_name} (ЕИК{' '}
            {selectedInvoice.counterparty_eik})
            <br />
            {selectedInvoice.counterparty_address}
          </p>
          <table>
            <thead>
              <tr>
                <th>Продукт</th>
                <th>Кол.</th>
                <th>Ед. цена</th>
                <th>ДДС %</th>
                <th>Сума</th>
              </tr>
            </thead>
            <tbody>
              {selectedInvoice.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.product_name}</td>
                  <td>
                    {item.quantity} {item.product_unit}
                  </td>
                  <td>{item.product_unit_price}</td>
                  <td>{item.product_vat_rate ?? '—'}</td>
                  <td>{item.line_total}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!selectedInvoice.company_is_vat_registered && selectedInvoice.company_vat_exempt_reason && (
            <p>{selectedInvoice.company_vat_exempt_reason}</p>
          )}
          <p>
            Данъчна основа: {selectedInvoice.subtotal} лв.
            <br />
            ДДС: {selectedInvoice.vat_amount} лв.
            <br />
            <strong>Общо: {selectedInvoice.total} лв.</strong>
          </p>
        </div>
      )}
    </section>
  )
}

export default InvoicesPage
