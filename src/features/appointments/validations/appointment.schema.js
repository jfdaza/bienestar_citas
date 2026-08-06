import { z } from "zod";
import { isWeekend, isPast, addDays, startOfDay } from "date-fns";

function parseLocalDate(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// Esquema de validación robusto
export const appointmentSchema = z.object({
  dependency_id: z.number().int().positive("Selecciona una dependencia"),

  scheduled_date: z
    .string()
    .refine((date) => !isWeekend(parseLocalDate(date)), {
      message: "No se agendan citas los fines de semana",
    })
    .refine((date) => !isPast(startOfDay(parseLocalDate(date))), {
      message: "No puedes agendar en fechas pasadas",
    })
    .refine(
      (date) => {
        const minDate = addDays(new Date(), 1);
        return parseLocalDate(date) >= startOfDay(minDate);
      },
      {
        message: "Debes agendar con mínimo 24 horas de anticipación",
      },
    ),

  scheduled_time: z
    .string()
    .regex(/^([0-9]{2}):([0-9]{2})$/, "Formato de hora inválido")
    .refine(
      (time) => {
        const [hours] = time.split(":").map(Number);
        return hours >= 8 && hours < 17; // 8 AM a 5 PM
      },
      {
        message: "Horario debe ser entre 8:00 AM y 5:00 PM",
      },
    ),

  reason: z.union([
    z.string().min(10, "Describe tu situación en al menos 10 caracteres").max(250, "Máximo 250 caracteres"),
    z.literal(""),
    z.undefined()
  ]).optional(),

  notes: z.string().max(1000).optional(),
});

// Esquema para edición (sin dependency_id)
export const editAppointmentSchema = appointmentSchema.omit({ dependency_id: true, reason: true });
