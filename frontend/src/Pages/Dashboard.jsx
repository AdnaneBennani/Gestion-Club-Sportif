import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import {
  Users, ShieldHalf, Wallet, AlertTriangle,
  CalendarCheck, ArrowRight, Loader2, TrendingUp,
} from 'lucide-react'
import api from '../lib/axios'

// ─── KPI Card ────────────────────────────────────────────────────────────────

function KpiCard({ label, value, icon: Icon, iconBg, iconColor, sub, subColor, to, alert }) {
  const inner = (
    <div className={`relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 transition-shadow hover:shadow-md ${alert ? 'ring-red-200' : 'ring-slate-200'}`}>
      {alert && <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-red-400" />}

      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className={`mt-2 text-3xl font-bold ${alert ? 'text-red-600' : 'text-navy-700'}`}>
            {value}
          </p>
          {sub && (
            <p className={`mt-1 flex items-center gap-1 text-xs ${subColor ?? 'text-slate-400'}`}>
              {sub}
            </p>
          )}
        </div>
        <span className={`shrink-0 rounded-xl p-3 ${iconBg}`}>
          <Icon size={22} className={iconColor} />
        </span>
      </div>

      {to && (
        <div className="mt-4 flex items-center gap-1 text-xs font-medium text-orange-500">
          Voir le détail <ArrowRight size={12} />
        </div>
      )}
    </div>
  )

  return to ? <Link to={to}>{inner}</Link> : inner
}

// ─── Quick-action link ────────────────────────────────────────────────────────

function QuickLink({ to, icon: Icon, label, description }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-orange-300 hover:shadow-md group"
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-navy-50 group-hover:bg-orange-50 transition-colors">
        <Icon size={20} className="text-navy-700 group-hover:text-orange-500 transition-colors" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-navy-700">{label}</p>
        <p className="truncate text-xs text-slate-400">{description}</p>
      </div>
      <ArrowRight size={16} className="ml-auto shrink-0 text-slate-300 group-hover:text-orange-400 transition-colors" />
    </Link>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

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
        <Loader2 size={36} className="animate-spin text-orange-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    )
  }

  const isAdmin = stats.scope === 'global'
  const hasLate = stats.late_payments_count > 0

  const cards = [
    {
      label: 'Membres actifs',
      value: stats.total_members,
      icon: Users,
      iconBg: 'bg-navy-50',
      iconColor: 'text-navy-700',
      sub: isAdmin ? 'Total du club' : 'Dans votre équipe',
      to: '/membres',
    },
    ...(isAdmin
      ? [{
          label: 'Équipes',
          value: stats.total_teams,
          icon: ShieldHalf,
          iconBg: 'bg-brand-blue-50',
          iconColor: 'text-brand-blue-500',
          sub: 'Équipes actives',
          to: '/equipes',
        }]
      : []),
    ...(isAdmin
      ? [
          {
            label: 'Revenus du mois',
            value: `${Number(stats.monthly_revenue).toLocaleString('fr-FR')} MAD`,
            icon: Wallet,
            iconBg: 'bg-emerald-100',
            iconColor: 'text-emerald-600',
            sub: `Période ${stats.period}`,
            subColor: 'text-emerald-500',
          },
          {
            label: 'Retards de paiement',
            value: stats.late_payments_count,
            icon: AlertTriangle,
            iconBg: hasLate ? 'bg-red-100' : 'bg-slate-100',
            iconColor: hasLate ? 'text-red-500' : 'text-slate-400',
            sub: hasLate ? 'Action requise' : 'Tout est à jour',
            subColor: hasLate ? 'text-red-500 font-semibold' : 'text-slate-400',
            alert: hasLate,
            to: hasLate ? '/paiements' : undefined,
          },
        ]
      : []),
    {
      label: 'Entraînements à venir',
      value: stats.upcoming_trainings,
      icon: CalendarCheck,
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-500',
      sub: stats.upcoming_trainings > 0 ? 'Séances planifiées' : 'Aucun de planifié',
      to: '/entrainements',
    },
  ]

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-700">Tableau de bord</h1>
          <p className="mt-1 text-sm text-slate-500">
            {isAdmin ? 'Vue globale du club' : `Votre équipe · période ${stats.period}`}
          </p>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 ring-1 ring-emerald-200">
            <TrendingUp size={16} className="text-emerald-500" />
            <span className="text-sm font-medium text-emerald-700">
              {Number(stats.monthly_revenue).toLocaleString('fr-FR')} MAD encaissés en {stats.period}
            </span>
          </div>
        )}
      </div>

      {/* Late payments alert */}
      {isAdmin && hasLate && (
        <Link
          to="/paiements"
          className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-5 py-4 transition hover:bg-red-100"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} className="shrink-0 text-red-500" />
            <p className="text-sm font-medium text-red-700">
              {stats.late_payments_count} paiement{stats.late_payments_count > 1 ? 's' : ''} en retard dans le club — cliquez pour consulter
            </p>
          </div>
          <ArrowRight size={16} className="shrink-0 text-red-400" />
        </Link>
      )}

      {/* KPI grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <KpiCard key={card.label} {...card} />
        ))}
      </div>

      {/* Quick actions */}
      <div className="mt-8">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
          Accès rapide
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickLink to="/membres/creer"      icon={Users}        label="Nouveau membre"  description="Inscrire un adhérent" />
          {isAdmin && <QuickLink to="/equipes/creer" icon={ShieldHalf} label="Nouvelle équipe" description="Créer une équipe" />}
          <QuickLink to="/entrainements/creer" icon={CalendarCheck} label="Planifier"        description="Ajouter une séance" />
          {isAdmin && <QuickLink to="/paiements/creer"    icon={Wallet}       label="Paiement"         description="Enregistrer une cotisation" />}
        </div>
      </div>
    </div>
  )
}
