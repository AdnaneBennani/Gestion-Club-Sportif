import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { userService } from '../../services/userService'
import { teamService } from '../../services/teamService'

const inputClass = (hasError) =>
  [
    'w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition',
    hasError
      ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
      : 'border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100',
  ].join(' ')

function Field({ label, required, error, hint, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}{required && ' *'}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

export default function UserForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const [teams, setTeams] = useState([])
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'coach',
    team_id: '',
  })
  const [errors, setErrors] = useState({})
  const [isLoadingTeams, setIsLoadingTeams] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    teamService.getAll({ per_page: 500 })
      .then(({ data }) => setTeams(data))
      .finally(() => setIsLoadingTeams(false))
  }, [])

  useEffect(() => {
    if (isEdit) {
      userService.getById(id)
        .then(({ data }) => {
          setForm({
            name: data.name,
            email: data.email,
            password: '',
            password_confirmation: '',
            role: data.role,
            team_id: data.team_id || '',
          })
        })
        .catch(() => navigate('/utilisateurs'))
    }
  }, [id, isEdit, navigate])

  function set(field) {
    return (e) => {
      const value = e.target.value
      setForm((prev) => {
        const updated = { ...prev, [field]: value }
        if (field === 'role' && value === 'admin') {
          updated.team_id = ''
        }
        return updated
      })
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErrors({})
    setIsSubmitting(true)

    const payload = {
      name: form.name,
      email: form.email,
      role: form.role,
      team_id: form.role === 'coach' ? (form.team_id || null) : null,
    }

    if (form.password) {
      payload.password = form.password
      payload.password_confirmation = form.password_confirmation
    }

    try {
      if (isEdit) {
        await userService.update(id, payload)
      } else {
        await userService.create(payload)
      }
      navigate('/utilisateurs')
    } catch (err) {
      if (err.response?.status === 422) {
        const raw = err.response.data.errors ?? {}
        setErrors(Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, v[0]])))
      } else {
        setErrors({ _global: 'Une erreur inattendue est survenue.' })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => navigate('/utilisateurs')}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {isEdit ? 'Modifier l\'utilisateur' : 'Créer un utilisateur'}
          </h1>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        {errors._global && (
          <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 ring-1 ring-red-200">
            {errors._global}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Nom */}
          <Field label="Nom" required error={errors.name}>
            <input
              type="text"
              value={form.name}
              onChange={set('name')}
              placeholder="Prénom Nom"
              className={inputClass(!!errors.name)}
            />
          </Field>

          {/* Email */}
          <Field label="Email" required error={errors.email}>
            <input
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="utilisateur@example.com"
              className={inputClass(!!errors.email)}
            />
          </Field>

          {/* Mot de passe */}
          <Field
            label="Mot de passe"
            required={!isEdit}
            error={errors.password}
            hint={isEdit ? 'Laissez vide pour conserver le mot de passe actuel' : ''}
          >
            <input
              type="password"
              value={form.password}
              onChange={set('password')}
              placeholder="Minimum 8 caractères"
              className={inputClass(!!errors.password)}
            />
          </Field>

          {/* Confirmation mot de passe */}
          {form.password && (
            <Field label="Confirmer le mot de passe" required error={errors.password_confirmation}>
              <input
                type="password"
                value={form.password_confirmation}
                onChange={set('password_confirmation')}
                placeholder="Confirmation"
                className={inputClass(!!errors.password_confirmation)}
              />
            </Field>
          )}

          {/* Rôle */}
          <Field label="Rôle" required error={errors.role}>
            <select
              value={form.role}
              onChange={set('role')}
              className={inputClass(!!errors.role)}
            >
              <option value="admin">Admin</option>
              <option value="coach">Entraîneur</option>
            </select>
          </Field>

          {/* Équipe (si coach) */}
          {form.role === 'coach' && (
            <Field label="Équipe" required error={errors.team_id}>
              {isLoadingTeams ? (
                <div className="flex h-10 items-center gap-2 text-sm text-slate-400">
                  <Loader2 size={14} className="animate-spin" /> Chargement…
                </div>
              ) : (
                <select
                  value={form.team_id}
                  onChange={set('team_id')}
                  className={inputClass(!!errors.team_id)}
                >
                  <option value="">— Sélectionner une équipe —</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              )}
            </Field>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/utilisateurs')}
              disabled={isSubmitting}
              className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoadingTeams}
              className="flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
            >
              {isSubmitting && <Loader2 size={15} className="animate-spin" />}
              {isEdit ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
