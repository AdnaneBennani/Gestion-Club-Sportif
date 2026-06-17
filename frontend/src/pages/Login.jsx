import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router'
import { useAuth } from '../context/AuthContext'
import { ShieldHalf, Loader2 } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname ?? '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      await login({ email, password })
      navigate(from, { replace: true })
    } catch (err) {
      const msg =
        err.response?.data?.errors?.email?.[0] ??
        err.response?.data?.message ??
        'Identifiants incorrects.'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-700 px-4">
      {/* Decorative background circles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 size-96 rounded-full bg-orange-500/10" />
        <div className="absolute -bottom-32 -left-32 size-96 rounded-full bg-brand-blue-500/10" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Card */}
        <div className="rounded-2xl bg-white p-8 shadow-2xl">
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center gap-3">
            <div className="flex items-center justify-center rounded-2xl">
              <img src="/logo.png" alt="" />
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-500">Connectez-vous à votre espace</p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 ring-1 ring-red-200">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy-700">
                Adresse e-mail
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy-700">
                Mot de passe
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 active:bg-orange-700 disabled:opacity-60"
            >
              {isLoading && <Loader2 size={16} className="animate-spin" />}
              Se connecter
            </button>
          </form>
        </div>

        {/* Footer hint */}
        <p className="mt-4 text-center text-xs text-navy-300">
          © {new Date().getFullYear()} Club Sportif — Tous droits réservés
        </p>
      </div>
    </div>
  )
}
