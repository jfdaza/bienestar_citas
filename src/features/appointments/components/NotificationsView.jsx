import { useMemo, useState, useCallback } from "react";
import { 
  Bell, Calendar, CheckCircle, XCircle, Clock, 
  ChevronDown, ChevronUp, Eye
} from "lucide-react";

function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Ahora mismo";
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays < 7) return `Hace ${diffDays} días`;
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

const NOTIFICATION_TYPES = {
  cancelled: {
    icon: XCircle,
    color: "#EF4444",
    bg: "#FEF2F2",
    title: "Cita cancelada",
  },
  confirmed: {
    icon: CheckCircle,
    color: "#22C55E",
    bg: "#F0FDF4",
    title: "Cita confirmada",
  },
  completed: {
    icon: CheckCircle,
    color: "#3B82F6",
    bg: "#EFF6FF",
    title: "Cita completada",
  },
  pending: {
    icon: Clock,
    color: "#F59E0B",
    bg: "#FFFBEB",
    title: "Cita pendiente",
  },
};

const STORAGE_KEY = "sena_read_notifications";

function getReadIds() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function markAsRead(id) {
  const readIds = getReadIds();
  if (!readIds.includes(id)) {
    readIds.push(id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(readIds));
  }
}

function markAllAsRead(ids) {
  const readIds = getReadIds();
  const newRead = [...new Set([...readIds, ...ids])];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newRead));
}

