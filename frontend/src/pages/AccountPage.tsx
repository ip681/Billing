import { useState } from 'react'
import { changePassword } from '../api/auth'
import { useAuth } from '../auth/AuthContext'

function AccountPage() {
  const { user, company } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (newPassword !== confirmPassword) {
      setError('Новите пароли не съвпадат.')
      return
    }

    setSaving(true)
    try {
      await changePassword(currentPassword, newPassword)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неуспешна смяна на паролата.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section>
      <h1>Акаунт</h1>

      <div className="card">
        <div>
          <h2>Данни</h2>
          <p>
            Email: {user?.email}
            <br />
            Име: {user?.full_name ?? '—'}
            <br />
            Роля: {user?.role === 'owner' ? 'Собственик' : 'Член'}
            <br />
            Фирма: {company?.name ?? '—'}
          </p>
        </div>
      </div>

      <div className="card">
        <form className="wide" onSubmit={handleSubmit}>
          <h2>Смяна на парола</h2>
          <label>
            Текуща парола
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </label>
          <label>
            Нова парола (мин. 8 символа)
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={8}
              required
            />
          </label>
          <label>
            Повтори новата парола
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={8}
              required
            />
          </label>
          <button type="submit" disabled={saving}>
            {saving ? 'Запазване...' : 'Смени паролата'}
          </button>
          {error && <p role="alert">{error}</p>}
          {success && <p>Паролата е сменена успешно.</p>}
        </form>
      </div>
    </section>
  )
}

export default AccountPage
