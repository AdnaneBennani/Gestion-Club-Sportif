import { NavLink, Outlet, useNavigate } from 'react-router'
import {
  LayoutDashboard,
  Users,
  ShieldHalf,
  CreditCard,
  Dumbbell,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = [
  { to: '/dashboard',      label: 'Dashboard',      icon: LayoutDashboard },
  { to: '/membres',        label: 'Membres',         icon: Users },
  { to: '/equipes',        label: 'Équipes',          icon: ShieldHalf },
  { to: '/entrainements',  label: 'Entraînements',   icon: Dumbbell },
  { to: '/paiements',      label: 'Paiements',        icon: CreditCard },
]

function NavItem({ to, label, icon: Icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
          isActive
            ? 'bg-orange-500 text-white shadow-sm'
            : 'text-navy-200 hover:bg-navy-600 hover:text-white',
        ].join(' ')
      }
    >
      <Icon size={18} />
      {label}
    </NavLink>
  )
}

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  const sidebar = (
    <aside className="flex h-full w-64 flex-col bg-navy-700 px-4 py-6">
      {/* Logo / Brand */}
      <div className="mb-8 flex items-center justify-center px-3">
        <img
          src="/logo.png"
          alt="Club Sportif"
          className="h-12 w-auto object-contain"
        />
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </nav>

      {/* User + logout */}
      <div className="border-t border-navy-600 pt-4">
        <div className="mb-3 px-3">
          <p className="text-xs text-navy-300">Connecté en tant que</p>
          <p className="truncate text-sm font-semibold text-white">{user?.name}</p>
          <span className="inline-block rounded-full bg-brand-blue-500/20 px-2 py-0.5 text-xs text-brand-blue-300 capitalize">
            {user?.role}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-navy-300 transition-colors hover:bg-red-900/40 hover:text-red-400"
        >
          <LogOut size={16} />
          Déconnexion
        </button>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0">{sidebar}</div>

      {/* Sidebar mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative flex h-full">{sidebar}</div>
        </div>
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
          <button
            className="lg:hidden text-slate-500 hover:text-navy-700"
            onClick={() => setSidebarOpen(true)}
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div className="flex items-center gap-3 ml-auto">
            <div className="size-8 rounded-full bg-navy-700 flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <span className="hidden text-sm font-medium text-navy-700 sm:block">{user?.name}</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
