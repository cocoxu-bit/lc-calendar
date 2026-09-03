import {
  format,
  isToday,
  isTomorrow,
  isYesterday,
  parseISO,
  startOfWeek,
  addDays,
} from 'date-fns';
import { es } from 'date-fns/locale';

export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Format date YYYY-MM-DD
export function toDateString(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

// Parse string YYYY-MM-DD to local Date object
export function parseDateString(str: string): Date {
  try {
    return parseISO(str);
  } catch {
    return new Date();
  }
}

// Format friendly header for agenda: e.g. "Hoy · Jueves, 3 de Septiembre"
export function formatAgendaHeader(dateStr: string): {
  relative: string | null;
  dayName: string;
  formattedDate: string;
  isCurrentDay: boolean;
} {
  const date = parseDateString(dateStr);
  const current = isToday(date);
  let relative: string | null = null;

  if (current) {
    relative = 'Hoy';
  } else if (isTomorrow(date)) {
    relative = 'Mañana';
  } else if (isYesterday(date)) {
    relative = 'Ayer';
  }

  const dayName = capitalize(format(date, 'EEEE', { locale: es }));
  const formattedDate = format(date, "d 'de' MMMM", { locale: es });

  return {
    relative,
    dayName,
    formattedDate,
    isCurrentDay: current,
  };
}

// Get the 7 days of the week for a given anchor date (starting on Monday)
export function getWeekDays(anchorDate: Date = new Date()) {
  const weekStart = startOfWeek(anchorDate, { weekStartsOn: 1 }); // 1 = Lunes
  return Array.from({ length: 7 }, (_, i) => {
    const day = addDays(weekStart, i);
    return {
      date: day,
      dateString: toDateString(day),
      dayNumber: format(day, 'd'),
      dayInitial: format(day, 'EEEEEE', { locale: es }).toUpperCase(), // L, M, X, J, V, S, D
      dayShort: capitalize(format(day, 'EEE', { locale: es })),
      isToday: isToday(day),
    };
  });
}

// Generate continuous dates for the agenda view (starts from anchorDate / today)
export function getAgendaDatesWindow(anchorDate: Date = new Date(), daysCount: number = 14): string[] {
  const dates: string[] = [];
  for (let i = 0; i < daysCount; i++) {
    dates.push(toDateString(addDays(anchorDate, i)));
  }
  return dates;
}

// Generate 3 days window (e.g. selectedDate, +1 day, +2 days)
export function getThreeDaysDates(anchorDate: Date = new Date()): string[] {
  return [
    toDateString(anchorDate),
    toDateString(addDays(anchorDate, 1)),
    toDateString(addDays(anchorDate, 2)),
  ];
}

// Generate week dates (Lunes a Domingo)
export function getWeekDatesWindow(anchorDate: Date = new Date()): string[] {
  const weekStart = startOfWeek(anchorDate, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => toDateString(addDays(weekStart, i)));
}

// Format month & year for main header, e.g. "Septiembre 2026"
export function formatMonthHeader(d: Date): string {
  return capitalize(format(d, 'MMMM yyyy', { locale: es }));
}
