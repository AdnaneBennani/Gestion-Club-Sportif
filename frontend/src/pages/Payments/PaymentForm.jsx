import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { paymentService } from '../../services/paymentService'
import { memberService } from '../../services/memberService'

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

const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

const PAYMENT_METHODS = ['Espèces', 'Virement', 'Chèque', 'Carte bancaire']

export default function PaymentForm() {
  const navigate = useNavigate()
  const now = new Date()

  const [members, setMembers] = useState([])
  const [form, setForm] = useState({
    member_id: '',
    amount: '',
    payment_date: now.toISOString().split('T')[0],
    month: String(now.getMonth() + 1),
    year: String(now.getFullYear()),
    payment_method: '',
  })
  const [errors, setErrors] = useState({})
  const [isLoadingMembers, setIsLoadingMembers] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Années disponibles (3 ans en arrière, 1 en avance)
  const currentYear = now.getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

  useEffect(() => {
    memberService.getAll({ per_page: 500 })
      .then(({ data }) => setMembers(data))
      .finally(() => setIsLoadingMembers(false))
  }, [])

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
      member_id: Number(form.member_id),
      amount: parseFloat(form.amount),
      payment_date: form.payment_date,
      month: Number(form.month),
      year: Number(form.year),
      payment_method: form.payment_method || null,
    }

    try {
      await paymentService.create(payload)
      navigate('/paiements')
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
          onClick={() => navigate('/paiements')}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Enregistrer un paiement</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Le statut sera automatiquement défini comme <span className="font-medium text-emerald-600">Payé</span>.
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
          {/* Membre */}
          <Field label="Membre" required error={errors.member_id}>
            {isLoadingMembers ? (
              <div className="flex h-10 items-center gap-2 text-sm text-slate-400">
                <Loader2 size={14} className="animate-spin" /> Chargement…
              </div>
            ) : (
              <select
                value={form.member_id}
                onChange={set('member_id')}
                className={inputClass(!!errors.member_id)}
              >
                <option value="">— Sélectionner un membre —</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.full_name} ({m.category})
                  </option>
                ))}
              </select>
            )}
          </Field>

          {/* Mois + Année */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Mois" required error={errors.month}>
              <select
                value={form.month}
                onChange={set('month')}
                className={inputClass(!!errors.month)}
              >
                {MONTHS_FR.map((m, i) => (
                  <option key={i + 1} value={i + 1}>{m}</option>
                ))}
              </select>
            </Field>
            <Field label="Année" required error={errors.year}>
              <select
                value={form.year}
                onChange={set('year')}
                className={inputClass(!!errors.year)}
              >
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </Field>
          </div>

          {/* Montant */}
          <Field
            label="Montant (MAD)"
            required
            error={errors.amount}
            hint="Entrez le montant de la cotisation"
          >
            <div className="relative">
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={form.amount}
                onChange={set('amount')}
                placeholder="150.00"
                className={`${inputClass(!!errors.amount)} pr-14`}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
                MAD
              </span>
            </div>
          </Field>

          {/* Date de paiement */}
          <Field label="Date du paiement" required error={errors.payment_date}>
            <input
              type="date"
              value={form.payment_date}
              onChange={set('payment_date')}
              max={now.toISOString().split('T')[0]}
              className={inputClass(!!errors.payment_date)}
            />
          </Field>

          {/* Méthode */}
          <Field label="Méthode de paiement" error={errors.payment_method}>
            <select
              value={form.payment_method}
              onChange={set('payment_method')}
              className={inputClass(!!errors.payment_method)}
            >
              <option value="">— Optionnel —</option>
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </Field>

          {/* Duplicate period warning — rendu visible par l'erreur 422 */}
          {errors.member_id && errors.member_id.includes('période') && (
            <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700 ring-1 ring-amber-200">
              Un paiement existe déjà pour ce membre sur cette période.
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/paiements')}
              disabled={isSubmitting}
              className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoadingMembers}
              className="flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
            >
              {isSubmitting && <Loader2 size={15} className="animate-spin" />}
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
