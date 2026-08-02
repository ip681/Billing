import { useState } from 'react'
import { createCompany } from '../api/company'
import { useAuth } from '../auth/AuthContext'
import type { CompanyInput } from '../types/company'

const emptyForm: CompanyInput = {
  name: '',
  eik: '',
  address: '',
  is_vat_registered: false,
  vat_exempt_reason: '',
  invoice_number_prefix: '',
}

function CreateCompanyPage() {
  const { refresh, logout } = useAuth()
  const [form, setForm] = useState<CompanyInput>(emptyForm)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await createCompany({ ...form, vat_exempt_reason: form.vat_exempt_reason || null })
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неуспешно създаване на фирма.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section>
      <h1>Създайте фирма</h1>
      <p className="muted">
        Нямате фирма още. Създайте своя, или помолете собственик да добави вашия email към
        неговата.
      </p>
      <div className="card">
        <form className="wide" onSubmit={handleSubmit}>
          <label>
            Име на фирмата
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
            Адрес
            <input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              required
            />
          </label>
          <label>
            <input
              type="checkbox"
              checked={form.is_vat_registered}
              onChange={(e) => setForm({ ...form, is_vat_registered: e.target.checked })}
            />
            Регистрирано по ДДС
          </label>
          {!form.is_vat_registered && (
            <label>
              Основание за неначисляване на ДДС
              <input
                value={form.vat_exempt_reason ?? ''}
                onChange={(e) => setForm({ ...form, vat_exempt_reason: e.target.value })}
                required
              />
            </label>
          )}
          <label>
            Префикс на номер на фактура
            <input
              value={form.invoice_number_prefix ?? ''}
              onChange={(e) =>
                setForm({ ...form, invoice_number_prefix: e.target.value })
              }
            />
          </label>
          <div className="actions">
            <button type="submit" disabled={saving}>
              {saving ? 'Създаване...' : 'Създай фирма'}
            </button>
            <button type="button" onClick={logout}>
              Изход
            </button>
          </div>
          {error && <p role="alert">{error}</p>}
        </form>
      </div>
    </section>
  )
}

export default CreateCompanyPage
