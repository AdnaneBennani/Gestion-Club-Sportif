import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { memberService } from '../../services/memberService'

function Field({ label, error, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

const inputClass = (hasError) =>
  [
    'w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition',
    hasError
      ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
      : 'border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100',
  ].join(' ')

const EMPTY = {
  first_name: '',
  last_name: '',
  birth_date: '',
  phone: '',
  address: '',
}

export default function MemberForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(isEdit)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load existing member when editing
  useEffect(() => {
    if (!isEdit) return
    memberService
      .getById(id)
      .then(({ data }) => {
        setForm({
          first_name: data.first_name ?? '',
          last_name: data.last_name ?? '',
          birth_date: data.birth_date ?? '',
          phone: data.phone ?? '',
          address: data.address ?? '',
        })
      })
      .catch(() => navigate('/membres', { replace: true }))
      .finally(() => setIsLoading(false))
  }, [id, isEdit, navigate])

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

    const payload = { ...form, address: form.address || null }

    try {
      if (isEdit) {
        await memberService.update(id, payload)
      } else {
        await memberService.create(payload)
      }
      navigate('/membres')
    } catch (err) {
      if (err.response?.status === 422) {
        // Map Laravel validation errors { field: [msg, ...] } → { field: firstMsg }
        const raw = err.response.data.errors ?? {}
        setErrors(Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, v[0]])))
      } else {
        setErrors({ _global: 'Une erreur inattendue est survenue. Veuillez réessayer.' })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 size={28} className="animate-spin text-brand-blue-400" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => navigate('/membres')}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {isEdit ? 'Modifier le membre' : 'Nouveau membre'}
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {isEdit ? 'Mettez à jour les informations du membre.' : 'Remplissez les informations du nouveau membre.'}
          </p>
        </div>
      </div>

      {/* Card */}
      <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        {errors._global && (
          <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 ring-1 ring-red-200">
            {errors._global}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Nom / Prénom */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Prénom *" error={errors.first_name}>
              <input
                type="text"
                value={form.first_name}
                onChange={set('first_name')}
                placeholder="Ali"
                className={inputClass(!!errors.first_name)}
              />
            </Field>
            <Field label="Nom *" error={errors.last_name}>
              <input
                type="text"
                value={form.last_name}
                onChange={set('last_name')}
                placeholder="Benali"
                className={inputClass(!!errors.last_name)}
              />
            </Field>
          </div>

          {/* Date de naissance */}
          <Field label="Date de naissance *" error={errors.birth_date}>
            <input
              type="date"
              value={form.birth_date}
              onChange={set('birth_date')}
              max={new Date().toISOString().split('T')[0]}
              className={inputClass(!!errors.birth_date)}
            />
          </Field>

          {/* Téléphone */}
          <Field label="Téléphone *" error={errors.phone}>
            <input
              type="tel"
              value={form.phone}
              onChange={set('phone')}
              placeholder="0612345678"
              className={inputClass(!!errors.phone)}
            />
          </Field>

          {/* Adresse */}
          <Field label="Adresse" error={errors.address}>
            <textarea
              value={form.address}
              onChange={set('address')}
              rows={3}
              placeholder="12 Rue des Fleurs, Casablanca"
              className={inputClass(!!errors.address)}
            />
          </Field>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/membres')}
              disabled={isSubmitting}
              className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
            >
              {isSubmitting && <Loader2 size={15} className="animate-spin" />}
              {isEdit ? 'Enregistrer les modifications' : 'Créer le membre'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
