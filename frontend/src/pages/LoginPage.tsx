import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'

function LoginPage({ onSwitchToRegister }: { onSwitchToRegister: () => void }) {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await login({ email, password })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неуспешен вход.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section>
      <h1>Вход</h1>
      <div className="card">
        <form className="wide" onSubmit={handleSubmit}>
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
            Парола
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <button type="submit" disabled={saving}>
            {saving ? 'Вход...' : 'Влез'}
          </button>
          {error && <p role="alert">{error}</p>}
        </form>
      </div>
      <p className="muted">
        Нямате акаунт?{' '}
        <a href="#" onClick={(e) => { e.preventDefault(); onSwitchToRegister() }}>
          Регистрирайте се
        </a>
      </p>
    </section>
  )
}

export default LoginPage
