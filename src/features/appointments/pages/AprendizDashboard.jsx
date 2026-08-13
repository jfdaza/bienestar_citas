import { useEffect, useState, useMemo } from "react";
import { useAppointments } from "../hooks/useAppointments";
import { AppointmentForm } from "../components/AppointmentForm";
import { AppointmentEditForm } from "../components/AppointmentEditForm";
import { AppointmentCard } from "../components/AppointmentCard";
import { CalendarView } from "../components/CalendarView";
import { NotificationsView } from "../components/NotificationsView";
import { ProfileMenu } from "../components/ProfileMenu";
import { useAuth } from "../../../providers/AuthProvider";
import { 
  Plus, Calendar, AlertCircle, CheckCircle, XCircle, Clock, 
  Bell, Home, CalendarDays, Heart, Menu, Shield, Lock
} from "lucide-react";

const STATUS_FILTERS = [
  { key: "all", label: "Todas" },
  { key: "pending", label: "Pendientes" },
  { key: "confirmed", label: "Confirmadas" },
  { key: "completed", label: "Completadas" },
  { key: "cancelled", label: "Canceladas" },
];

const TABS = [
  { key: "home", label: "Inicio", icon: Home },
  { key: "appointments", label: "Mis citas", icon: CalendarDays },
  { key: "notifications", label: "Notificaciones", icon: Bell },
  { key: "profile", label: "Perfil", icon: Menu },
];

function ConfirmModal({ message, onConfirm, onCancel, isLoading }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content modal-confirm" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-icon">
          <AlertCircle size={48} color="#ef4444" />
        </div>
        <h3>Confirmar acción</h3>
        <p>{message}</p>
        <div className="confirm-actions">
          <button onClick={onCancel} className="btn-secondary" disabled={isLoading}>
            No, volver
          </button>
          <button onClick={onConfirm} className="btn-danger" disabled={isLoading}>
            {isLoading ? "Cancelando..." : "Sí, cancelar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="appointment-card skeleton-card">
      <div className="card-header">
        <div className="skeleton skeleton-badge"></div>
        <div className="skeleton skeleton-text-sm"></div>
      </div>
      <div className="card-body">
        <div className="skeleton skeleton-text-lg"></div>
        <div className="skeleton skeleton-text"></div>
      </div>
    </div>
  );
}

