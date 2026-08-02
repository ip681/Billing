import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { getMe, login as apiLogin, register as apiRegister } from '../api/auth'
import { clearToken, getToken, setToken } from '../api/client'
import type { Company } from '../types/company'
import type { LoginInput, RegisterInput, User } from '../types/auth'

interface AuthContextValue {
  loading: boolean
  user: User | null
  company: Company | null
  login: (data: LoginInput) => Promise<void>
  register: (data: RegisterInput) => Promise<void>
  logout: () => void
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [company, setCompany] = useState<Company | null>(null)

  const refresh = useCallback(async () => {
    if (!getToken()) {
      setUser(null)
      setCompany(null)
      setLoading(false)
      return
    }
    try {
      const me = await getMe()
      setUser(me.user)
      setCompany(me.company)
    } catch {
      clearToken()
      setUser(null)
      setCompany(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function login(data: LoginInput) {
    const auth = await apiLogin(data)
    setToken(auth.access_token)
    await refresh()
  }

  async function register(data: RegisterInput) {
    const auth = await apiRegister(data)
    setToken(auth.access_token)
    await refresh()
  }

  function logout() {
    clearToken()
    setUser(null)
    setCompany(null)
  }

  return (
    <AuthContext.Provider value={{ loading, user, company, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
