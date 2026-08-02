import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import type { CompanyInput } from '../types/company'

const emptyCompany: CompanyInput = {
  name: '',
  eik: '',
  address: '',
  is_vat_registered: false,
  vat_exempt_reason: '',
  invoice_number_prefix: '',
}

function RegisterPage({ onSwitchToLogin }: { onSwitchToLogin: () => void }) {
  const { register } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [createCompanyNow, setCreateCompanyNow] = useState(true)
  const [company, setCompany] = useState<CompanyInput>(emptyCompany)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await register({
        email,
        password,
        full_name: fullName || null,
        company: createCompanyNow
          ? { ...company, vat_exempt_reason: company.vat_exempt_reason || null }
          : null,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неуспешна регистрация.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section>
      <h1>Регистрация</h1>
      <div className="card">
        <form className="wide" onSubmit={handleSubmit}>
          <label>
            Име
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </label>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            Парола (мин. 8 символа)
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </label>

          <label>
            <input
              type="checkbox"
              checked={createCompanyNow}
              onChange={(e) => setCreateCompanyNow(e.target.checked)}
            />
            Създавам нова фирма сега
          </label>

          {createCompanyNow ? (
            <>
              <label>
                Име на фирмата
                <input
                  value={company.name}
                  onChange={(e) => setCompany({ ...company, name: e.target.value })}
                  required
                />
              </label>
              <label>
                ЕИК
                <input
                  value={company.eik}
                  onChange={(e) => setCompany({ ...company, eik: e.target.value })}
                  required
                />
              </label>
              <label>
                Адрес
                <input
                  value={company.address}
                  onChange={(e) => setCompany({ ...company, address: e.target.value })}
                  required
                />
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={company.is_vat_registered}
                  onChange={(e) =>
                    setCompany({ ...company, is_vat_registered: e.target.checked })
                  }
                />
                Регистрирано по ДДС
              </label>
              {!company.is_vat_registered && (
                <label>
                  Основание за неначисляване на ДДС
                  <input
                    value={company.vat_exempt_reason ?? ''}
                    onChange={(e) =>
                      setCompany({ ...company, vat_exempt_reason: e.target.value })
                    }
                    required
                  />
                </label>
              )}
              <label>
                Префикс на номер на фактура
                <input
                  value={company.invoice_number_prefix ?? ''}
                  onChange={(e) =>
                    setCompany({ ...company, invoice_number_prefix: e.target.value })
                  }
                />
              </label>
            </>
          ) : (
            <p className="muted">
              Ще получите достъп, след като собственик на фирма добави вашия email от
              настройките на своята фирма.
            </p>
          )}

          <button type="submit" disabled={saving}>
            {saving ? 'Регистрация...' : 'Регистрирай се'}
          </button>
          {error && <p role="alert">{error}</p>}
        </form>
      </div>
      <p className="muted">
        Вече имате акаунт?{' '}
        <a href="#" onClick={(e) => { e.preventDefault(); onSwitchToLogin() }}>
          Влезте
        </a>
      </p>
    </section>
  )
}

export default RegisterPage
