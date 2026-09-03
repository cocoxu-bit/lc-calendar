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

// Format friendly header for agenda: e.g. "Hoy · Jueves, 3 de Septiembre"
export function formatAgendaHeader(dateStr: string): {
  relative: string | null;
  dayName: string;
  formattedDate: string;
  isCurrentDay: boolean;
} {
  const date = parseISO(dateStr);
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

// Generate continuous dates for the agenda view (e.g. from 1 day before to 14 days ahead)
export function getAgendaDatesWindow(anchorDate: Date = new Date(), daysCount: number = 14): string[] {
  const dates: string[] = [];
  // Start from today - 1 day so user can also see yesterday if needed, or start from today
  const start = addDays(anchorDate, -1);
  for (let i = 0; i < daysCount; i++) {
    dates.push(toDateString(addDays(start, i)));
  }
  return dates;
}

// Format month & year for main header, e.g. "Septiembre 2026"
export function formatMonthHeader(d: Date): string {
  return capitalize(format(d, 'MMMM yyyy', { locale: es }));
}
