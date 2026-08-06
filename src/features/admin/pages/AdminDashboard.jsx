import { useState } from "react";
import { UserManagement } from "../components/UserManagement";
import { AuditLogViewer } from "../components/AuditLogViewer";
import { Users, ClipboardList, LogOut } from "lucide-react";
import { useAuth } from "../../../providers/AuthProvider";

const TABS = [
  { id: "users", label: "Gestión de Usuarios", icon: Users },
  { id: "audit", label: "Registro de Auditoría", icon: ClipboardList },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("users");
  const { signOut } = useAuth();

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>Panel de Administración</h1>
          <p>Gestión de usuarios, auditoría y configuración del sistema</p>
        </div>
        <button onClick={signOut} className="btn-secondary">
          <LogOut size={16} />
          Cerrar Sesión
        </button>
      </header>

      <nav className="admin-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="admin-content">
        {activeTab === "users" && <UserManagement />}
        {activeTab === "audit" && <AuditLogViewer />}
      </main>
    </div>
  );
}
