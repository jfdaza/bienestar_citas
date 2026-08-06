import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import {
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Pencil,
  Lock,
} from "lucide-react";

const STATUS_CONFIG = {
  pending: { label: "Pendiente", color: "#f59e0b", icon: AlertCircle },
  confirmed: { label: "Confirmada", color: "#3b82f6", icon: CheckCircle },
  completed: { label: "Completada", color: "#22c55e", icon: CheckCircle },
  cancelled: { label: "Cancelada", color: "#ef4444", icon: XCircle },
  no_show: { label: "No asistió", color: "#6b7280", icon: XCircle },
};

export function AppointmentCard({ appointment, onCancel, onEdit, isAprendiz }) {
  const {
    dependencies,
    scheduled_date,
    scheduled_time,
    status,
    reason,
    notes,
    profiles,
  } = appointment;
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  const isLocked = status === "completed" || status === "no_show" || status === "cancelled";

  return (
    <div
      className={`appointment-card ${isLocked ? "appointment-locked-card" : ""}`}
      style={{ borderLeft: `4px solid ${dependencies?.color || "#ccc"}` }}
    >
      <div className="card-header">
        <div
          className="dependency-badge"
          style={{ background: dependencies?.color }}
        >
          {dependencies?.name}
        </div>
        <div className="status-badge" style={{ color: config.color }}>
          <Icon size={16} />
          <span>{config.label}</span>
          {isLocked && <Lock size={14} className="lock-icon" />}
        </div>
      </div>

      <div className="card-datetime">
        <div className="datetime-item">
          <Calendar size={16} />
          <span>{format(parseISO(scheduled_date), "PPP", { locale: es })}</span>
        </div>
        <div className="datetime-item">
          <Clock size={16} />
          <span>{scheduled_time}</span>
        </div>
      </div>

      <div className="card-body">
        <p className="reason">{reason}</p>
        {!isAprendiz && profiles && (
          <div className="aprendiz-info">
            <User size={14} />
            <span>{profiles.full_name}</span>
          </div>
        )}
        {notes && (
          <div className="appointment-notes">
            <strong>Nota:</strong> {notes}
          </div>
        )}
      </div>

      {isAprendiz && (status === "pending" || status === "confirmed") && (
        <div className="card-actions">
          <button onClick={onEdit} className="btn-secondary">
            <Pencil size={14} />
            Modificar
          </button>
          {status === "pending" && (
            <button onClick={onCancel} className="btn-danger">
              Cancelar Cita
            </button>
          )}
        </div>
      )}

      {isAprendiz && isLocked && status !== "cancelled" && (
        <div className="card-locked-message">
          <Lock size={14} />
          <span>
            {status === "completed" && "Cita atendida - No puedes modificarla"}
            {status === "no_show" && "Marcada como inasistencia"}
          </span>
        </div>
      )}
    </div>
  );
}
