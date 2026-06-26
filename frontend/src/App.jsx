import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import MembersList from './pages/Members/MembersList'
import MemberForm from './pages/Members/MemberForm'
import TeamsList from './pages/Teams/TeamsList'
import TeamForm from './pages/Teams/TeamForm'
import TeamMembers from './pages/Teams/TeamMembers'
import TrainingsList from './pages/Trainings/TrainingsList'
import TrainingForm from './pages/Trainings/TrainingForm'
import PaymentsList from './pages/Payments/PaymentsList'
import PaymentForm from './pages/Payments/PaymentForm'
import UsersList from './pages/Users/UsersList'
import UserForm from './pages/Users/UserForm'

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

            {/* M2 — Équipes */}
            <Route path="/equipes" element={<TeamsList />} />
            <Route path="/equipes/creer" element={<TeamForm />} />
            <Route path="/equipes/:id/modifier" element={<TeamForm />} />
            <Route path="/equipes/:id/membres" element={<TeamMembers />} />

            {/* M3 — Entraînements */}
            <Route path="/entrainements" element={<TrainingsList />} />
            <Route path="/entrainements/creer" element={<TrainingForm />} />
            <Route path="/entrainements/:id/modifier" element={<TrainingForm />} />

            {/* M4 — Paiements */}
            <Route path="/paiements" element={<PaymentsList />} />
            <Route path="/paiements/creer" element={<PaymentForm />} />

            {/* M0 — Utilisateurs (admin only) */}
            <Route path="/utilisateurs" element={<UsersList />} />
            <Route path="/utilisateurs/creer" element={<UserForm />} />
            <Route path="/utilisateurs/:id/modifier" element={<UserForm />} />
          </Route>
        </Route>

        {/* Fallback — redirige vers login (ProtectedRoute prendra le relais si authentifié) */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
