import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { useAuth } from "../providers/AuthProvider";
import { lazy, Suspense } from "react";

// Públicas
const Login = lazy(() => import("../features/auth/pages/Login"));
const Register = lazy(() => import("../features/auth/pages/Register"));
const Unauthorized = lazy(() => import("../shared/components/Unauthorized"));

// Privadas
const AprendizDashboard = lazy(
  () => import("../features/appointments/pages/AprendizDashboard"),
);
const ProfessionalDashboard = lazy(
  () => import("../features/appointments/pages/ProfessionalDashboard"),
);
const CoordinationDashboard = lazy(
  () => import("../features/dashboard/pages/CoordinationDashboard"),
);
const AdminDashboard = lazy(
  () => import("../features/admin/pages/AdminDashboard"),
);

function DashboardRouter() {
  const { isProfessional, isCoordination, isAdmin } = useAuth();

  if (isAdmin()) return <AdminDashboard />;
  if (isCoordination()) return <CoordinationDashboard />;
  if (isProfessional()) return <ProfessionalDashboard />;
  return <AprendizDashboard />;
}

export function AppRoutes() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <Routes>
        {/* RUTAS PÚBLICAS */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* RUTA PRINCIPAL - Siempre login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* RUTA privada unificada - redirige según rol */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <DashboardRouter />
            </ProtectedRoute>
          }
        />

        {/* Rutas legacy por si acaso */}
        <Route
          path="/dashboard"
          element={<Navigate to="/app" replace />}
        />
        <Route
          path="/professional"
          element={<Navigate to="/app" replace />}
        />
        <Route
          path="/coordination"
          element={<Navigate to="/app" replace />}
        />
        <Route
          path="/admin"
          element={<Navigate to="/app" replace />}
        />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}
