import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import MembersList from './pages/Members/MembersList'
import MemberForm from './pages/Members/MemberForm'

// Placeholder pour les modules à venir
function ComingSoon({ title }) {
  return (
    <div className="flex h-64 items-center justify-center">
      <p className="text-slate-400 text-sm">
        <span className="font-semibold text-slate-600">{title}</span> — à venir
      </p>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Protected — wrapped in Layout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />

            {/* M1 — Membres */}
            <Route path="/membres" element={<MembersList />} />
            <Route path="/membres/creer" element={<MemberForm />} />
            <Route path="/membres/:id/modifier" element={<MemberForm />} />

            {/* Placeholders */}
            <Route path="/equipes" element={<ComingSoon title="Équipes" />} />
            <Route path="/entrainements" element={<ComingSoon title="Entraînements" />} />
            <Route path="/paiements" element={<ComingSoon title="Paiements" />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
