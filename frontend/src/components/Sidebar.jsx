// src/components/Sidebar.jsx
import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Tableau de bord" },
  { to: "/membres", label: "Membres" },
  { to: "/entraineur", label: "Entraineurs" },
  { to: "/equipes", label: "Équipes" },
  { to: "/entrainements", label: "Entraînements" },
  { to: "/paiements", label: "Paiements" },
];

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-slate-900 text-slate-100 flex flex-col">
      <div className="px-6 py-5 text-xl font-semibold border-b border-slate-700">
        Club Sportif
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? "bg-slate-700 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-6 py-4 border-t border-slate-700 text-xs text-slate-400">
        v3.0 — CDC Fast-Track
      </div>
    </aside>
  );
}