export function NotificationsView({ appointments = [] }) {
  const [expandedId, setExpandedId] = useState(null);
  const [readNotifications, setReadNotifications] = useState(() => getReadIds());

  const readIds = useMemo(() => readNotifications, [readNotifications]);

  const notifications = useMemo(() => {
    const notifs = [];

    appointments.forEach((apt) => {
      const config = NOTIFICATION_TYPES[apt.status] || NOTIFICATION_TYPES.pending;
      const IconComponent = config.icon;

      let message = "";
      let detail = "";

      switch (apt.status) {
        case "cancelled":
          message = `Tu cita de ${apt.dependencies?.name || 'bienestar'} fue cancelada`;
          detail = apt.notes || "El profesional ha cancelado tu cita. Puedes agendar una nueva cuando lo desees.";
          break;
        case "confirmed":
          message = `Tu cita de ${apt.dependencies?.name || 'bienestar'} fue confirmada`;
          detail = `Tu cita para el ${new Date(apt.scheduled_date).toLocaleDateString("es-ES")} a las ${apt.scheduled_time} está confirmada.`;
          break;
        case "completed":
          message = `Atención completada en ${apt.dependencies?.name || 'bienestar'}`;
          detail = "Tu cita ha sido completada exitosamente.";
          break;
        case "pending":
          message = `Cita pendiente en ${apt.dependencies?.name || 'bienestar'}`;
          detail = `Tu cita está programada para el ${new Date(apt.scheduled_date).toLocaleDateString("es-ES")} a las ${apt.scheduled_time}. Espera confirmación del profesional.`;
          break;
        default:
          message = `Actualización en tu cita`;
          detail = "Hay una actualización en tu cita de bienestar.";
      }

      notifs.push({
        id: apt.id,
        type: apt.status,
        icon: IconComponent,
        color: config.color,
        bg: config.bg,
        title: config.title,
        message,
        detail,
        date: apt.updated_at || apt.created_at,
        dependency: apt.dependencies?.name,
        appointmentDate: apt.scheduled_date,
        appointmentTime: apt.scheduled_time,
        isRead: readIds.includes(apt.id),
      });
    });

    return notifs.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [appointments, readIds]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const handleMarkAllRead = useCallback(() => {
    const allIds = notifications.map((n) => n.id);
    markAllAsRead(allIds);
    setReadNotifications(prev => [...new Set([...prev, ...allIds])]);
  }, [notifications]);

  const handleToggleExpand = useCallback((id) => {
    setExpandedId((prev) => (prev === id ? null : id));
    markAsRead(id);
    if (!readNotifications.includes(id)) {
      setReadNotifications(prev => [...prev, id]);
    }
  }, [readNotifications]);

  if (notifications.length === 0) {
    return (
      <div style={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 2rem',
        textAlign: 'center',
        color: '#9CA3AF',
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: '#F3F4F6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
        }}>
          <Bell size={32} />
        </div>
        <h3 style={{ 
          margin: '0 0 0.5rem',
          fontSize: '1.125rem',
          color: '#374151',
        }}>
          Sin notificaciones
        </h3>
        <p style={{ 
          margin: 0,
          fontSize: '0.875rem',
          color: '#6B7280',
        }}>
          Aquí verás las actualizaciones de tus citas
        </p>
      </div>
    );
  }

  return (
    <div style={{ 
      background: 'white',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    }}>
      {/* Header */}
      <div style={{ 
        padding: '1rem 1.5rem',
        borderBottom: '1px solid #F3F4F6',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <h3 style={{ 
            margin: 0, 
            fontSize: '1rem',
            fontWeight: 600,
          }}>
            Notificaciones
          </h3>
          <p style={{ 
            margin: '0.25rem 0 0',
            fontSize: '0.75rem',
            color: '#6B7280',
          }}>
            {unreadCount > 0 
              ? `${unreadCount} sin leer de ${notifications.length}`
              : `${notifications.length} notificación${notifications.length !== 1 ? 'es' : ''}`
            }
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.5rem 0.75rem',
              background: '#F3F4F6',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: 500,
              color: '#374151',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#E5E7EB'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#F3F4F6'}
          >
            <Eye size={14} />
            Marcar todo leído
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
        {notifications.map((notif, index) => {
          const IconComponent = notif.icon;
          const isExpanded = expandedId === notif.id;
          return (
            <div
              key={notif.id}
              onClick={() => handleToggleExpand(notif.id)}
              style={{
                padding: '1rem 1.5rem',
                borderBottom: index < notifications.length - 1 ? '1px solid #F3F4F6' : 'none',
                display: 'flex',
                gap: '0.75rem',
                cursor: 'pointer',
                background: notif.isRead ? 'transparent' : '#F0FDF4',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!isExpanded) e.currentTarget.style.background = '#F9FAFB';
              }}
              onMouseLeave={(e) => {
                if (!isExpanded) e.currentTarget.style.background = notif.isRead ? 'transparent' : '#F0FDF4';
              }}
            >
              {/* Unread indicator */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
              }}>
                {!notif.isRead && (
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#39A900',
                    flexShrink: 0,
                  }} />
                )}
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: notif.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <IconComponent size={20} style={{ color: notif.color }} />
                </div>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                }}>
                  <span style={{ 
                    fontSize: '0.875rem', 
                    fontWeight: notif.isRead ? 500 : 600,
                    color: '#374151',
                  }}>
                    {notif.title}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      color: '#9CA3AF',
                      whiteSpace: 'nowrap',
                    }}>
                      {formatTimeAgo(notif.date)}
                    </span>
                    {isExpanded ? (
                      <ChevronUp size={14} color="#9CA3AF" />
                    ) : (
                      <ChevronDown size={14} color="#9CA3AF" />
                    )}
                  </div>
                </div>
                
                <p style={{ 
                  margin: '0.25rem 0',
                  fontSize: '0.8125rem',
                  color: '#374151',
                  lineHeight: 1.4,
                }}>
                  {notif.message}
                </p>

                {/* Expanded detail */}
                {isExpanded && (
                  <div style={{
                    marginTop: '0.5rem',
                    padding: '0.75rem',
                    background: '#F9FAFB',
                    borderRadius: '8px',
                    borderLeft: `3px solid ${notif.color}`,
                  }}>
                    <p style={{ 
                      margin: 0,
                      fontSize: '0.8125rem',
                      color: '#6B7280',
                      lineHeight: 1.5,
                    }}>
                      {notif.detail}
                    </p>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      marginTop: '0.5rem',
                      fontSize: '0.7rem',
                      color: '#9CA3AF',
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Calendar size={12} />
                        {new Date(notif.appointmentDate).toLocaleDateString("es-ES")}
                      </span>
                      <span>{notif.appointmentTime}</span>
                    </div>
                  </div>
                )}

                {!isExpanded && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginTop: '0.25rem',
                    fontSize: '0.7rem',
                    color: '#9CA3AF',
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Calendar size={12} />
                      {new Date(notif.appointmentDate).toLocaleDateString("es-ES")}
                    </span>
                    <span>{notif.appointmentTime}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
