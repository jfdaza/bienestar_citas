import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { appointmentSchema } from "../validations/appointment.schema";
import { useAppointments } from "../hooks/useAppointments";
import { useState, useEffect } from "react";
import { supabaseAdmin } from "../../../lib/supabase";
import { 
  Calendar, Clock, FileText, CheckCircle, Lock, 
  ChevronLeft, ChevronRight, Info, CalendarDays
} from "lucide-react";

const MAX_REASON_LENGTH = 250;

const SERVICES = [
  { 
    id: "psicologia", 
    name: "Psicología", 
    description: "Apoyo emocional y bienestar mental",
    icon: "🧠",
    color: "psicologia"
  },
  { 
    id: "enfermeria", 
    name: "Enfermería", 
    description: "Atención en salud y orientación",
    icon: "❤️",
    color: "enfermeria"
  },
  { 
    id: "trabajo_social", 
    name: "Trabajo social", 
    description: "Apoyo social y acompañamiento",
    icon: "🤝",
    color: "trabajo_social"
  }
];

const TIME_SLOTS = [
  "8:00 a. m.",
  "9:00 a. m.",
  "10:00 a. m.",
  "11:00 a. m.",
  "2:00 p. m.",
  "3:00 p. m.",
  "4:00 p. m.",
  "5:00 p. m."
];

function getWeekDays() {
  const days = [];
  const today = new Date();
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + mondayOffset + i);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    days.push({
      date: `${y}-${m}-${d}`,
      day: date.toLocaleDateString("es-ES", { weekday: "short" }),
      number: date.getDate(),
      month: date.toLocaleDateString("es-ES", { month: "short" }),
      isToday: date.toDateString() === today.toDateString(),
    });
  }
  return days;
}

