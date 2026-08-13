import { useState, useMemo, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Clock, User, AlertTriangle } from "lucide-react";
import { supabaseAdmin as supabase } from "../../../lib/supabase";
import {
  MONTH_NAMES, DAYS_OF_WEEK, getDaysInMonth,
  getFirstDayOfMonth, formatDateStr, navigateMonth
} from "../../../shared/utils/calendar";

const TIME_SLOTS = [
  "07:00", "07:30", "08:00", "08:30", "09:00", "09:30",
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30",
];

export function CalendarView({ appointments = [], dependencyId = null }) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  const [busySlots, setBusySlots] = useState({});
  const [loadingSlots, setLoadingSlots] = useState(false);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const appointmentsByDate = useMemo(() => {
    const map = {};
    appointments.forEach((apt) => {
      const dateStr = apt.scheduled_date;
      if (!map[dateStr]) map[dateStr] = [];
      map[dateStr].push(apt);
    });
    return map;
  }, [appointments]);

  // Fetch busy slots for the visible month
  const fetchBusySlots = useCallback(async () => {
    if (!dependencyId) return;
    
    setLoadingSlots(true);
    try {
      const dateFrom = formatDateStr(currentYear, currentMonth, 1);
      const dateTo = formatDateStr(currentYear, currentMonth, daysInMonth);

      const { data, error } = await supabase
        .from("appointments")
        .select("scheduled_date, scheduled_time")
        .eq("dependency_id", dependencyId)
        .gte("scheduled_date", dateFrom)
        .lte("scheduled_date", dateTo)
        .in("status", ["pending", "confirmed"]);

      if (error) throw error;

      const slotsMap = {};
      (data || []).forEach((apt) => {
        if (!slotsMap[apt.scheduled_date]) {
          slotsMap[apt.scheduled_date] = [];
        }
        slotsMap[apt.scheduled_date].push(apt.scheduled_time);
      });

      setBusySlots(slotsMap);
    } catch {
      // Silently fail - calendar still works without busy slots
    } finally {
      setLoadingSlots(false);
    }
  }, [currentYear, currentMonth, daysInMonth, dependencyId]);

  useEffect(() => {
    fetchBusySlots();
  }, [fetchBusySlots]);

  const prevMonth = () => {
    const { year, month } = navigateMonth(currentYear, currentMonth, -1);
    setCurrentYear(year);
    setCurrentMonth(month);
  };

  const nextMonth = () => {
    const { year, month } = navigateMonth(currentYear, currentMonth, 1);
    setCurrentYear(year);
    setCurrentMonth(month);
  };

  const goToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setSelectedDate(null);
  };

  const isToday = (day) => {
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  const hasAppointments = (day) => {
    const dateStr = formatDateStr(currentYear, currentMonth, day);
    return appointmentsByDate[dateStr]?.length > 0;
  };

  const hasBusySlots = (day) => {
    const dateStr = formatDateStr(currentYear, currentMonth, day);
    return busySlots[dateStr]?.length > 0;
  };

  const getBusyCount = (day) => {
    const dateStr = formatDateStr(currentYear, currentMonth, day);
    return busySlots[dateStr]?.length || 0;
  };

  const getAppointmentsForDay = (day) => {
    const dateStr = formatDateStr(currentYear, currentMonth, day);
    return appointmentsByDate[dateStr] || [];
  };

  const getBusySlotsForDay = (day) => {
    const dateStr = formatDateStr(currentYear, currentMonth, day);
    return busySlots[dateStr] || [];
  };

  const selectedAppointments = selectedDate
    ? getAppointmentsForDay(selectedDate)
    : [];

  const selectedBusySlots = selectedDate
    ? getBusySlotsForDay(selectedDate)
    : [];

  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const isPastDate = (day) => {
    const date = new Date(currentYear, currentMonth, day);
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return date < todayStart;
  };

  return (
    <div style={{ 
      background: 'white', 
      borderRadius: '16px', 
      padding: '1.5rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <button
          onClick={prevMonth}
          style={{
            background: 'none',
            border: 'none',
            padding: '0.5rem',
            cursor: 'pointer',
            borderRadius: '8px',
            color: '#374151',
          }}
        >
          <ChevronLeft size={20} />
        </button>
        
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>
            {MONTH_NAMES[currentMonth]} {currentYear}
          </h3>
          <button
            onClick={goToToday}
            style={{
              background: 'none',
              border: 'none',
              color: '#39A900',
              fontSize: '0.75rem',
              fontWeight: 500,
              cursor: 'pointer',
              marginTop: '0.25rem',
            }}
          >
            Volver a hoy
          </button>
        </div>

        <button
          onClick={nextMonth}
          style={{
            background: 'none',
            border: 'none',
            padding: '0.5rem',
            cursor: 'pointer',
            borderRadius: '8px',
            color: '#374151',
          }}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Days of Week */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '0.25rem',
        marginBottom: '0.5rem',
      }}>
        {DAYS_OF_WEEK.map((day) => (
          <div
            key={day}
            style={{
              textAlign: 'center',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#6B7280',
              padding: '0.5rem',
            }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '0.25rem',
      }}>
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} style={{ padding: '0.5rem' }} />;
          }

          const isSelected = selectedDate === day;
          const isTodayDate = isToday(day);
          const hasApts = hasAppointments(day);
          const hasBusy = hasBusySlots(day);
          const busyCount = getBusyCount(day);
          const isPast = isPastDate(day);

          return (
            <button
              key={day}
              onClick={() => setSelectedDate(isSelected ? null : day)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.5rem',
                minHeight: '48px',
                border: isTodayDate ? '2px solid #39A900' : 'none',
                borderRadius: '12px',
                background: isSelected ? '#39A900' : isTodayDate ? '#E6F4EA' : 'transparent',
                color: isSelected ? 'white' : isTodayDate ? '#39A900' : isPast ? '#D1D5DB' : '#374151',
                cursor: 'pointer',
                fontWeight: isTodayDate || isSelected ? 600 : 400,
                fontSize: '0.875rem',
                position: 'relative',
                transition: 'all 0.15s ease',
                opacity: isPast ? 0.5 : 1,
              }}
            >
              {day}
              {/* Appointment dot */}
              {hasApts && (
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: isSelected ? 'white' : '#39A900',
                  marginTop: '2px',
                }} />
              )}
              {/* Busy slots indicator */}
              {hasBusy && !hasApts && (
                <div style={{
                  display: 'flex',
                  gap: '2px',
                  marginTop: '2px',
                }}>
                  {Array.from({ length: Math.min(busyCount, 3) }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        width: '4px',
                        height: '4px',
                        borderRadius: '50%',
                        background: isSelected ? 'rgba(255,255,255,0.7)' : '#F59E0B',
                      }}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Date Details */}
      {selectedDate && (
        <div style={{ 
          marginTop: '1.5rem',
          borderTop: '1px solid #E5E7EB',
          paddingTop: '1rem',
        }}>
          <h4 style={{ 
            margin: '0 0 0.75rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#374151',
          }}>
            {selectedDate} de {MONTH_NAMES[currentMonth]}
          </h4>

          {/* Busy Slots Section */}
          {selectedBusySlots.length > 0 && (
            <div style={{
              marginBottom: '1rem',
              padding: '0.75rem',
              background: '#FFFBEB',
              borderRadius: '8px',
              borderLeft: '3px solid #F59E0B',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem',
              }}>
                <AlertTriangle size={14} color="#F59E0B" />
                <span style={{ 
                  fontSize: '0.8125rem', 
                  fontWeight: 600,
                  color: '#92400E',
                }}>
                  Horarios ocupados ({selectedBusySlots.length})
                </span>
                {loadingSlots && (
                  <span style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>Cargando...</span>
                )}
              </div>
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '0.35rem' 
              }}>
                {selectedBusySlots.sort().map((time) => (
                  <span
                    key={time}
                    style={{
                      padding: '0.25rem 0.5rem',
                      background: '#FDE68A',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: 500,
                      color: '#92400E',
                    }}
                  >
                    {time}
                  </span>
                ))}
              </div>
              <p style={{
                margin: '0.5rem 0 0',
                fontSize: '0.7rem',
                color: '#B45309',
              }}>
                Estos horarios ya están reservados por otros aprendices
              </p>
            </div>
          )}

          {/* Appointments Section */}
          {selectedAppointments.length === 0 ? (
            <p style={{ 
              fontSize: '0.875rem', 
              color: '#9CA3AF',
              textAlign: 'center',
              padding: '1rem',
            }}>
              No hay citas para este día
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {selectedAppointments.map((apt) => (
                <div
                  key={apt.id}
                  style={{
                    padding: '0.75rem',
                    background: '#F9FAFB',
                    borderRadius: '8px',
                    borderLeft: '3px solid #39A900',
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}>
                    <div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}>
                        <Clock size={14} color="#6B7280" />
                        <span style={{ 
                          fontSize: '0.875rem', 
                          fontWeight: 600,
                          color: '#374151',
                        }}>
                          {apt.scheduled_time}
                        </span>
                      </div>
                      <span style={{ 
                        fontSize: '0.8125rem', 
                        fontWeight: 500,
                        color: '#374151',
                        display: 'block',
                        marginTop: '0.25rem',
                      }}>
                        {apt.dependencies?.name || 'Sin dependencia'}
                      </span>
                      {apt.profiles && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          marginTop: '0.25rem',
                        }}>
                          <User size={12} color="#6B7280" />
                          <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                            {apt.profiles.full_name}
                          </span>
                        </div>
                      )}
                    </div>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      padding: '0.2rem 0.5rem',
                      borderRadius: '9999px',
                      background: apt.status === 'completed' ? '#D1FAE5' : 
                                  apt.status === 'cancelled' ? '#FEE2E2' : '#FEF3C7',
                      color: apt.status === 'completed' ? '#059669' : 
                             apt.status === 'cancelled' ? '#DC2626' : '#D97706',
                    }}>
                      {apt.status === 'completed' ? 'Completada' : 
                       apt.status === 'cancelled' ? 'Cancelada' : 
                       apt.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginTop: '1rem',
        paddingTop: '1rem',
        borderTop: '1px solid #F3F4F6',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <div style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            background: '#39A900' 
          }} />
          <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>Con citas</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <div style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            background: '#F59E0B' 
          }} />
          <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>Horarios ocupados</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <div style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            border: '2px solid #39A900',
            background: 'white',
          }} />
          <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>Hoy</span>
        </div>
      </div>
    </div>
  );
}
