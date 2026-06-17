// src/router.jsx
import { createBrowserRouter } from "react-router-dom";
import AdminLayout from "./layout/AdminLayout";
import Dashboard from "./Pages/Dashboard";
import Membres from "./Pages/Membres";
import Entraineurs from "./Pages/Entraineurs";
import Equipes from "./Pages/Equipes";
import Entrainements from "./Pages/Entrainements";
import Paiements from "./Pages/Paiements";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AdminLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "membres", element: <Membres /> },
      { path: "entraineur", element: <Entraineurs /> },
      { path: "equipes", element: <Equipes /> },
      { path: "entrainements", element: <Entrainements /> },
      { path: "paiements", element: <Paiements /> },
    ],
  },
]);

export default router;