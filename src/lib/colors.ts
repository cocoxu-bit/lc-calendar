import { ColorThemeKey } from '@/types/calendar';

export interface ColorThemeDefinition {
  key: ColorThemeKey;
  label: string;
  cardBg: string;
  badgeBg: string;
  border: string;
  text: string;
  indicator: string;
  swatchBg: string;
}

export const COLOR_THEMES: Record<ColorThemeKey, ColorThemeDefinition> = {
  sky: {
    key: 'sky',
    label: 'Celeste Pastel',
    cardBg: 'bg-sky-50 border-sky-200 text-sky-950 hover:border-sky-300',
    badgeBg: 'bg-sky-100/90 text-sky-900 border-sky-200',
    border: 'border-sky-200',
    text: 'text-sky-950',
    indicator: 'bg-sky-500',
    swatchBg: 'bg-sky-400',
  },
  rose: {
    key: 'rose',
    label: 'Rosa Pastel',
    cardBg: 'bg-rose-50 border-rose-200 text-rose-950 hover:border-rose-300',
    badgeBg: 'bg-rose-100/90 text-rose-900 border-rose-200',
    border: 'border-rose-200',
    text: 'text-rose-950',
    indicator: 'bg-rose-500',
    swatchBg: 'bg-rose-400',
  },
  purple: {
    key: 'purple',
    label: 'Lavanda / Púrpura',
    cardBg: 'bg-purple-50 border-purple-200 text-purple-950 hover:border-purple-300',
    badgeBg: 'bg-purple-100/90 text-purple-900 border-purple-200',
    border: 'border-purple-200',
    text: 'text-purple-950',
    indicator: 'bg-purple-500',
    swatchBg: 'bg-purple-400',
  },
  emerald: {
    key: 'emerald',
    label: 'Verde Menta',
    cardBg: 'bg-emerald-50 border-emerald-200 text-emerald-950 hover:border-emerald-300',
    badgeBg: 'bg-emerald-100/90 text-emerald-900 border-emerald-200',
    border: 'border-emerald-200',
    text: 'text-emerald-950',
    indicator: 'bg-emerald-500',
    swatchBg: 'bg-emerald-400',
  },
  amber: {
    key: 'amber',
    label: 'Ámbar Cálido',
    cardBg: 'bg-amber-50 border-amber-200 text-amber-950 hover:border-amber-300',
    badgeBg: 'bg-amber-100/90 text-amber-900 border-amber-200',
    border: 'border-amber-200',
    text: 'text-amber-950',
    indicator: 'bg-amber-500',
    swatchBg: 'bg-amber-400',
  },
  teal: {
    key: 'teal',
    label: 'Verde Azulado',
    cardBg: 'bg-teal-50 border-teal-200 text-teal-950 hover:border-teal-300',
    badgeBg: 'bg-teal-100/90 text-teal-900 border-teal-200',
    border: 'border-teal-200',
    text: 'text-teal-950',
    indicator: 'bg-teal-500',
    swatchBg: 'bg-teal-400',
  },
  indigo: {
    key: 'indigo',
    label: 'Azul Índigo',
    cardBg: 'bg-indigo-50 border-indigo-200 text-indigo-950 hover:border-indigo-300',
    badgeBg: 'bg-indigo-100/90 text-indigo-900 border-indigo-200',
    border: 'border-indigo-200',
    text: 'text-indigo-950',
    indicator: 'bg-indigo-500',
    swatchBg: 'bg-indigo-400',
  },
  orange: {
    key: 'orange',
    label: 'Coral / Naranja',
    cardBg: 'bg-orange-50 border-orange-200 text-orange-950 hover:border-orange-300',
    badgeBg: 'bg-orange-100/90 text-orange-900 border-orange-200',
    border: 'border-orange-200',
    text: 'text-orange-950',
    indicator: 'bg-orange-500',
    swatchBg: 'bg-orange-400',
  },
};

export const COLOR_KEYS = Object.keys(COLOR_THEMES) as ColorThemeKey[];

export function getColorTheme(key?: string): ColorThemeDefinition {
  if (key && key in COLOR_THEMES) {
    return COLOR_THEMES[key as ColorThemeKey];
  }
  return COLOR_THEMES.sky;
}
