import { useEffect, useState } from "react";
import { useAdmin } from "../hooks/useAdmin";
import { Clock, User, Settings, Shield, Activity, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { formatTimeAgo } from "../../../shared/utils/format";

const ACTION_CONFIG = {
  CREATE_USER: {
    label: "Usuario creado",
    color: "#22C55E",
    icon: User,
  },
  UPDATE_USER: {
    label: "Usuario actualizado",
    color: "#3B82F6",
    icon: User,
  },
  update_user: {
    label: "Usuario actualizado",
    color: "#3B82F6",
    icon: User,
  },
  DELETE_USER: {
    label: "Usuario eliminado",
    color: "#EF4444",
    icon: User,
  },
  UPDATE_CONFIG: {
    label: "Configuración modificada",
    color: "#F59E0B",
    icon: Settings,
  },
  CREATE_APPOINTMENT: {
    label: "Cita creada",
    color: "#22C55E",
    icon: Activity,
  },
  UPDATE_APPOINTMENT: {
    label: "Cita actualizada",
    color: "#3B82F6",
    icon: Activity,
  },
};

const ENTITY_LABELS = {
  user: "Usuario",
  profile: "Perfil",
  appointment: "Cita",
  dependency: "Dependencia",
  config: "Configuración",
  role: "Rol",
};

const FIELD_LABELS = {
  full_name: "Nombre completo",
  document_number: "Número de documento",
  email: "Correo electrónico",
  role_id: "Rol",
  dependency_id: "Dependencia",
  is_active: "Estado",
  phone: "Teléfono",
  address: "Dirección",
};

function formatFieldValue(key, value) {
  if (value === null || value === undefined) return "—";
  if (key === "is_active") return value ? "Activo" : "Inactivo";
  if (key === "role_id") return `Rol #${value}`;
  if (key === "dependency_id") return `Dependencia #${value}`;
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function ChangesDetail({ oldData, newData }) {
  const [expanded, setExpanded] = useState(false);

  if (!oldData && !newData) return null;

  const changes = [];
  if (oldData && newData) {
    const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);
    allKeys.forEach((key) => {
      if (key === "updated_at" || key === "created_at" || key === "id") return;
      const oldVal = oldData[key];
      const newVal = newData[key];
      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        changes.push({
          field: FIELD_LABELS[key] || key,
          from: formatFieldValue(key, oldVal),
          to: formatFieldValue(key, newVal),
        });
      }
    });
  } else if (newData && !oldData) {
    Object.keys(newData).forEach((key) => {
      if (key === "updated_at" || key === "created_at" || key === "id") return;
      if (newData[key] !== null && newData[key] !== undefined) {
        changes.push({
          field: FIELD_LABELS[key] || key,
          from: null,
          to: formatFieldValue(key, newData[key]),
        });
      }
    });
  }

  if (changes.length === 0) return null;

  return (
    <div style={{ marginTop: '0.5rem' }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          background: 'none',
          border: 'none',
          color: '#6B7280',
          fontSize: '0.75rem',
          cursor: 'pointer',
          padding: '0.25rem 0',
        }}
      >
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        {expanded ? 'Ocultar cambios' : `Ver ${changes.length} cambio(s)`}
      </button>
      
      {expanded && (
        <div style={{
          marginTop: '0.5rem',
          padding: '0.75rem',
          background: '#F9FAFB',
          borderRadius: '8px',
          fontSize: '0.8125rem',
        }}>
          {changes.map((change, idx) => (
            <div key={idx} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem',
              padding: '0.35rem 0',
              borderBottom: idx < changes.length - 1 ? '1px solid #E5E7EB' : 'none',
            }}>
              <span style={{ 
                fontWeight: 500, 
                color: '#374151',
                minWidth: '100px',
              }}>
                {change.field}:
              </span>
              <div style={{ flex: 1 }}>
                {change.from && (
                  <span style={{ color: '#EF4444', textDecoration: 'line-through' }}>
                    {change.from}
                  </span>
                )}
                {change.from && change.to && (
                  <span style={{ margin: '0 0.35rem', color: '#6B7280' }}>→</span>
                )}
                <span style={{ color: '#22C55E', fontWeight: 500 }}>
                  {change.to}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AuditLogViewer() {
  const { auditLogs, fetchAuditLogs } = useAdmin();
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  const filteredLogs = filter
    ? auditLogs.filter(
        (l) =>
          l.action?.toLowerCase().includes(filter.toLowerCase()) ||
          l.entity_type?.toLowerCase().includes(filter.toLowerCase()) ||
          l.admin?.full_name?.toLowerCase().includes(filter.toLowerCase()) ||
          l.admin?.email?.toLowerCase().includes(filter.toLowerCase()),
      )
    : auditLogs;

  const getActionConfig = (action) => {
    return ACTION_CONFIG[action] || {
      label: action?.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) || "Acción desconocida",
      color: "#6B7280",
      icon: Activity,
    };
  };

  const getEntityLabel = (entityType) => {
    return ENTITY_LABELS[entityType] || entityType || "Elemento";
  };

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2>Registro de Auditoría</h2>
        <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>
          {filteredLogs.length} registros
        </span>
      </div>

      <div className="filters-bar">
        <div className="search-box">
          <Filter size={16} />
          <input
            type="text"
            placeholder="Buscar por acción, entidad o administrador..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="audit-timeline">
        {filteredLogs.map((log) => {
          const config = getActionConfig(log.action);
          const IconComponent = config.icon;

          return (
            <div key={log.id} className="audit-item">
              <div
                className="audit-dot"
                style={{ background: config.color }}
              />
              <div className="audit-content" style={{ flex: 1 }}>
                <div className="audit-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <IconComponent size={16} style={{ color: config.color }} />
                    <span className="audit-action" style={{ color: config.color }}>
                      {config.label}
                    </span>
                  </div>
                  <span className="audit-time">
                    <Clock size={14} />
                    {formatTimeAgo(log.created_at)}
                  </span>
                </div>
                
                <div style={{ 
                  marginTop: '0.35rem', 
                  fontSize: '0.875rem', 
                  color: '#374151',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  flexWrap: 'wrap',
                }}>
                  <span style={{ fontWeight: 500 }}>
                    {getEntityLabel(log.entity_type)}
                  </span>
                  {log.entity_id && (
                    <span style={{ 
                      background: '#F3F4F6',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      color: '#6B7280',
                    }}>
                      #{log.entity_id}
                    </span>
                  )}
                </div>

                {log.admin && (
                  <div style={{ 
                    marginTop: '0.35rem', 
                    fontSize: '0.8125rem', 
                    color: '#6B7280',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}>
                    <User size={12} />
                    <span>{log.admin.full_name || log.admin.email}</span>
                  </div>
                )}

                <ChangesDetail oldData={log.old_data} newData={log.new_data} />

                <div style={{ 
                  marginTop: '0.5rem', 
                  fontSize: '0.75rem', 
                  color: '#9CA3AF',
                }}>
                  {new Date(log.created_at).toLocaleString("es-ES", {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          );
        })}

        {filteredLogs.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem', 
            color: '#9CA3AF' 
          }}>
            <Activity size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p>No hay registros de auditoría</p>
            {filter && (
              <button 
                onClick={() => setFilter("")}
                style={{ 
                  marginTop: '0.5rem', 
                  background: 'none', 
                  border: 'none', 
                  color: '#39A900',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                Limpiar filtro
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
