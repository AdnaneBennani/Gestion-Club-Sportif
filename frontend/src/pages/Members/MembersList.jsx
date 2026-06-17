import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router'
import { Plus, Search, Pencil, Trash2, Loader2, ChevronLeft, ChevronRight, UserX } from 'lucide-react'
import { memberService } from '../../services/memberService'

function ConfirmDialog({ name, onConfirm, onCancel, isDeleting }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-red-100">
          <Trash2 size={22} className="text-red-500" />
        </div>
        <h3 className="mb-1 text-base font-semibold text-slate-800">Supprimer ce membre ?</h3>
        <p className="mb-6 text-sm text-slate-500">
          <span className="font-medium text-slate-700">{name}</span> sera archivé. Cette action est
          réversible côté base de données.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 rounded-lg border border-slate-300 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
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

export default function MembersList() {
  const navigate = useNavigate()

  const [members, setMembers] = useState([])
  const [meta, setMeta] = useState(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [toDelete, setToDelete] = useState(null) // { id, name }
  const [isDeleting, setIsDeleting] = useState(false)

  const load = useCallback(
    (p = page, q = search) => {
      setIsLoading(true)
      memberService
        .getAll({ page: p, search: q || undefined, per_page: 15 })
        .then(({ data, meta: m }) => {
          setMembers(data)
          setMeta(m)
        })
        .finally(() => setIsLoading(false))
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  // Initial load
  useEffect(() => {
    load(1, '')
  }, [load])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1)
      load(1, search)
    }, 350)
    return () => clearTimeout(timer)
  }, [search, load])

  function handlePageChange(p) {
    setPage(p)
    load(p, search)
  }

  async function handleDelete() {
    if (!toDelete) return
    setIsDeleting(true)
    try {
      await memberService.remove(toDelete.id)
      setToDelete(null)
      load(page, search)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div>
      {/* Page header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Membres</h1>
          <p className="mt-1 text-sm text-slate-500">
            {meta ? `${meta.total} membre${meta.total !== 1 ? 's' : ''} au total` : ''}
          </p>
        </div>
        <Link
          to="/membres/creer"
          className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-600"
        >
          <Plus size={16} />
          Ajouter un membre
        </Link>
      </div>

      {/* Search bar */}
      <div className="mb-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
        <Search size={16} className="shrink-0 text-slate-400" />
        <input
          type="text"
          placeholder="Rechercher par nom, prénom ou téléphone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 size={28} className="animate-spin text-brand-blue-400" />
          </div>
        ) : members.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center gap-2 text-slate-400">
            <UserX size={32} />
            <p className="text-sm">Aucun membre trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 text-left">Membre</th>
                  <th className="px-5 py-3 text-left">Catégorie</th>
                  <th className="px-5 py-3 text-left">Téléphone</th>
                  <th className="px-5 py-3 text-left">Date de naissance</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-navy-100 text-xs font-bold text-navy-700">
                          {m.first_name[0]}{m.last_name[0]}
                        </div>
                        <span className="font-medium text-slate-800">{m.full_name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="rounded-full bg-purple-100 px-2.5 py-1 text-xs font-medium text-purple-700">
                        {m.category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{m.phone}</td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {new Date(m.birth_date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/membres/${m.id}/modifier`)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-navy-50 hover:text-navy-700"
                          title="Modifier"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setToDelete({ id: m.id, name: m.full_name })}
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
          <span>
            Page {meta.current_page} / {meta.last_page}
          </span>
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

      {/* Delete confirm dialog */}
      {toDelete && (
        <ConfirmDialog
          name={toDelete.name}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
          isDeleting={isDeleting}
        />
      )}
    </div>
  )
}
