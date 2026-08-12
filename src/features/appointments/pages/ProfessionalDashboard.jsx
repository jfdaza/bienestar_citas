import { useEffect, useState, useMemo, useCallback } from "react";
import { useAppointments } from "../hooks/useAppointments";
import { AppointmentCard } from "../components/AppointmentCard";
import { useAuth } from "../../../providers/AuthProvider";
import { toast } from "sonner";
import { 
  CheckCircle, XCircle, Clock, Calendar, LogOut, 
  Bell, CalendarDays, ChevronDown, Filter, AlertCircle
} from "lucide-react";

const FILTER_TABS = [
  { key: "pending", label: "Pendientes" },
  { key: "confirmed", label: "Confirmadas" },
  { key: "completed", label: "Completadas" },
];

const NOTIF_STORAGE_KEY = "sena_professional_seen_appointments";

function getSeenIds() {
  try {
    return JSON.parse(localStorage.getItem(NOTIF_STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function markAppointmentSeen(id) {
  const seen = getSeenIds();
  if (!seen.includes(id)) {
    seen.push(id);
    localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(seen));
  }
}

export default function ProfessionalDashboard() {
  const { appointments, fetchAppointments, updateStatus, isLoading, error } =
    useAppointments();
  const { profile, signOut } = useAuth();
  const [filter, setFilter] = useState("pending");
  const [showNotifications, setShowNotifications] = useState(false);
  const [seenIds, setSeenIds] = useState(getSeenIds);

  useEffect(() => {
    fetchAppointments({ status: filter });
  }, [filter, fetchAppointments]);

  const newPendingAppointments = useMemo(() => {
    return appointments.filter(
      (apt) => apt.status === "pending" && !seenIds.includes(apt.id)
    );
  }, [appointments, seenIds]);

  useEffect(() => {
    if (newPendingAppointments.length > 0) {
      toast.info(
        `Tienes ${newPendingAppointments.length} nueva${newPendingAppointments.length > 1 ? 's' : ''} cita${newPendingAppointments.length > 1 ? 's' : ''} pendiente${newPendingAppointments.length > 1 ? 's' : ''}`,
        { duration: 5000 }
      );
    }
  }, [newPendingAppointments.length]);

  const handleMarkAllSeen = useCallback(() => {
    const ids = newPendingAppointments.map((a) => a.id);
    const updated = [...new Set([...seenIds, ...ids])];
    localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(updated));
    setSeenIds(updated);
  }, [newPendingAppointments, seenIds]);

  const handleMarkSeen = useCallback((id) => {
    markAppointmentSeen(id);
    setSeenIds(getSeenIds());
  }, []);

  const stats = useMemo(() => {
    const counts = { pending: 0, confirmed: 0, completed: 0, no_show: 0 };
    appointments.forEach((apt) => {
      if (counts[apt.status] !== undefined) {
        counts[apt.status]++;
      }
    });
    return counts;
  }, [appointments]);

  const handleConfirmAttendance = async (id) => {
    const result = await updateStatus(id, "confirmed", "Cita confirmada por profesional", profile?.id);
    if (result.success) {
      toast.success("Cita confirmada");
      fetchAppointments({ status: filter });
    }
  };

  const handleNoShow = async (id) => {
    const result = await updateStatus(id, "no_show", "No se presentó a la cita", profile?.id);
    if (result.success) {
      toast.success("Marcado como no asistió");
      fetchAppointments({ status: filter });
    }
  };

  const handleComplete = async (id, notes) => {
    const result = await updateStatus(id, "completed", notes, profile?.id);
    if (result.success) {
      toast.success("Atención completada");
      fetchAppointments({ status: filter });
    }
  };

  const userName = profile?.full_name?.split(" ")[0] || "Profesional";
  const departmentName = profile?.dependencies?.name || "Bienestar";
  const today = new Date().toLocaleDateString("es-ES", { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="dashboard-title">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="32" height="32" viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="20" r="12" fill="#39A900"/>
              <path d="M50 35 L30 65 L40 65 L40 85 L60 85 L60 65 L70 65 Z" fill="#39A900"/>
            </svg>
            <div>
              <h1 style={{ fontSize: '1.25rem' }}>{departmentName}</h1>
              <p style={{ fontSize: '0.75rem' }}>Panel profesional</p>
            </div>
          </div>
        </div>
        <div className="header-actions">
          <button
            className="btn-icon"
            aria-label="Notificaciones"
            onClick={() => setShowNotifications(!showNotifications)}
            style={{ position: "relative" }}
          >
            <Bell size={24} />
            {newPendingAppointments.length > 0 && (
              <span style={{
                position: "absolute",
                top: "2px",
                right: "2px",
                width: "18px",
                height: "18px",
                borderRadius: "50%",
                background: "#EF4444",
                color: "white",
                fontSize: "0.7rem",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                {newPendingAppointments.length}
              </span>
            )}
          </button>
          <button onClick={signOut} className="btn-icon" aria-label="Cerrar sesión">
            <LogOut size={24} />
          </button>
        </div>
      </header>

      {/* Notification Panel */}
      {showNotifications && (
        <div style={{
          background: "white",
          borderRadius: "12px",
          marginBottom: "1.5rem",
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          overflow: "hidden",
        }}>
          <div style={{
            padding: "1rem 1.5rem",
            borderBottom: "1px solid #F3F4F6",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}>
                Nuevas citas
              </h3>
              <p style={{ margin: "0.25rem 0 0", fontSize: "0.75rem", color: "#6B7280" }}>
                {newPendingAppointments.length > 0
                  ? `${newPendingAppointments.length} pendiente${newPendingAppointments.length > 1 ? "s" : ""} de revisar`
                  : "No hay citas nuevas"}
              </p>
            </div>
            {newPendingAppointments.length > 0 && (
              <button
                onClick={handleMarkAllSeen}
                style={{
                  padding: "0.4rem 0.75rem",
                  background: "#F3F4F6",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  color: "#374151",
                }}
              >
                Marcar como leído
              </button>
            )}
          </div>
          {newPendingAppointments.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "#9CA3AF" }}>
              <Bell size={32} style={{ marginBottom: "0.5rem" }} />
              <p style={{ margin: 0, fontSize: "0.875rem" }}>No hay notificaciones nuevas</p>
            </div>
          ) : (
            newPendingAppointments.map((apt) => (
              <div
                key={apt.id}
                onClick={() => handleMarkSeen(apt.id)}
                style={{
                  padding: "0.875rem 1.5rem",
                  borderBottom: "1px solid #F3F4F6",
                  display: "flex",
                  gap: "0.75rem",
                  cursor: "pointer",
                  background: "#FFFBEB",
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#FEF3C7"}
                onMouseLeave={(e) => e.currentTarget.style.background = "#FFFBEB"}
              >
                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "#FEF3C7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <Clock size={20} style={{ color: "#F59E0B" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: 600, color: "#374151" }}>
                    Nueva cita pendiente
                  </p>
                  <p style={{ margin: "0.25rem 0", fontSize: "0.8125rem", color: "#6B7280" }}>
                    {apt.profiles?.full_name || "Un aprendiz"} solicita cita en {apt.dependencies?.name || "tu área"}
                  </p>
                  <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.25rem", fontSize: "0.7rem", color: "#9CA3AF" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <Calendar size={12} />
                      {new Date(apt.scheduled_date).toLocaleDateString("es-ES")}
                    </span>
                    <span>{apt.scheduled_time}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Welcome */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>
          Hola, {userName} 👋
        </h2>
        <p style={{ color: '#6B7280' }}>Gestiona las citas programadas para hoy.</p>
      </div>

      {/* Error Banner */}
      {error && (
        <div style={{
          padding: '1rem',
          marginBottom: '1rem',
          background: '#FEF2F2',
          border: '1px solid #FECACA',
          borderRadius: '8px',
          color: '#991B1B',
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <AlertCircle size={18} />
          <span>{error}</span>
          <button
            onClick={() => fetchAppointments({ status: filter })}
            style={{
              marginLeft: 'auto',
              padding: '0.25rem 0.75rem',
              background: '#991B1B',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.8rem',
            }}
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Date Selector */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.5rem',
        padding: '0.75rem 1rem',
        background: 'white',
        borderRadius: 'var(--radius-md)',
        marginBottom: '1.5rem',
        boxShadow: 'var(--shadow-card)'
      }}>
        <CalendarDays size={18} color="#39A900" />
        <span style={{ fontWeight: 500 }}>{today}</span>
        <ChevronDown size={16} color="#6B7280" />
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card stat-completed">
          <Calendar size={24} />
          <div className="stat-info">
            <span className="stat-count">{stats.pending + stats.confirmed}</span>
            <span className="stat-label">Citas programadas hoy</span>
          </div>
        </div>
        <div className="stat-card stat-pending">
          <Clock size={24} />
          <div className="stat-info">
            <span className="stat-count">{stats.pending}</span>
            <span className="stat-label">Pendientes por confirmar</span>
          </div>
        </div>
        <div className="stat-card stat-completed">
          <CheckCircle size={24} />
          <div className="stat-info">
            <span className="stat-count">{stats.completed}</span>
            <span className="stat-label">Completadas hoy</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            className={filter === tab.key ? "active" : ""}
            onClick={() => setFilter(tab.key)}
          >
            {tab.label} ({stats[tab.key] || 0})
          </button>
        ))}
      </div>

      {/* Sort and Filter */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CalendarDays size={16} color="#6B7280" />
          <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
            Próximas citas {filter === 'pending' ? 'pendientes' : filter === 'confirmed' ? 'confirmadas' : 'completadas'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>Ordenar por hora</span>
          <ChevronDown size={14} color="#6B7280" />
          <button className="btn-icon">
            <Filter size={16} />
          </button>
        </div>
      </div>

      {/* Appointments List */}
      <div className="appointments-list">
        {isLoading ? (
          <>
            <div className="appointment-card skeleton-card">
              <div className="skeleton skeleton-badge"></div>
              <div className="skeleton skeleton-text"></div>
            </div>
            <div className="appointment-card skeleton-card">
              <div className="skeleton skeleton-badge"></div>
              <div className="skeleton skeleton-text"></div>
            </div>
          </>
        ) : appointments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Calendar size={48} />
            </div>
            <h3>No hay citas {filter === "pending" ? "pendientes" : filter === "confirmed" ? "confirmadas" : "completadas"}</h3>
            <p>Las citas aparecerán aquí cuando los aprendices agenden</p>
          </div>
        ) : (
          appointments.map((apt) => (
            <div key={apt.id} className="appointment-wrapper">
              <AppointmentCard appointment={apt} isAprendiz={false} />

              {filter === "pending" && (
                <div className="professional-actions">
                  <button
                    onClick={() => handleConfirmAttendance(apt.id)}
                    className="action-btn confirm"
                  >
                    <CheckCircle size={16} />
                    Confirmar
                  </button>
                  <button
                    onClick={() => handleNoShow(apt.id)}
                    className="action-btn no-show"
                  >
                    <XCircle size={16} />
                    No asistió
                  </button>
                </div>
              )}

              {filter === "confirmed" && (
                <div className="professional-actions">
                  <button
                    onClick={() => handleComplete(apt.id, "Atención completada")}
                    className="action-btn complete"
                  >
                    <CheckCircle size={16} />
                    Completar
                  </button>
                </div>
              )}

              {filter === "completed" && (
                <div className="card-locked-message">
                  <CheckCircle size={16} />
                  <span>Cita completada</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
