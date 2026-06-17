import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { trainingService } from '../../services/trainingService'
import { teamService } from '../../services/teamService'
import { useAuth } from '../../context/AuthContext'

const inputClass = (hasError) =>
  [
    'w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition',
    hasError
      ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
      : 'border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100',
  ].join(' ')

function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}{required && ' *'}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

const EMPTY = { title: '', date: '', time: '', location: '', description: '', team_id: '' }

export default function TrainingForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { user } = useAuth()
  const isCoach = user?.role === 'coach'

  const [form, setForm] = useState(EMPTY)
  const [teams, setTeams] = useState([])
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Charge les équipes + l'entraînement existant si édition
  useEffect(() => {
    const teamsPromise = isCoach
      ? Promise.resolve([]) // Le coach n'a qu'une seule équipe, team_id est forcé côté API
      : teamService.getAll().then(({ data }) => data)

    const trainingPromise = isEdit
      ? trainingService.getById(id).then(({ data }) => data)
      : Promise.resolve(null)

    Promise.all([teamsPromise, trainingPromise])
      .then(([teamsData, training]) => {
        setTeams(teamsData)
        if (training) {
          setForm({
            title: training.title ?? '',
            date: training.date ?? '',
            time: training.time?.slice(0, 5) ?? '',
            location: training.location ?? '',
            description: training.description ?? '',
            team_id: training.team?.id?.toString() ?? '',
          })
        } else if (isCoach && user.team_id) {
          // Pré-remplir l'équipe du coach à la création
          setForm((prev) => ({ ...prev, team_id: user.team_id.toString() }))
        }
      })
      .catch(() => navigate('/entrainements', { replace: true }))
      .finally(() => setIsLoading(false))
  }, [id, isEdit, isCoach, user, navigate])

  function set(field) {
    return (e) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErrors({})
    setIsSubmitting(true)

    const payload = {
      ...form,
      description: form.description || null,
      team_id: form.team_id ? Number(form.team_id) : undefined,
    }

    try {
      if (isEdit) {
        await trainingService.update(id, payload)
      } else {
        await trainingService.create(payload)
      }
      navigate('/entrainements')
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

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 size={28} className="animate-spin text-indigo-400" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => navigate('/entrainements')}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {isEdit ? "Modifier l'entraînement" : 'Planifier un entraînement'}
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {isEdit ? 'Mettez à jour les informations de la séance.' : 'Créez une nouvelle séance.'}
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        {errors._global && (
          <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 ring-1 ring-red-200">
            {errors._global}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Titre */}
          <Field label="Titre de la séance" required error={errors.title}>
            <input
              type="text"
              value={form.title}
              onChange={set('title')}
              placeholder="Ex : Entraînement cardio"
              className={inputClass(!!errors.title)}
            />
          </Field>

          {/* Date + Heure */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Date" required error={errors.date}>
              <input
                type="date"
                value={form.date}
                onChange={set('date')}
                className={inputClass(!!errors.date)}
              />
            </Field>
            <Field label="Heure" required error={errors.time}>
              <input
                type="time"
                value={form.time}
                onChange={set('time')}
                className={inputClass(!!errors.time)}
              />
            </Field>
          </div>

          {/* Lieu */}
          <Field label="Lieu" required error={errors.location}>
            <input
              type="text"
              value={form.location}
              onChange={set('location')}
              placeholder="Ex : Gymnase Central, Salle A"
              className={inputClass(!!errors.location)}
            />
          </Field>

          {/* Équipe */}
          {isCoach ? (
            /* Le coach voit son équipe en lecture seule */
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Équipe</label>
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500">
                <span>Votre équipe (affecté automatiquement)</span>
              </div>
            </div>
          ) : (
            <Field label="Équipe" required error={errors.team_id}>
              <select
                value={form.team_id}
                onChange={set('team_id')}
                className={inputClass(!!errors.team_id)}
              >
                <option value="">— Sélectionner une équipe —</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.category})
                  </option>
                ))}
              </select>
            </Field>
          )}

          {/* Description */}
          <Field label="Description" error={errors.description}>
            <textarea
              value={form.description}
              onChange={set('description')}
              rows={3}
              placeholder="Objectifs, exercices prévus…"
              className={inputClass(!!errors.description)}
            />
          </Field>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/entrainements')}
              disabled={isSubmitting}
              className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting && <Loader2 size={15} className="animate-spin" />}
              {isEdit ? 'Enregistrer' : 'Planifier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
