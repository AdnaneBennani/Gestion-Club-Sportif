import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import {
  Plus, Trash2, Loader2, CreditCard,
  ChevronLeft, ChevronRight, AlertCircle, CheckCircle2,
} from 'lucide-react'
import { paymentService } from '../../services/paymentService'

// ─── helpers ────────────────────────────────────────────────────────────────

const STATUS = {
  paid: {
    label: 'Payé',
    cls: 'bg-emerald-100 text-emerald-700',
    icon: <CheckCircle2 size={13} className="shrink-0" />,
  },
  late: {
    label: 'En retard',
    cls: 'bg-red-100 text-red-600',
    icon: <AlertCircle size={13} className="shrink-0" />,
  },
}

const PAYMENT_METHODS = ['Espèces', 'Virement', 'Chèque', 'Carte bancaire']

function StatusBadge({ status, paymentId, onStatusChange, isUpdating }) {
  const [showDropdown, setShowDropdown] = useState(false)
  const s = STATUS[status] ?? STATUS.paid

  const handleStatusChange = async (newStatus) => {
    if (newStatus === status) {
      setShowDropdown(false)
      return
    }
    await onStatusChange(paymentId, newStatus)
    setShowDropdown(false)
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={isUpdating}
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold cursor-pointer hover:opacity-80 disabled:opacity-50 ${s.cls}`}
      >
        {s.icon}
        {s.label}
      </button>
      {showDropdown && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 min-w-max">
          {Object.entries(STATUS).map(([key, value]) => (
            <button
              key={key}
              onClick={() => handleStatusChange(key)}
              disabled={isUpdating}
              className={`block w-full text-left px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-50 ${
                key === status ? 'bg-slate-100 font-semibold' : ''
              }`}
            >
              {value.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function PaymentMethodBadge({ method, paymentId, onMethodChange, isUpdating }) {
  const [showDropdown, setShowDropdown] = useState(false)

  const handleMethodChange = async (newMethod) => {
    if (newMethod === method) {
      setShowDropdown(false)
      return
    }
    await onMethodChange(paymentId, newMethod)
    setShowDropdown(false)
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={isUpdating}
        className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold cursor-pointer bg-blue-100 text-blue-700 hover:opacity-80 disabled:opacity-50"
      >
        {method || <span className="text-slate-400">—</span>}
      </button>
      {showDropdown && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 min-w-max">
          <button
            onClick={() => handleMethodChange(null)}
            disabled={isUpdating}
            className={`block w-full text-left px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-50 ${
              !method ? 'bg-slate-100 font-semibold' : ''
            }`}
          >
            Aucune
          </button>
          {PAYMENT_METHODS.map((m) => (
            <button
              key={m}
              onClick={() => handleMethodChange(m)}
              disabled={isUpdating}
              className={`block w-full text-left px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-50 ${
                m === method ? 'bg-slate-100 font-semibold' : ''
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

// ─── Overdue banner ──────────────────────────────────────────────────────────

function OverdueBanner({ count, members, onDismiss }) {
  if (!count) return null
  return (
    <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
          <div>
            <p className="text-sm font-semibold text-red-700">
              {count} membre{count > 1 ? 's' : ''} en retard ce mois-ci
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {members.map((m) => (
                <span key={m.id} className="rounded-full bg-red-100 px-2.5 py-1 text-xs text-red-700">
                  {m.full_name}
                  {m.last_payment_date && (
                    <span className="text-red-400"> · dernier {new Date(m.last_payment_date).toLocaleDateString('fr-FR')}</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
        <button onClick={onDismiss} className="text-red-300 hover:text-red-500 text-lg leading-none">×</button>
      </div>
    </div>
  )
}

// ─── Confirm delete ──────────────────────────────────────────────────────────

function ConfirmDialog({ payment, onConfirm, onCancel, isDeleting }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-red-100">
          <Trash2 size={22} className="text-red-500" />
        </div>
        <h3 className="mb-1 text-base font-semibold text-slate-800">Supprimer ce paiement ?</h3>
        <p className="mb-6 text-sm text-slate-500">
          Paiement de <span className="font-medium text-slate-700">{payment.member?.full_name}</span>{' '}
          pour la période <span className="font-medium text-slate-700">{payment.period}</span>.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 rounded-lg border border-slate-300 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-500 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50"
          >
            {isDeleting && <Loader2 size={14} className="animate-spin" />}
            Supprimer
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main ────────────────────────────────────────────────────────────────────

export default function PaymentsList() {
  const navigate = useNavigate()

  const [payments, setPayments] = useState([])
  const [meta, setMeta] = useState(null)
  const [overdue, setOverdue] = useState(null)       // { overdue_count, data[] }
  const [showOverdue, setShowOverdue] = useState(true)
  const [view, setView] = useState('all')            // 'all' | 'late'
  const [filterMonth, setFilterMonth] = useState('')
  const [filterYear, setFilterYear] = useState('')
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [toDelete, setToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUpdatingPaymentId, setIsUpdatingPaymentId] = useState(null)

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)

  const load = useCallback((p = 1, v = view, month = filterMonth, year = filterYear) => {
    setIsLoading(true)
    const params = { page: p, per_page: 20 }
    if (v === 'late') params.status = 'late'
    if (month) params.month = month
    if (year) params.year = year
    paymentService.getAll(params)
      .then(({ data, meta: m }) => { setPayments(data); setMeta(m) })
      .finally(() => setIsLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Charger la liste + les retards en parallèle au montage
  useEffect(() => {
    load(1, 'all', '', '')
    paymentService.getOverdue().then(setOverdue).catch(() => {})
  }, [load])

  function applyFilters(newView, newMonth, newYear) {
    setPage(1)
    load(1, newView, newMonth, newYear)
  }

  function handleViewChange(v) {
    setView(v)
    applyFilters(v, filterMonth, filterYear)
  }

  function handleMonthChange(m) {
    setFilterMonth(m)
    applyFilters(view, m, filterYear)
  }

  function handleYearChange(y) {
    setFilterYear(y)
    applyFilters(view, filterMonth, y)
  }

  function handlePageChange(p) {
    setPage(p)
    load(p, view, filterMonth, filterYear)
  }

  async function handleDelete() {
    if (!toDelete) return
    setIsDeleting(true)
    try {
      await paymentService.remove(toDelete.id)
      setToDelete(null)
      load(page, view, filterMonth, filterYear)
      paymentService.getOverdue().then(setOverdue).catch(() => {})
    } finally {
      setIsDeleting(false)
    }
  }

  async function handleStatusChange(paymentId, newStatus) {
    setIsUpdatingPaymentId(paymentId)
    try {
      await paymentService.update(paymentId, { status: newStatus })
      load(page, view, filterMonth, filterYear)
      paymentService.getOverdue().then(setOverdue).catch(() => {})
    } finally {
      setIsUpdatingPaymentId(null)
    }
  }

  async function handleMethodChange(paymentId, newMethod) {
    setIsUpdatingPaymentId(paymentId)
    try {
      await paymentService.update(paymentId, { payment_method: newMethod })
      load(page, view, filterMonth, filterYear)
    } finally {
      setIsUpdatingPaymentId(null)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Paiements</h1>
          <p className="mt-1 text-sm text-slate-500">
            {meta ? `${meta.total} paiement${meta.total !== 1 ? 's' : ''}` : ''}
          </p>
        </div>
        <Link
          to="/paiements/creer"
          className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-600"
        >
          <Plus size={16} />
          Enregistrer un paiement
        </Link>
      </div>

      {/* Overdue banner */}
      {showOverdue && overdue?.overdue_count > 0 && (
        <OverdueBanner
          count={overdue.overdue_count}
          members={overdue.data}
          onDismiss={() => setShowOverdue(false)}
        />
      )}

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-3">
        {/* Vue statut */}
        <div className="flex overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm text-sm">
          {[{ value: 'all', label: 'Tous' }, { value: 'late', label: 'En retard' }].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => handleViewChange(value)}
              className={`px-4 py-2 font-medium transition ${view === value ? 'bg-orange-500 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              {label}
              {value === 'late' && overdue?.overdue_count > 0 && (
                <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-xs ${view === 'late' ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'}`}>
                  {overdue.overdue_count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Mois */}
        <select
          value={filterMonth}
          onChange={(e) => handleMonthChange(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm outline-none focus:border-orange-400"
        >
          <option value="">Tous les mois</option>
          {MONTHS_FR.map((m, i) => (
            <option key={i + 1} value={i + 1}>{m}</option>
          ))}
        </select>

        {/* Année */}
        <select
          value={filterYear}
          onChange={(e) => handleYearChange(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm outline-none focus:border-orange-400"
        >
          <option value="">Toutes les années</option>
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 size={28} className="animate-spin text-brand-blue-400" />
          </div>
        ) : payments.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center gap-2 text-slate-400">
            <CreditCard size={32} />
            <p className="text-sm">Aucun paiement trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 text-left">Membre</th>
                  <th className="px-5 py-3 text-left">Période</th>
                  <th className="px-5 py-3 text-left">Date</th>
                  <th className="px-5 py-3 text-right">Montant</th>
                  <th className="px-5 py-3 text-left">Méthode</th>
                  <th className="px-5 py-3 text-left">Statut</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr
                    key={p.id}
                    className={`hover:bg-slate-50 ${p.status === 'late' ? 'bg-red-50/40' : ''}`}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-navy-100 text-xs font-bold text-navy-700">
                          {p.member?.full_name?.[0]}
                        </div>
                        <span className="font-medium text-slate-800">{p.member?.full_name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-600">{p.period}</td>
                    <td className="px-5 py-3.5 text-slate-500">
                      {new Date(p.payment_date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold text-slate-800">
                      {Number(p.amount).toLocaleString('fr-FR')} MAD
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">
                      <PaymentMethodBadge
                        method={p.payment_method}
                        paymentId={p.id}
                        onMethodChange={handleMethodChange}
                        isUpdating={isUpdatingPaymentId === p.id}
                      />
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge
                        status={p.status}
                        paymentId={p.id}
                        onStatusChange={handleStatusChange}
                        isUpdating={isUpdatingPaymentId === p.id}
                      />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end">
                        <button
                          onClick={() => setToDelete(p)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                          title="Supprimer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
          <span>Page {meta.current_page} / {meta.last_page}</span>
          <div className="flex gap-2">
            <button
              disabled={meta.current_page === 1}
              onClick={() => handlePageChange(meta.current_page - 1)}
              className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              disabled={meta.current_page === meta.last_page}
              onClick={() => handlePageChange(meta.current_page + 1)}
              className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Delete dialog */}
      {toDelete && (
        <ConfirmDialog
          payment={toDelete}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
          isDeleting={isDeleting}
        />
      )}
    </div>
  )
}
