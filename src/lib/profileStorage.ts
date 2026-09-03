import { CoupleProfile, DEFAULT_COUPLE, DEFAULT_CATEGORIES, DEFAULT_SHORTCUTS } from '@/types/calendar';

const STORAGE_KEY = 'lc_calendar_couple_profile_v3';
const PROFILE_CHANGE_EVENT = 'lc_calendar_profile_change';

export function getStoredProfile(): CoupleProfile {
  if (typeof window === 'undefined') return DEFAULT_COUPLE;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return DEFAULT_COUPLE;
    const parsed = JSON.parse(data);
    return {
      user1Name: parsed.user1Name?.trim() || DEFAULT_COUPLE.user1Name,
      user1Color: parsed.user1Color || DEFAULT_COUPLE.user1Color,
      user2Name: parsed.user2Name?.trim() || DEFAULT_COUPLE.user2Name,
      user2Color: parsed.user2Color || DEFAULT_COUPLE.user2Color,
      bothColor: parsed.bothColor || DEFAULT_COUPLE.bothColor,
      childName: parsed.childName?.trim() || DEFAULT_COUPLE.childName,
      categories: Array.isArray(parsed.categories) && parsed.categories.length > 0
        ? parsed.categories
        : DEFAULT_CATEGORIES,
      shortcuts: Array.isArray(parsed.shortcuts) && parsed.shortcuts.length > 0
        ? parsed.shortcuts
        : DEFAULT_SHORTCUTS,
    };
  } catch {
    return DEFAULT_COUPLE;
  }
}

export function saveStoredProfile(profile: CoupleProfile): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  window.dispatchEvent(new CustomEvent(PROFILE_CHANGE_EVENT));
}

export function subscribeToProfile(callback: (profile: CoupleProfile) => void): () => void {
  const handler = () => {
    callback(getStoredProfile());
  };

  if (typeof window !== 'undefined') {
    window.addEventListener(PROFILE_CHANGE_EVENT, handler);
    window.addEventListener('storage', handler);
  }

  return () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener(PROFILE_CHANGE_EVENT, handler);
      window.removeEventListener('storage', handler);
    }
  };
}
