import { createContext, useContext, useEffect, useState } from 'react'
import api from '../lib/axios'

const AuthContext = createContext(null)

const TOKEN_KEY = 'auth_token'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(() => Boolean(localStorage.getItem(TOKEN_KEY)))

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)

    if (!token) {
      return
    }

    api.defaults.headers.common.Authorization = `Bearer ${token}`

    api
      .get('/api/user')
      .then(({ data }) => setUser(data))
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY)
        delete api.defaults.headers.common.Authorization
      })
      .finally(() => setIsLoading(false))
  }, [])

  async function login({ email, password }) {
    const { data } = await api.post('/api/login', { email, password })

    localStorage.setItem(TOKEN_KEY, data.token)
    api.defaults.headers.common.Authorization = `Bearer ${data.token}`
    setUser(data.user)

    return data.user
  }

  async function logout() {
    await api.post('/api/logout')

    localStorage.removeItem(TOKEN_KEY)
    delete api.defaults.headers.common.Authorization
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
