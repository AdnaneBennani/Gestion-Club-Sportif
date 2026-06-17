import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { teamService } from '../../services/teamService'

const CATEGORIES = [
  'Poussin', 'Baby', 'Pupille', 'Benjamin',
  'Minime', 'Cadet', 'Junior', 'Senior',
]

const inputClass = (hasError) =>
  [
    'w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition',
    hasError
      ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
      : 'border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100',
  ].join(' ')

export default function TeamForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(isEdit)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isEdit) return
    teamService
      .getById(id)
      .then(({ data }) => {
        setName(data.name ?? '')
        setCategory(data.category ?? '')
      })
      .catch(() => navigate('/equipes', { replace: true }))
      .finally(() => setIsLoading(false))
  }, [id, isEdit, navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    setErrors({})
    setIsSubmitting(true)
    try {
      if (isEdit) {
        await teamService.update(id, { name, category })
      } else {
        await teamService.create({ name, category })
      }
      navigate('/equipes')
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
    <div className="mx-auto max-w-lg">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => navigate('/equipes')}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {isEdit ? "Modifier l'équipe" : 'Nouvelle équipe'}
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {isEdit ? 'Mettez à jour les informations.' : 'Créez une nouvelle équipe.'}
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
          {/* Nom */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Nom de l'équipe *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: undefined })) }}
              placeholder="Ex : Équipe Alpha"
              className={inputClass(!!errors.name)}
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>

          {/* Catégorie */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Catégorie *
            </label>
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setErrors((p) => ({ ...p, category: undefined })) }}
              className={inputClass(!!errors.category)}
            >
              <option value="">— Sélectionner —</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category}</p>}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/equipes')}
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
              {isEdit ? 'Enregistrer' : "Créer l'équipe"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
