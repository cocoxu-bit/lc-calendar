export type EventOwner = 'user_1' | 'user_2' | 'both';
export type BabyTaskType = 'noche' | 'comida' | 'bano' | 'guarderia' | 'pediatra' | 'otro';

export type ColorThemeKey =
  | 'sky'
  | 'rose'
  | 'purple'
  | 'emerald'
  | 'amber'
  | 'teal'
  | 'indigo'
  | 'orange';

export interface CustomCategory {
  id: string;
  label: string;
  iconName: string;
  colorTheme: ColorThemeKey;
  isCustom?: boolean;
}

export interface QuickShortcut {
  id: string;
  label: string;
  title: string;
  iconName: string;
  category: string;
  babyTaskType?: BabyTaskType;
  defaultStartTime?: string;
  defaultEndTime?: string;
  isAllDay?: boolean;
  defaultOwner?: EventOwner;
  enabled: boolean;
  isCustom?: boolean;
}

export interface CalendarEvent {
  id?: string;
  title: string;
  date: string; // Formato YYYY-MM-DD
  startTime?: string; // Formato HH:mm (opcional)
  endTime?: string; // Formato HH:mm (opcional)
  isAllDay: boolean;
  owner: EventOwner;
  category: string;
  babyTaskType?: BabyTaskType;
  notes?: string;
  createdAt: number;
}

export interface CoupleProfile {
  user1Name: string;
  user1Color: ColorThemeKey;
  user2Name: string;
  user2Color: ColorThemeKey;
  bothColor: ColorThemeKey;
  childName?: string;
  categories: CustomCategory[];
  shortcuts: QuickShortcut[];
}

export const DEFAULT_CATEGORIES: CustomCategory[] = [
  {
    id: 'bebe',
    label: 'Bebé y Rutinas',
    iconName: 'Baby',
    colorTheme: 'teal',
  },
  {
    id: 'logistica',
    label: 'Logística y Casa',
    iconName: 'Package',
    colorTheme: 'amber',
  },
  {
    id: 'ocio',
    label: 'Ocio y Pareja',
    iconName: 'Coffee',
    colorTheme: 'emerald',
  },
  {
    id: 'salud',
    label: 'Salud / Médico',
    iconName: 'HeartPulse',
    colorTheme: 'rose',
  },
  {
    id: 'deporte',
    label: 'Deporte',
    iconName: 'Activity',
    colorTheme: 'sky',
  },
  {
    id: 'general',
    label: 'General',
    iconName: 'Calendar',
    colorTheme: 'indigo',
  },
];

export const DEFAULT_SHORTCUTS: QuickShortcut[] = [
  {
    id: 'noche',
    label: 'Turno Noche',
    title: 'Turno de noche con el peque 🌙',
    iconName: 'Moon',
    category: 'bebe',
    babyTaskType: 'noche',
    defaultStartTime: '23:30',
    defaultEndTime: '07:30',
    isAllDay: false,
    enabled: true,
  },
  {
    id: 'comida',
    label: 'Comida / Biberón',
    title: 'Dar de comer / Biberón 🍼',
    iconName: 'Utensils',
    category: 'bebe',
    babyTaskType: 'comida',
    defaultStartTime: '13:00',
    defaultEndTime: '14:00',
    isAllDay: false,
    enabled: true,
  },
  {
    id: 'bano',
    label: 'Baño y Dormir',
    title: 'Baño y rutina de dormir 🛁',
    iconName: 'Bath',
    category: 'bebe',
    babyTaskType: 'bano',
    defaultStartTime: '20:00',
    defaultEndTime: '20:45',
    isAllDay: false,
    enabled: true,
  },
  {
    id: 'guarderia',
    label: 'Guardería',
    title: 'Llevar / Recoger guardería 🎒',
    iconName: 'Package',
    category: 'bebe',
    babyTaskType: 'guarderia',
    defaultStartTime: '09:00',
    defaultEndTime: '09:30',
    isAllDay: false,
    enabled: true,
  },
  {
    id: 'compra',
    label: 'Compra Semanal',
    title: 'Hacer compra semanal 🛒',
    iconName: 'ShoppingBag',
    category: 'logistica',
    defaultStartTime: '19:00',
    defaultEndTime: '20:00',
    isAllDay: false,
    enabled: true,
  },
  {
    id: 'cena_pareja',
    label: 'Cena en Pareja',
    title: 'Cena romántica en pareja 🥂',
    iconName: 'Coffee',
    category: 'ocio',
    defaultStartTime: '21:30',
    defaultEndTime: '23:30',
    isAllDay: false,
    defaultOwner: 'both',
    enabled: true,
  },
];

export const DEFAULT_COUPLE: CoupleProfile = {
  user1Name: 'Lucas',
  user1Color: 'sky',
  user2Name: 'Josefina',
  user2Color: 'rose',
  bothColor: 'purple',
  childName: 'Peque',
  categories: DEFAULT_CATEGORIES,
  shortcuts: DEFAULT_SHORTCUTS,
};