export function AppointmentForm({ onSuccess }) {
  const { createAppointment, isCreating } = useAppointments();
  const [dependencies, setDependencies] = useState([]);
  const [reasonLength, setReasonLength] = useState(0);
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [weekDays, setWeekDays] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      dependency_id: "",
      scheduled_date: "",
      scheduled_time: "08:00",
      reason: "",
    },
  });

  const reasonValue = watch("reason");

  useEffect(() => {
    setReasonLength(reasonValue?.length || 0);
  }, [reasonValue]);

  useEffect(() => {
    setWeekDays(getWeekDays());
  }, []);

  useEffect(() => {
    async function loadDependencies() {
      if (!supabaseAdmin) {
        console.error("supabaseAdmin no disponible — falta VITE_SUPABASE_SERVICE_ROLE_KEY");
        return;
      }
      const { data, error } = await supabaseAdmin.from("dependencies").select("*");
      if (error) {
        console.error("Error cargando dependencias:", error.message);
      }
      setDependencies(data || []);
    }
    loadDependencies();
  }, []);

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    const normalize = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[_\s]+/g, " ").trim();
    const dep = dependencies.find(d => 
      normalize(d.name).includes(normalize(service.id))
    );
    if (dep) {
      setValue("dependency_id", dep.id, { shouldValidate: true });
      setStep(2);
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setValue("scheduled_date", date.date);
    setStep(3);
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    const timeValue = time.replace(" a. m.", "").replace(" p. m.", "");
    const isPM = time.includes("p. m.");
    let hour = parseInt(timeValue.split(":")[0]);
    if (isPM && hour !== 12) hour += 12;
    if (!isPM && hour === 12) hour = 0;
    setValue("scheduled_time", `${hour.toString().padStart(2, "0")}:00`);
    setStep(4);
  };

  const onSubmit = async (data) => {
    const result = await createAppointment(data);
    if (result.success) {
      onSuccess?.();
    }
  };

  const stepLabels = ["Servicio", "Fecha", "Hora", "Confirmar"];

  return (
    <div className="new-appointment-form">
      {/* Step Indicator */}
      <div className="auth-steps">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className={`auth-step ${step >= s ? 'active' : ''} ${step > s ? 'completed' : ''}`}>
            <div className="auth-step-circle">
              {step > s ? <CheckCircle size={16} /> : s}
            </div>
            <span className="auth-step-label">{stepLabels[s - 1]}</span>
            {s < 4 && <div className={`auth-step-line ${step > s ? 'completed' : ''}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Select Service */}
      {step === 1 && (
        <div className="form-section">
          <div className="form-section-header">
            <h3 className="form-section-title">
              <span>1</span>
              Selecciona el servicio
            </h3>
          </div>
          <p className="form-section-subtitle">Elige el área de bienestar que necesitas.</p>
          
          <div className="service-cards">
            {SERVICES.map((service) => (
              <div
                key={service.id}
                className={`service-card ${selectedService?.id === service.id ? 'selected' : ''}`}
                onClick={() => handleServiceSelect(service)}
              >
                <div className={`service-card-icon ${service.color}`}>
                  {service.icon}
                </div>
                <h4 className="service-card-name">{service.name}</h4>
                <p className="service-card-desc">{service.description}</p>
                {selectedService?.id === service.id && (
                  <div className="service-card-check">
                    <CheckCircle size={16} />
                  </div>
                )}
              </div>
            ))}
          </div>
          {errors.dependency_id && (
            <span className="error">{errors.dependency_id.message}</span>
          )}
        </div>
      )}

      {/* Step 2: Select Date */}
      {step === 2 && (
        <div className="form-section">
          <div className="form-section-header">
            <h3 className="form-section-title">
              <span>2</span>
              Selecciona la fecha
            </h3>
            <button className="form-section-link" onClick={() => setStep(1)}>
              Cambiar servicio
            </button>
          </div>
          
          <div className="date-picker-container">
            <div className="date-cards">
              {weekDays.map((day) => (
                <div
                  key={day.date}
                  className={`date-card ${selectedDate?.date === day.date ? 'selected' : ''}`}
                  onClick={() => handleDateSelect(day)}
                >
                  <span className="date-card-day">{day.day}</span>
                  <span className="date-card-number">{day.number}</span>
                  <span className="date-card-month">{day.month}</span>
                </div>
              ))}
            </div>
            <div className="date-info">
              <Calendar size={14} />
              Solo se muestran fechas con disponibilidad
            </div>
          </div>
          {errors.scheduled_date && (
            <span className="error">{errors.scheduled_date.message}</span>
          )}
        </div>
      )}

      {/* Step 3: Select Time */}
      {step === 3 && (
        <div className="form-section">
          <div className="form-section-header">
            <h3 className="form-section-title">
              <span>3</span>
              Selecciona la hora
            </h3>
            <div className="time-info">
              <Clock size={14} />
              Duración: 60 min
            </div>
          </div>
          <p className="form-section-subtitle">Las horas mostradas están disponibles.</p>
          
          <div className="time-cards">
            {TIME_SLOTS.map((time) => (
              <div
                key={time}
                className={`time-card ${selectedTime === time ? 'selected' : ''}`}
                onClick={() => handleTimeSelect(time)}
              >
                {time}
              </div>
            ))}
          </div>
          <div className="time-info">
            <Clock size={14} />
            Duración aproximada: 60 minutos
          </div>
        </div>
      )}

      {/* Step 4: Confirm */}
      {step === 4 && (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-section">
            <div className="form-section-header">
              <h3 className="form-section-title">
                <span>4</span>
                Motivo de consulta
                <span style={{ fontWeight: 400, fontSize: '0.875rem', color: '#6B7280' }}>(opcional)</span>
              </h3>
              <span className="char-count">{reasonLength}/{MAX_REASON_LENGTH}</span>
            </div>
            
            <div className="field">
              <textarea
                {...register("reason")}
                rows="4"
                placeholder="Cuéntanos brevemente el motivo de tu consulta..."
                maxLength={MAX_REASON_LENGTH}
              />
              {errors.reason && (
                <span className="error">{errors.reason.message}</span>
              )}
            </div>

            {(errors.dependency_id || errors.scheduled_date || errors.scheduled_time) && (
              <div className="important-note" style={{ borderColor: '#EF4444', background: '#FEF2F2' }}>
                <Info size={20} style={{ color: '#EF4444' }} />
                <div className="important-note-content">
                  <span className="important-note-title" style={{ color: '#EF4444' }}>Error de validación</span>
                  {errors.dependency_id && <span className="error">{errors.dependency_id.message}</span>}
                  {errors.scheduled_date && <span className="error">{errors.scheduled_date.message}</span>}
                  {errors.scheduled_time && <span className="error">{errors.scheduled_time.message}</span>}
                </div>
              </div>
            )}

            <div className="important-note">
              <Info size={20} />
              <div className="important-note-content">
                <span className="important-note-title">Importante</span>
                <span className="important-note-text">
                  Llega 10 minutos antes de tu cita y recuerda llevar tu documento de identidad.
                </span>
              </div>
            </div>

            <div className="form-actions" style={{ flexDirection: 'column', gap: '0.75rem' }}>
              <button 
                type="submit" 
                disabled={isCreating} 
                className="btn-primary"
              >
                <CalendarDays size={20} />
                {isCreating ? "Confirmando..." : "Confirmar cita"}
              </button>
              <button 
                type="button" 
                className="btn-secondary"
                onClick={() => setStep(3)}
              >
                <ChevronLeft size={16} />
                Atrás
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Back button for steps 1-3 */}
      {step < 4 && step > 1 && (
        <button 
          type="button" 
          className="btn-secondary"
          onClick={() => setStep(step - 1)}
          style={{ marginTop: '1rem' }}
        >
          <ChevronLeft size={16} />
          Atrás
        </button>
      )}

      {/* Data Protection */}
      <div className="data-protection">
        <Lock size={14} />
        Tus datos están protegidos
      </div>
    </div>
  );
}
