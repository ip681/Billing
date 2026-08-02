import { useState } from 'react'
import { AuthProvider, useAuth } from './auth/AuthContext'
import CompanySettingsPage from './pages/CompanySettingsPage'
import CounterpartiesPage from './pages/CounterpartiesPage'
import CreateCompanyPage from './pages/CreateCompanyPage'
import InvoicesPage from './pages/InvoicesPage'
import LoginPage from './pages/LoginPage'
import ProductsPage from './pages/ProductsPage'
import RegisterPage from './pages/RegisterPage'
import ReportsPage from './pages/ReportsPage'
import './App.css'

type Page = 'settings' | 'counterparties' | 'products' | 'invoices' | 'reports'

const NAV_ITEMS: { key: Page; label: string }[] = [
  { key: 'invoices', label: 'Фактури' },
  { key: 'reports', label: 'Справки' },
  { key: 'settings', label: 'Настройки на фирмата' },
  { key: 'counterparties', label: 'Контрагенти' },
  { key: 'products', label: 'Продукти' },
]

function AuthGate() {
  const { loading, user, company, logout } = useAuth()
  const [page, setPage] = useState<Page>('invoices')
  const [authView, setAuthView] = useState<'login' | 'register'>('login')

  if (loading) {
    return <p style={{ padding: 24 }}>Зареждане...</p>
  }

  if (!user) {
    return authView === 'login' ? (
      <main>
        <LoginPage onSwitchToRegister={() => setAuthView('register')} />
      </main>
    ) : (
      <main>
        <RegisterPage onSwitchToLogin={() => setAuthView('login')} />
      </main>
    )
  }

  if (!company) {
    return (
      <main>
        <CreateCompanyPage />
      </main>
    )
  }

  return (
    <>
      <nav>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            type="button"
            className={page === item.key ? 'active' : ''}
            onClick={() => setPage(item.key)}
          >
            {item.label}
          </button>
        ))}
        <button type="button" onClick={logout} style={{ marginLeft: 'auto' }}>
          Изход
        </button>
      </nav>
      <main>
        {page === 'settings' && <CompanySettingsPage />}
        {page === 'counterparties' && <CounterpartiesPage />}
        {page === 'products' && <ProductsPage />}
        {page === 'invoices' && <InvoicesPage />}
        {page === 'reports' && <ReportsPage />}
      </main>
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  )
}

export default App
