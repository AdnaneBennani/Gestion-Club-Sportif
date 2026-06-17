import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router'
import { Plus, Pencil, Trash2, Users, Loader2, ShieldHalf } from 'lucide-react'
import { teamService } from '../../services/teamService'

function ConfirmDialog({ name, membersCount, onConfirm, onCancel, isDeleting }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-red-100">
          <Trash2 size={22} className="text-red-500" />
        </div>
        <h3 className="mb-1 text-base font-semibold text-slate-800">Supprimer cette équipe ?</h3>
        {membersCount > 0 ? (
          <p className="mb-6 text-sm text-amber-600">
            L'équipe <span className="font-medium">{name}</span> contient encore{' '}
            <span className="font-medium">{membersCount} membre(s)</span>. Retirez-les avant de supprimer.
          </p>
        ) : (
          <p className="mb-6 text-sm text-slate-500">
            L'équipe <span className="font-medium text-slate-700">{name}</span> sera supprimée définitivement.
          </p>
        )}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg border border-slate-300 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Annuler
          </button>
          {membersCount === 0 && (
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-500 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50"
            >
              {isDeleting && <Loader2 size={14} className="animate-spin" />}
              Supprimer
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

const CATEGORY_COLORS = {
  Poussin: 'bg-pink-100 text-pink-700',
  Baby: 'bg-rose-100 text-rose-700',
  Pupille: 'bg-orange-100 text-orange-700',
  Benjamin: 'bg-amber-100 text-amber-700',
  Minime: 'bg-yellow-100 text-yellow-700',
  Cadet: 'bg-lime-100 text-lime-700',
  Junior: 'bg-emerald-100 text-emerald-700',
  Senior: 'bg-indigo-100 text-indigo-700',
}

function CategoryBadge({ category }) {
  const cls = CATEGORY_COLORS[category] ?? 'bg-slate-100 text-slate-600'
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${cls}`}>{category}</span>
  )
}

export default function TeamsList() {
  const navigate = useNavigate()
  const [teams, setTeams] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [toDelete, setToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  const load = useCallback(() => {
    setIsLoading(true)
    teamService.getAll().then(({ data }) => setTeams(data)).finally(() => setIsLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  async function handleDelete() {
    if (!toDelete) return
    setIsDeleting(true)
    setDeleteError(null)
    try {
      await teamService.remove(toDelete.id)
      setToDelete(null)
      load()
    } catch (err) {
      const msg =
        err.response?.data?.errors?.team?.[0] ??
        err.response?.data?.message ??
        'Impossible de supprimer cette équipe.'
      setDeleteError(msg)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Équipes</h1>
          <p className="mt-1 text-sm text-slate-500">
            {teams.length} équipe{teams.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          to="/equipes/creer"
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
        >
          <Plus size={16} />
          Nouvelle équipe
        </Link>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 size={28} className="animate-spin text-indigo-400" />
        </div>
      ) : teams.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center gap-2 text-slate-400">
          <ShieldHalf size={32} />
          <p className="text-sm">Aucune équipe pour l'instant</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 text-left">Équipe</th>
                  <th className="px-5 py-3 text-left">Catégorie</th>
                  <th className="px-5 py-3 text-left">Membres</th>
                  <th className="px-5 py-3 text-left">Coach(s)</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teams.map((team) => (
                  <tr key={team.id} className="hover:bg-slate-50">
                    {/* Nom */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100">
                          <ShieldHalf size={15} className="text-indigo-600" />
                        </div>
                        <span className="font-medium text-slate-800">{team.name}</span>
                      </div>
                    </td>
                    {/* Catégorie */}
                    <td className="px-5 py-3.5">
                      <CategoryBadge category={team.category} />
                    </td>
                    {/* Membres */}
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 text-slate-600">
                        <Users size={13} className="text-slate-400" />
                        {team.members_count}
                      </span>
                    </td>
                    {/* Coachs */}
                    <td className="px-5 py-3.5 text-slate-500">
                      {team.coaches?.length > 0
                        ? team.coaches.map((c) => c.name).join(', ')
                        : <span className="text-slate-300">—</span>}
                    </td>
                    {/* Actions */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/equipes/${team.id}/membres`)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"
                          title="Gérer les membres"
                        >
                          <Users size={15} />
                        </button>
                        <button
                          onClick={() => navigate(`/equipes/${team.id}/modifier`)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600"
                          title="Modifier"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => { setDeleteError(null); setToDelete(team) }}
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
        </div>
      )}

      {/* Delete dialog */}
      {toDelete && (
        <ConfirmDialog
          name={toDelete.name}
          membersCount={toDelete.members_count}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
          isDeleting={isDeleting}
        />
      )}

      {/* RG-04 error toast */}
      {deleteError && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-xl bg-red-600 px-5 py-3 text-sm text-white shadow-lg">
          {deleteError}
        </div>
      )}
    </div>
  )
}
