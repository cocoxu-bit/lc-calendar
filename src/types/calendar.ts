export type EventOwner = 'user_1' | 'user_2' | 'both';
export type EventCategory = 'general' | 'logistica' | 'ocio' | 'salud' | 'deporte' | 'bebe';
export type BabyTaskType = 'noche' | 'comida' | 'bano' | 'guarderia' | 'pediatra' | 'otro';

export interface CalendarEvent {
  id?: string;
  title: string;
  date: string; // Formato YYYY-MM-DD
  startTime?: string; // Formato HH:mm (opcional)
  endTime?: string; // Formato HH:mm (opcional)
  isAllDay: boolean;
  owner: EventOwner;
  category: EventCategory;
  babyTaskType?: BabyTaskType;
  notes?: string;
  createdAt: number;
}

export interface CoupleProfile {
  user1Name: string;
  user2Name: string;
  childName?: string;
}

export const DEFAULT_COUPLE: CoupleProfile = {
  user1Name: 'Lucas',
  user2Name: 'Josefina',
  childName: 'Peque',
};

export interface CategoryMeta {
  label: string;
  iconName: 'Package' | 'Activity' | 'Coffee' | 'HeartPulse' | 'Calendar' | 'Baby';
  color: string;
  badgeBg: string;
}

export const CATEGORY_CONFIG: Record<EventCategory, CategoryMeta> = {
  general: {
    label: 'General',
    iconName: 'Calendar',
    color: 'text-neutral-600',
    badgeBg: 'bg-neutral-100 text-neutral-700 border-neutral-200',
  },
  bebe: {
    label: 'Bebé y Rutinas',
    iconName: 'Baby',
    color: 'text-teal-700',
    badgeBg: 'bg-teal-50 text-teal-900 border-teal-200/90',
  },
  logistica: {
    label: 'Logística y Casa',
    iconName: 'Package',
    color: 'text-amber-700',
    badgeBg: 'bg-amber-50 text-amber-900 border-amber-200/90',
  },
  ocio: {
    label: 'Ocio y Pareja',
    iconName: 'Coffee',
    color: 'text-emerald-700',
    badgeBg: 'bg-emerald-50 text-emerald-900 border-emerald-200/90',
  },
  salud: {
    label: 'Salud / Médico',
    iconName: 'HeartPulse',
    color: 'text-rose-700',
    badgeBg: 'bg-rose-50 text-rose-900 border-rose-200/90',
  },
  deporte: {
    label: 'Deporte',
    iconName: 'Activity',
    color: 'text-sky-700',
    badgeBg: 'bg-sky-50 text-sky-900 border-sky-200/90',
  },
};
