import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import {
  ArrowLeft,
  Search,
  Loader2,
  UserCheck,
  UserPlus,
  UserMinus,
  ShieldHalf,
} from 'lucide-react'
import { teamService } from '../../services/teamService'
import { memberService } from '../../services/memberService'

// ------------------------------------------------------------------
// Small avatar chip used in both panels
// ------------------------------------------------------------------
function MemberChip({ member, action, actionIcon: Icon, actionClass, disabled }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 hover:bg-slate-50">
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-navy-100 text-xs font-bold text-navy-700">
          {member.first_name[0]}{member.last_name[0]}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-800">{member.full_name}</p>
          <p className="text-xs text-slate-400">{member.category}</p>
        </div>
      </div>
      <button
        onClick={() => action(member)}
        disabled={disabled}
        className={`shrink-0 rounded-lg p-1.5 transition ${actionClass} disabled:opacity-40`}
        title={disabled ? 'En cours…' : undefined}
      >
        <Icon size={15} />
      </button>
    </div>
  )
}

export default function TeamMembers() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [team, setTeam] = useState(null)
  const [assigned, setAssigned] = useState([])   // membres dans l'équipe
  const [available, setAvailable] = useState([]) // tous les membres
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [pending, setPending] = useState(new Set()) // ids en cours d'action

  // Charge les données de l'équipe et tous les membres en parallèle
  const load = useCallback(() => {
    setIsLoading(true)
    Promise.all([
      teamService.getById(id),
      teamService.getMembers(id, { per_page: 500 }),
      memberService.getAll({ per_page: 500 }),
    ])
      .then(([teamRes, assignedRes, allRes]) => {
        setTeam(teamRes.data)
        setAssigned(assignedRes.data)
        setAvailable(allRes.data)
      })
      .catch(() => navigate('/equipes', { replace: true }))
      .finally(() => setIsLoading(false))
  }, [id, navigate])

  useEffect(() => { load() }, [load])

  const assignedIds = new Set(assigned.map((m) => m.id))

  // Membres non encore affectés à cette équipe, filtrés par recherche
  const unassigned = available.filter(
    (m) =>
      !assignedIds.has(m.id) &&
      (search === '' ||
        m.full_name.toLowerCase().includes(search.toLowerCase()) ||
        m.phone.includes(search)),
  )

  // Membres déjà dans l'équipe, filtrés par recherche
  const filteredAssigned = assigned.filter(
    (m) =>
      search === '' ||
      m.full_name.toLowerCase().includes(search.toLowerCase()) ||
      m.phone.includes(search),
  )

  async function attach(member) {
    setPending((p) => new Set(p).add(member.id))
    try {
      await teamService.attachMembers(id, [member.id])
      setAssigned((prev) => [...prev, member])
    } finally {
      setPending((p) => { const n = new Set(p); n.delete(member.id); return n })
    }
  }

  async function detach(member) {
    setPending((p) => new Set(p).add(member.id))
    try {
      await teamService.detachMembers(id, [member.id])
      setAssigned((prev) => prev.filter((m) => m.id !== member.id))
    } finally {
      setPending((p) => { const n = new Set(p); n.delete(member.id); return n })
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
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => navigate('/equipes')}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <ShieldHalf size={20} className="text-brand-blue-500" />
            <h1 className="text-2xl font-bold text-slate-800">{team?.name}</h1>
            <span className="rounded-full bg-navy-100 px-2.5 py-0.5 text-xs font-medium text-navy-700">
              {team?.category}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-slate-500">
            Gérez les membres de cette équipe
          </p>
        </div>
      </div>

      {/* Search bar commune aux deux panneaux */}
      <div className="mb-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
        <Search size={16} className="shrink-0 text-slate-400" />
        <input
          type="text"
          placeholder="Filtrer par nom ou téléphone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
        />
      </div>

      {/* Deux colonnes */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

        {/* Colonne gauche — membres disponibles */}
        <div className="flex flex-col rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-700">Membres disponibles</h2>
              <p className="text-xs text-slate-400">{unassigned.length} non affecté(s)</p>
            </div>
            <UserPlus size={18} className="text-slate-300" />
          </div>
          <div className="min-h-[200px] flex-1 overflow-y-auto px-3 py-2">
            {unassigned.length === 0 ? (
              <div className="flex h-32 items-center justify-center text-sm text-slate-400">
                {search ? 'Aucun résultat' : 'Tous les membres sont affectés'}
              </div>
            ) : (
              unassigned.map((m) => (
                <MemberChip
                  key={m.id}
                  member={m}
                  action={attach}
                  actionIcon={UserPlus}
                  actionClass="text-slate-300 hover:bg-emerald-100 hover:text-emerald-600"
                  disabled={pending.has(m.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Colonne droite — membres de l'équipe */}
        <div className="flex flex-col rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-700">Dans l'équipe</h2>
              <p className="text-xs text-slate-400">{assigned.length} membre(s)</p>
            </div>
            <UserCheck size={18} className="text-brand-blue-300" />
          </div>
          <div className="min-h-[200px] flex-1 overflow-y-auto px-3 py-2">
            {filteredAssigned.length === 0 ? (
              <div className="flex h-32 items-center justify-center text-sm text-slate-400">
                {search ? 'Aucun résultat' : 'Aucun membre dans cette équipe'}
              </div>
            ) : (
              filteredAssigned.map((m) => (
                <MemberChip
                  key={m.id}
                  member={m}
                  action={detach}
                  actionIcon={UserMinus}
                  actionClass="text-slate-300 hover:bg-red-100 hover:text-red-500"
                  disabled={pending.has(m.id)}
                />
              ))
            )}
          </div>
        </div>

      </div>

      {/* Legend */}
      <p className="mt-4 text-center text-xs text-slate-400">
        Cliquez sur <UserPlus size={12} className="inline" /> pour affecter ·{' '}
        <UserMinus size={12} className="inline" /> pour retirer · Les changements sont immédiats
      </p>
    </div>
  )
}
