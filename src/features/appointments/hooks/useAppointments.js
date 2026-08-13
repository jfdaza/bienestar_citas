import { useState, useCallback } from "react";
import { AppointmentRepository } from "../api/appointments.repository";
import { toast } from "sonner";
import { useAuth } from "../../../providers/AuthProvider";

// Mapeo de nombre de rol → dependency_id
const ROLE_TO_DEPENDENCY = {
  PSICOLOGIA: 1,
  ENFERMERIA: 2,
  TRABAJO_SOCIAL: 3,
};

// ESTADOS DE CARGA ESPECÍFICOS (mejor UX que un genérico "loading")
const STATUS = {
  IDLE: "idle",
  CREATING: "creating",
  FETCHING: "fetching",
  UPDATING: "updating",
  ERROR: "error",
};

export function useAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [status, setStatus] = useState(STATUS.IDLE);
  const [error, setError] = useState(null);
  const { user, profile, isAprendiz, isCoordination } = useAuth();

  // FETCH: Obtener citas según el rol automáticamente
  const fetchAppointments = useCallback(
    async (filters = {}) => {
      setStatus(STATUS.FETCHING);
      setError(null);

      try {
        // RBAC implícito: los filtros dependen del rol
        let roleFilters;
        if (isAprendiz()) {
          roleFilters = { userId: user.id };
        } else if (isCoordination()) {
          // Coordinación ve TODAS las dependencias
          roleFilters = {};
        } else {
          // Profesional: filtrar por su dependencia (via role o profile)
          const depId = profile?.dependency_id
            || ROLE_TO_DEPENDENCY[profile?.roles?.name]
            || null;
          roleFilters = depId ? { dependencyId: depId } : {};
        }

        const data = await AppointmentRepository.fetch({
          ...roleFilters,
          ...filters,
        });
        setAppointments(data);
        return data;
      } catch (err) {
        setError(err.message);
        toast.error("Error cargando citas");
        return [];
      } finally {
        setStatus(STATUS.IDLE);
      }
    },
    [user, profile, isAprendiz, isCoordination],
  );

  // CREATE: Crear cita con validaciones de negocio
  const createAppointment = async (formData) => {
    setStatus(STATUS.CREATING);

    try {
      // Regla de negocio: Máximo 2 citas pendientes
      if (isAprendiz()) {
        const pendingCount = await AppointmentRepository.countPending(user.id);
        if (pendingCount >= 2) {
          throw new Error(
            "Ya tienes 2 citas pendientes. Espera a que se atienda una.",
          );
        }
      }

      // Verificar disponibilidad de horario
      const isAvailable = await AppointmentRepository.checkAvailability(
        formData.dependency_id,
        formData.scheduled_date,
        formData.scheduled_time,
      );

      if (!isAvailable) {
        throw new Error("Este horario ya está ocupado. Selecciona otro.");
      }

      // Crear la cita
      const newAppointment = await AppointmentRepository.create({
        ...formData,
        user_id: user.id,
        status: "pending",
      });

      // OPTIMISTIC UPDATE: Actualizamos UI inmediatamente
      setAppointments((prev) => [...prev, newAppointment]);
      toast.success("Cita agendada correctamente");
      return { success: true, data: newAppointment };
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      return { success: false, error: err.message };
    } finally {
      setStatus(STATUS.IDLE);
    }
  };

  // UPDATE STATUS: Cambiar estado (confirmar, completar, cancelar)
  const updateStatus = async (appointmentId, newStatus, notes = null, professionalId = null) => {
    setStatus(STATUS.UPDATING);

    try {
      const updates = { status: newStatus };
      if (notes) updates.notes = notes;
      if (professionalId) updates.professional_id = professionalId;

      const updated = await AppointmentRepository.update(
        appointmentId,
        updates,
      );

      // Actualizar estado local sin recargar todo
      setAppointments((prev) =>
        prev.map((app) => (app.id === appointmentId ? updated : app)),
      );

      toast.success(
        `Cita ${newStatus === "confirmed" ? "confirmada" : "actualizada"}`,
      );
      return { success: true };
    } catch (err) {
      toast.error(err.message || "Error actualizando cita");
      return { success: false, error: err.message };
    } finally {
      setStatus(STATUS.IDLE);
    }
  };

  // CANCEL: Cancelar cita (solo si está pending)
  const cancelAppointment = async (appointmentId) => {
    const appointment = appointments.find((a) => a.id === appointmentId);

    if (!appointment) {
      toast.error("Cita no encontrada");
      return { success: false };
    }

    if (appointment.status !== "pending") {
      toast.error("Solo puedes cancelar citas pendientes");
      return { success: false };
    }

    return updateStatus(appointmentId, "cancelled");
  };

  // EDIT: Modificar cita (solo si está pending)
  const editAppointment = async (appointmentId, formData, currentAppointment) => {
    setStatus(STATUS.UPDATING);

    try {
      const status = currentAppointment?.status || appointments.find((a) => a.id === appointmentId)?.status;

      if (status !== "pending" && status !== "confirmed") {
        throw new Error("Solo puedes modificar citas pendientes o confirmadas");
      }

      // Verificar disponibilidad excluyendo la cita actual
      const isAvailable = await AppointmentRepository.checkAvailability(
        currentAppointment?.dependency_id || formData.dependency_id,
        formData.scheduled_date,
        formData.scheduled_time,
        appointmentId,
      );

      if (!isAvailable) {
        throw new Error("Este horario ya está ocupado. Selecciona otro.");
      }

      const updated = await AppointmentRepository.update(appointmentId, {
        scheduled_date: formData.scheduled_date,
        scheduled_time: formData.scheduled_time,
        reason: currentAppointment?.reason,
      });

      setAppointments((prev) =>
        prev.map((app) => (app.id === appointmentId ? updated : app)),
      );

      toast.success("Cita modificada correctamente");
      return { success: true, data: updated };
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      return { success: false, error: err.message };
    } finally {
      setStatus(STATUS.IDLE);
    }
  };

  return {
    appointments,
    status,
    error,
    isLoading: status === STATUS.FETCHING,
    isCreating: status === STATUS.CREATING,
    isUpdating: status === STATUS.UPDATING,
    fetchAppointments,
    createAppointment,
    updateStatus,
    cancelAppointment,
    editAppointment,
  };
}
