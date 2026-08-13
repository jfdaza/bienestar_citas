export const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export const DAYS_OF_WEEK = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year, month) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

export function formatDateStr(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function isWeekendByDayOfWeek(dayOfWeek) {
  return dayOfWeek === 0 || dayOfWeek === 6;
}

export function isPastDateByYMD(year, month, day) {
  const date = new Date(year, month, day);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  return date < todayStart;
}

export function navigateMonth(currentYear, currentMonth, direction) {
  let newMonth = currentMonth + direction;
  let newYear = currentYear;
  if (newMonth < 0) {
    newMonth = 11;
    newYear--;
  } else if (newMonth > 11) {
    newMonth = 0;
    newYear++;
  }
  return { year: newYear, month: newMonth };
}
