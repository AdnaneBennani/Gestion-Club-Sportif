// src/components/Sidebar.jsx
import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Users2,
  Dumbbell,
  CreditCard,
  Menu,
  X,
} from "lucide-react";

const links = [
  { to: "/", label: "Tableau de bord", icon: LayoutDashboard, color: "text-blue-600" },
  { to: "/membres", label: "Membres", icon: Users, color: "text-blue-600" },
  { to: "/entraineur", label: "Entraineurs", icon: UserCheck, color: "text-orange-600" },
  { to: "/equipes", label: "Équipes", icon: Users2, color: "text-blue-600" },
  { to: "/entrainements", label: "Entraînements", icon: Dumbbell, color: "text-orange-600" },
  { to: "/paiements", label: "Paiements", icon: CreditCard, color: "text-orange-600" },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-white border border-gray-200 text-blue-600 lg:hidden hover:bg-gray-50 transition-colors"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-10 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:relative top-0 left-0 h-screen bg-white text-gray-900 flex flex-col border-r border-gray-200 z-40 transition-all duration-300 ${
          isOpen ? "w-56" : "-translate-x-full lg:translate-x-0 lg:w-56"
        }`}
      >
        {/* Logo Section */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Dumbbell size={18} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Club Sportif</p>
              <p className="text-xs text-gray-500">Gestion</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-900 border-l-2 border-blue-600"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`
                }
              >
                <Icon size={18} className={`flex-shrink-0 ${link.color}`} />
                <span className="truncate">{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

      </aside>
    </>
  );
}