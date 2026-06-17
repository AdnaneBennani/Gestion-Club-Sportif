import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import {
  Plus, Pencil, Trash2, Loader2, Dumbbell,
  CalendarDays, Clock, MapPin, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { trainingService } from '../../services/trainingService'
import { teamService } from '../../services/teamService'
import { useAuth } from '../../context/AuthContext'

// ─── helpers ────────────────────────────────────────────────────────────────

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  })
}

function isUpcoming(dateStr) {
  return new Date(dateStr) >= new Date(new Date().toDateString())
}

// ─── Confirm dialog ─────────────────────────────────────────────────────────

function ConfirmDialog({ title, onConfirm, onCancel, isDeleting }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-red-100">
          <Trash2 size={22} className="text-red-500" />
        </div>
        <h3 className="mb-1 text-base font-semibold text-slate-800">Supprimer cet entraînement ?</h3>
        <p className="mb-6 text-sm text-slate-500">
          <span className="font-medium text-slate-700">« {title} »</span> sera supprimé définitivement.
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

// ─── Training row card ───────────────────────────────────────────────────────

function TrainingRow({ training, onEdit, onDelete }) {
  const upcoming = isUpcoming(training.date)

  return (
    <div className={`flex flex-col gap-3 rounded-xl border px-5 py-4 sm:flex-row sm:items-center sm:justify-between ${upcoming ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50 opacity-70'}`}>
      {/* Date block */}
      <div className="flex shrink-0 flex-col items-center justify-center rounded-xl bg-indigo-50 px-4 py-3 text-center w-16">
        <span className="text-xs font-semibold uppercase text-indigo-400">
          {new Date(training.date).toLocaleDateString('fr-FR', { month: 'short' })}
        </span>
        <span className="text-2xl font-bold text-indigo-700 leading-tight">
          {new Date(training.date).getDate()}
        </span>
        <span className="text-xs text-indigo-400">
          {new Date(training.date).getFullYear()}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h3 className="text-sm font-semibold text-slate-800 truncate">{training.title}</h3>
          {training.team && (
            <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
              {training.team.name}
            </span>
          )}
          {!upcoming && (
            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-500">Passé</span>
          )}
        </div>
        <div className="flex flex-wrap gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {training.time.slice(0, 5)}
          </span>
          <span className="flex items-center gap-1">
            <MapPin size={11} />
            {training.location}
          </span>
          {training.description && (
            <span className="italic truncate max-w-xs">{training.description}</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-1 self-end sm:self-auto">
        <button
          onClick={() => onEdit(training.id)}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600"
          title="Modifier"
        >
          <Pencil size={15} />
        </button>
        <button
          onClick={() => onDelete(training)}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
          title="Supprimer"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function TrainingsList() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const isCoach = user?.role === 'coach'

  const [trainings, setTrainings] = useState([])
  const [teams, setTeams] = useState([])
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)
  const [filterTeam, setFilterTeam] = useState('')
  const [filterPeriod, setFilterPeriod] = useState('upcoming') // 'all' | 'upcoming' | 'past'
  const [isLoading, setIsLoading] = useState(true)
  const [toDelete, setToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const load = useCallback((p = 1, teamId = filterTeam, period = filterPeriod) => {
    setIsLoading(true)
    const params = { page: p, per_page: 15 }
    if (teamId) params.team_id = teamId
    if (period === 'upcoming') params.date_from = new Date().toISOString().split('T')[0]
    if (period === 'past') params.date_to = new Date(Date.now() - 86400000).toISOString().split('T')[0]

    trainingService.getAll(params)
      .then(({ data, meta: m }) => { setTrainings(data); setMeta(m) })
      .finally(() => setIsLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Charge les équipes pour le filtre (admin seulement — coach voit toujours la sienne)
  useEffect(() => {
    if (!isCoach) {
      teamService.getAll().then(({ data }) => setTeams(data))
    }
  }, [isCoach])

  useEffect(() => { load(1, filterTeam, filterPeriod) }, [load, filterTeam, filterPeriod])

  function handlePageChange(p) {
    setPage(p)
    load(p, filterTeam, filterPeriod)
  }

  async function handleDelete() {
    if (!toDelete) return
    setIsDeleting(true)
    try {
      await trainingService.remove(toDelete.id)
      setToDelete(null)
      load(page, filterTeam, filterPeriod)
    } finally {
      setIsDeleting(false)
    }
  }

  // Grouper par mois pour un affichage calendaire
  const grouped = trainings.reduce((acc, t) => {
    const key = new Date(t.date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    if (!acc[key]) acc[key] = []
    acc[key].push(t)
    return acc
  }, {})

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Entraînements</h1>
          <p className="mt-1 text-sm text-slate-500">
            {meta ? `${meta.total} séance${meta.total !== 1 ? 's' : ''}` : ''}
          </p>
        </div>
        <Link
          to="/entrainements/creer"
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
        >
          <Plus size={16} />
          Planifier
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-wrap gap-3">
        {/* Période */}
        <div className="flex rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden text-sm">
          {[
            { value: 'upcoming', label: 'À venir' },
            { value: 'all', label: 'Tous' },
            { value: 'past', label: 'Passés' },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => { setPage(1); setFilterPeriod(value) }}
              className={`px-4 py-2 font-medium transition ${filterPeriod === value ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Filtre équipe (admin uniquement) */}
        {!isCoach && teams.length > 0 && (
          <select
            value={filterTeam}
            onChange={(e) => { setPage(1); setFilterTeam(e.target.value) }}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="">Toutes les équipes</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 size={28} className="animate-spin text-indigo-400" />
        </div>
      ) : trainings.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center gap-2 text-slate-400">
          <Dumbbell size={32} />
          <p className="text-sm">Aucun entraînement{filterPeriod === 'upcoming' ? ' à venir' : ''}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {Object.entries(grouped).map(([month, items]) => (
            <div key={month}>
              <div className="mb-3 flex items-center gap-3">
                <CalendarDays size={14} className="text-slate-400" />
                <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 capitalize">
                  {month}
                </span>
                <div className="flex-1 border-t border-slate-100" />
              </div>
              <div className="flex flex-col gap-2">
                {items.map((t) => (
                  <TrainingRow
                    key={t.id}
                    training={t}
                    onEdit={(id) => navigate(`/entrainements/${id}/modifier`)}
                    onDelete={setToDelete}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="mt-5 flex items-center justify-between text-sm text-slate-500">
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
          title={toDelete.title}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
          isDeleting={isDeleting}
        />
      )}
    </div>
  )
}
