// src/pages/Dashboard.jsx
import { Users, UserCheck, Dumbbell, CreditCard } from "lucide-react";

const StatCard = ({ icon: Icon, label, value, borderColor, iconColor, dotColor }) => {
  return (
    <div className={`bg-white rounded-lg border ${borderColor} p-5 hover:shadow-sm transition-shadow`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">{label}</p>
          <p className="text-3xl font-semibold text-gray-900">{value}</p>
        </div>
        <div className={`p-2 rounded-lg ${iconColor}`}>
          <Icon size={20} className={dotColor} />
        </div>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const stats = [
    {
      icon: Users,
      label: "Nombre des Membres",
      value: 48,
      borderColor: "border-blue-200",
      iconColor: "bg-blue-50",
      dotColor: "text-blue-600",
    },
    {
      icon: UserCheck,
      label: "Nombre des Entraîneurs",
      value: 8,
      borderColor: "border-orange-200",
      iconColor: "bg-orange-50",
      dotColor: "text-orange-600",
    },
    {
      icon: Dumbbell,
      label: "Entraînements Aujourd'hui",
      value: 5,
      borderColor: "border-blue-200",
      iconColor: "bg-blue-50",
      dotColor: "text-blue-600",
    },
    {
      icon: CreditCard,
      label: "Paiements en Attente ce Mois",
      value: 12,
      borderColor: "border-orange-200",
      iconColor: "bg-orange-50",
      dotColor: "text-orange-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <h1 className="text-2xl font-semibold text-gray-900">Tableau de Bord</h1>
        <p className="text-sm text-gray-500 mt-1">Aperçu général de votre club</p>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

      </div>
    </div>
  );
}