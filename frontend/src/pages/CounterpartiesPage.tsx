import { useEffect, useState } from 'react'
import {
  createCounterparty,
  deleteCounterparty,
  listCounterparties,
  updateCounterparty,
} from '../api/counterparties'
import type { Counterparty, CounterpartyInput } from '../types/counterparty'

const emptyForm: CounterpartyInput = {
  name: '',
  eik: '',
  vat_number: '',
  address: '',
  mol: '',
  email: '',
  phone: '',
}

function CounterpartiesPage() {
  const [counterparties, setCounterparties] = useState<Counterparty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<CounterpartyInput>(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  function refresh() {
    setLoading(true)
    listCounterparties()
      .then(setCounterparties)
      .catch(() => setError('Контрагентите не могат да се заредят.'))
      .finally(() => setLoading(false))
  }

  useEffect(refresh, [])

  function startEdit(counterparty: Counterparty) {
    setEditingId(counterparty.id)
    setForm({
      name: counterparty.name,
      eik: counterparty.eik,
      vat_number: counterparty.vat_number ?? '',
      address: counterparty.address,
      mol: counterparty.mol ?? '',
      email: counterparty.email ?? '',
      phone: counterparty.phone ?? '',
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(emptyForm)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const payload: CounterpartyInput = {
      ...form,
      vat_number: form.vat_number || null,
      mol: form.mol || null,
      email: form.email || null,
      phone: form.phone || null,
    }
    try {
      if (editingId === null) {
        await createCounterparty(payload)
      } else {
        await updateCounterparty(editingId, payload)
      }
      cancelEdit()
      refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неуспешен запис.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Изтриване на този контрагент?')) return
    try {
      await deleteCounterparty(id)
      refresh()
    } catch {
      setError('Изтриването не бе успешно.')
    }
  }

  return (
    <section>
      <h1>Контрагенти</h1>

      <div className="card">
        <form className="wide" onSubmit={handleSubmit}>
          <h2>{editingId === null ? 'Нов контрагент' : 'Редакция на контрагент'}</h2>
          <label>
            Име
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </label>

          <label>
            ЕИК
            <input
              value={form.eik}
              onChange={(e) => setForm({ ...form, eik: e.target.value })}
              required
            />
          </label>

          <label>
            ДДС номер
            <input
              value={form.vat_number ?? ''}
              onChange={(e) => setForm({ ...form, vat_number: e.target.value })}
            />
          </label>

          <label>
            Адрес
            <input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              required
            />
          </label>

          <label>
            МОЛ
            <input
              value={form.mol ?? ''}
              onChange={(e) => setForm({ ...form, mol: e.target.value })}
            />
          </label>

          <label>
            Имейл
            <input
              value={form.email ?? ''}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </label>

          <label>
            Телефон
            <input
              value={form.phone ?? ''}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </label>

          <div className="actions">
            <button type="submit" disabled={saving}>
              {editingId === null ? 'Добави' : 'Запази промените'}
            </button>
            {editingId !== null && (
              <button type="button" onClick={cancelEdit}>
                Отказ
              </button>
            )}
          </div>

          {error && <p role="alert">{error}</p>}
        </form>
      </div>

      <div className="card">
        <h2>Списък с контрагенти</h2>
        {loading ? (
          <p className="muted">Зареждане...</p>
        ) : counterparties.length === 0 ? (
          <p className="muted">Няма добавени контрагенти.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Име</th>
                <th>ЕИК</th>
                <th>Адрес</th>
                <th>Имейл</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {counterparties.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.eik}</td>
                  <td>{c.address}</td>
                  <td>{c.email}</td>
                  <td>
                    <div className="actions">
                      <button type="button" onClick={() => startEdit(c)}>
                        Редакция
                      </button>
                      <button
                        type="button"
                        className="btn-danger"
                        onClick={() => handleDelete(c.id)}
                      >
                        Изтрий
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}

export default CounterpartiesPage
