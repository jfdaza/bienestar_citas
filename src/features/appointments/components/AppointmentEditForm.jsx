import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { editAppointmentSchema } from "../validations/appointment.schema";
import { useAppointments } from "../hooks/useAppointments";

export function AppointmentEditForm({ appointment, onSuccess, onCancel }) {
  const { editAppointment, isUpdating } = useAppointments();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(editAppointmentSchema),
    defaultValues: {
      scheduled_date: appointment.scheduled_date,
      scheduled_time: appointment.scheduled_time,
    },
  });

  const onSubmit = async (data) => {
    const result = await editAppointment(appointment.id, data, appointment);
    if (result.success) {
      onSuccess?.();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="appointment-form">
      <div className="field">
        <label>Dependencia</label>
        <input
          type="text"
          value={appointment.dependencies?.name || "Sin dependencia"}
          disabled
          className="field-disabled"
        />
      </div>

      <div className="field-row">
        <div className="field">
          <label>Fecha</label>
          <input type="date" {...register("scheduled_date")} />
          {errors.scheduled_date && (
            <span className="error">{errors.scheduled_date.message}</span>
          )}
        </div>

        <div className="field">
          <label>Hora</label>
          <select {...register("scheduled_time")}>
            {Array.from({ length: 9 }, (_, i) => {
              const hour = (8 + i).toString().padStart(2, "0");
              return (
                <option key={hour} value={`${hour}:00`}>
                  {hour}:00
                </option>
              );
            })}
          </select>
        </div>
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancelar
        </button>
        <button type="submit" disabled={isUpdating} className="btn-primary">
          {isUpdating ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>
    </form>
  );
}