export default function AprendizDashboard() {
  const { appointments, fetchAppointments, cancelAppointment, isLoading, error } =
    useAppointments();
  const { signOut, profile } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [activeTab, setActiveTab] = useState("home");

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const stats = useMemo(() => {
    const counts = { pending: 0, confirmed: 0, completed: 0, cancelled: 0, no_show: 0 };
    appointments.forEach((apt) => {
      if (counts[apt.status] !== undefined) {
        counts[apt.status]++;
      }
    });
    return counts;
  }, [appointments]);

  const filteredAppointments = useMemo(() => {
    if (statusFilter === "all") return appointments;
    return appointments.filter((apt) => apt.status === statusFilter);
  }, [appointments, statusFilter]);

  const handleCancelClick = (appointmentId) => {
    setAppointmentToCancel(appointmentId);
  };

  const handleConfirmCancel = async () => {
    if (!appointmentToCancel) return;
    setIsCancelling(true);
    await cancelAppointment(appointmentToCancel);
    setIsCancelling(false);
    setAppointmentToCancel(null);
  };

  const userName = profile?.full_name?.split(" ")[0] || "Aprendiz";

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <>
            {/* Welcome Section */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>
                Hola, {userName} 👋
              </h2>
              <p style={{ color: '#6B7280' }}>Bienvenido a Bienestar SENA</p>
            </div>

            {/* Stats */}
            {!isLoading && appointments.length > 0 && (
              <div className="stats-grid">
                <div className="stat-card stat-pending">
                  <Clock size={24} />
                  <div className="stat-info">
                    <span className="stat-count">{stats.pending}</span>
                    <span className="stat-label">Pendientes</span>
                  </div>
                </div>
                <div className="stat-card stat-confirmed">
                  <AlertCircle size={24} />
                  <div className="stat-info">
                    <span className="stat-count">{stats.confirmed}</span>
                    <span className="stat-label">Confirmadas</span>
                  </div>
                </div>
                <div className="stat-card stat-completed">
                  <CheckCircle size={24} />
                  <div className="stat-info">
                    <span className="stat-count">{stats.completed}</span>
                    <span className="stat-label">Completadas</span>
                  </div>
                </div>
                <div className="stat-card stat-cancelled">
                  <XCircle size={24} />
                  <div className="stat-info">
                    <span className="stat-count">{stats.cancelled}</span>
                    <span className="stat-label">Canceladas</span>
                  </div>
                </div>
              </div>
            )}

            {/* Empty State or Quick Actions */}
            {appointments.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <Calendar size={48} />
                </div>
                <h3>Aún no tienes citas</h3>
                <p>Agenda tu primera cita y comienza tu proceso de bienestar.</p>
                <button 
                  onClick={() => setShowForm(true)} 
                  className="btn-primary empty-btn"
                  style={{ maxWidth: '320px' }}
                >
                  <CalendarDays size={20} />
                  Agendar mi primera cita
                </button>
                <div className="data-protection">
                  <Lock size={14} />
                  Tus datos están protegidos
                </div>
              </div>
            ) : (
              <div style={{ 
                background: 'white',
                borderRadius: '16px',
                padding: '1.5rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}>
                <h3 style={{ 
                  margin: '0 0 1rem',
                  fontSize: '1rem',
                  fontWeight: 600,
                }}>
                  Resumen rápido
                </h3>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  background: '#F9FAFB',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                }}>
                  <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                    Total de citas solicitadas
                  </span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#39A900' }}>
                    {appointments.length}
                  </span>
                </div>
                <button 
                  onClick={() => setActiveTab("appointments")}
                  className="btn-secondary"
                  style={{ width: '100%' }}
                >
                  <CalendarDays size={16} />
                  Ver todas mis citas
                </button>
              </div>
            )}
          </>
        );

      case "appointments":
        return (
          <>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>
                Mis Citas
              </h2>
              <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>
                {appointments.length} cita{appointments.length !== 1 ? 's' : ''} en total
              </p>
            </div>

            {/* Filters */}
            {!isLoading && appointments.length > 0 && (
              <div className="filters-row">
                {STATUS_FILTERS.map((filter) => (
                  <button
                    key={filter.key}
                    className={`filter-btn ${statusFilter === filter.key ? "active" : ""}`}
                    onClick={() => setStatusFilter(filter.key)}
                  >
                    {filter.label}
                    {filter.key !== "all" && (
                      <span className="filter-count">{stats[filter.key] || 0}</span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Appointments List */}
            <section className="appointments-list">
              {isLoading ? (
                <>
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </>
              ) : filteredAppointments.length === 0 ? (
                <div className="empty-state" style={{ padding: '2rem' }}>
                  <Calendar size={48} style={{ color: '#D1D5DB' }} />
                  <h3 style={{ fontSize: '1rem' }}>
                    {statusFilter === "all"
                      ? "No tienes citas agendadas"
                      : `No hay citas ${STATUS_FILTERS.find((f) => f.key === statusFilter)?.label.toLowerCase()}`}
                  </h3>
                  <p style={{ fontSize: '0.875rem' }}>
                    {statusFilter === "all"
                      ? "Agenda tu primera cita para recibir atención de bienestar"
                      : "Intenta con otro filtro o agenda una nueva cita"}
                  </p>
                  {statusFilter === "all" && (
                    <button onClick={() => setShowForm(true)} className="btn-primary" style={{ maxWidth: '280px' }}>
                      <Plus size={18} />
                      Agendar nueva cita
                    </button>
                  )}
                </div>
              ) : (
                filteredAppointments.map((apt) => (
                  <AppointmentCard
                    key={apt.id}
                    appointment={apt}
                    isAprendiz={true}
                    onCancel={() => handleCancelClick(apt.id)}
                    onEdit={() => setEditingAppointment(apt)}
                  />
                ))
              )}
            </section>
          </>
        );

      case "notifications":
        return <NotificationsView appointments={appointments} />;

      case "profile":
        return (
          <ProfileMenu 
            profile={profile} 
            signOut={signOut}
            totalAppointments={appointments.length}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="dashboard-title">
          <h1 style={{ fontSize: '1.25rem' }}>Bienestar SENA</h1>
        </div>
        <div className="header-actions">
          {activeTab === "home" && (
            <button onClick={() => setShowForm(true)} className="btn-primary" style={{ padding: '0.625rem 1rem' }}>
              <Plus size={18} />
              Nueva Cita
            </button>
          )}
        </div>
      </header>

      {/* New Appointment Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nueva Cita</h3>
              <button className="modal-close" onClick={() => setShowForm(false)}>
                <XCircle size={20} />
              </button>
            </div>
            <AppointmentForm
              onSuccess={() => {
                setShowForm(false);
                fetchAppointments();
              }}
              onClose={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      {/* Edit Appointment Modal */}
      {editingAppointment && (
        <div className="modal-overlay" onClick={() => setEditingAppointment(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Modificar Cita</h3>
              <button className="modal-close" onClick={() => setEditingAppointment(null)}>
                <XCircle size={20} />
              </button>
            </div>
            <AppointmentEditForm
              appointment={editingAppointment}
              onSuccess={() => {
                setEditingAppointment(null);
                fetchAppointments();
              }}
              onCancel={() => setEditingAppointment(null)}
            />
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {appointmentToCancel && (
        <ConfirmModal
          message="¿Estás seguro de que deseas cancelar esta cita? Esta acción no se puede deshacer."
          onConfirm={handleConfirmCancel}
          onCancel={() => setAppointmentToCancel(null)}
          isLoading={isCancelling}
        />
      )}

      {/* Main Content */}
      <main style={{ paddingBottom: '80px' }}>
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
              onClick={() => fetchAppointments()}
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
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        {TABS.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              className={`bottom-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <IconComponent size={24} />
              <span>{tab.label}</span>
              {tab.key === "notifications" && appointments.filter(a => a.status === "cancelled").length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '0.25rem',
                  right: '0.25rem',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#EF4444',
                }} />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
