import { useEffect, useState } from 'react'
import { Users, ShieldHalf, TrendingUp, AlertCircle, CalendarCheck, Loader2 } from 'lucide-react'
import api from '../lib/axios'

function KpiCard({ label, value, icon: Icon, color, sub }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-800">{value}</p>
          {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
        </div>
        <span className={`rounded-xl p-3 ${color}`}>
          <Icon size={22} />
        </span>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api
      .get('/api/v1/dashboard')
      .then(({ data }) => setStats(data))
      .catch(() => setError('Impossible de charger les statistiques.'))
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 size={36} className="animate-spin text-indigo-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  const cards = [
    {
      label: 'Membres actifs',
      value: stats.total_members,
      icon: Users,
      color: 'bg-indigo-100 text-indigo-600',
      sub: stats.scope === 'team' ? 'Dans votre équipe' : 'Total club',
    },
    ...(stats.scope === 'global'
      ? [
          {
            label: 'Équipes',
            value: stats.total_teams,
            icon: ShieldHalf,
            color: 'bg-purple-100 text-purple-600',
            sub: 'Équipes actives',
          },
        ]
      : []),
    {
      label: 'Revenus du mois',
      value: `${Number(stats.monthly_revenue).toLocaleString('fr-FR')} MAD`,
      icon: TrendingUp,
      color: 'bg-emerald-100 text-emerald-600',
      sub: `Période ${stats.period}`,
    },
    {
      label: 'Paiements en retard',
      value: stats.late_payments_count,
      icon: AlertCircle,
      color:
        stats.late_payments_count > 0
          ? 'bg-red-100 text-red-500'
          : 'bg-slate-100 text-slate-400',
      sub: stats.late_payments_count > 0 ? 'Nécessite une action' : 'Aucun retard',
    },
    {
      label: 'Entraînements à venir',
      value: stats.upcoming_trainings,
      icon: CalendarCheck,
      color: 'bg-sky-100 text-sky-600',
      sub: 'Planifiés',
    },
  ]

  return (
    <div>
      {/* Page title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Tableau de bord</h1>
        <p className="mt-1 text-sm text-slate-500">
          {stats.scope === 'global'
            ? 'Vue globale du club'
            : `Vue de votre équipe — période ${stats.period}`}
        </p>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <KpiCard key={card.label} {...card} />
        ))}
      </div>
    </div>
  )
}
