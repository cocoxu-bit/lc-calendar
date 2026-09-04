'use client';

import { CalendarEvent, CoupleProfile } from '@/types/calendar';
import { toDateString } from '@/lib/dateUtils';
import { format } from 'date-fns';

export function isIOS(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

export function isStandalonePWA(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

export function isNotificationSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'Notification' in window || ('serviceWorker' in navigator && 'PushManager' in window);
}

export function getNotificationPermission(): NotificationPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'default';
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined') return 'denied';

  // 1. Direct window.Notification
  if ('Notification' in window && typeof Notification.requestPermission === 'function') {
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch {
      return Notification.permission;
    }
  }

  return 'denied';
}

// Register service worker if supported
export async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return null;
  try {
    let reg = await navigator.serviceWorker.getRegistration();
    if (!reg) {
      reg = await navigator.serviceWorker.register('/sw.js');
    }
    return reg;
  } catch {
    return null;
  }
}

// Gentle pleasant chime synthesizer via Web Audio API
export function playNotificationSound() {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // First tone (D5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc1.start(now);
    osc1.stop(now + 0.25);

    // Second tone (A5)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.12); // A5
    gain2.gain.setValueAtTime(0.14, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.45);
  } catch {
    // Audio synthesis blocked or unavailable, ignore silently
  }
}

// Always triggers in-app toast for visual clarity
export function triggerInAppToast(title: string, body: string, isNight: boolean = false) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent('lc_in_app_notification', {
      detail: { title, body, isNight },
    })
  );
}

// Send dual notification: In-App visual banner + Native system notification
export async function sendDualNotification(
  title: string,
  options?: NotificationOptions,
  playSound: boolean = true,
  isNight: boolean = false
): Promise<boolean> {
  // 1. Play sound
  if (playSound) {
    playNotificationSound();
  }

  // 2. Always show in-app banner
  triggerInAppToast(title, options?.body || '', isNight);

  // 3. Try native system notification via Service Worker first
  try {
    const reg = await getServiceWorkerRegistration();
    if (reg && 'showNotification' in reg && Notification.permission === 'granted') {
      await reg.showNotification(title, {
        icon: '/icon.svg',
        badge: '/icon.svg',
        ...options,
      });
      return true;
    }
  } catch {
    // Fall back to window.Notification
  }

  // 4. Try window.Notification constructor
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      const notif = new Notification(title, {
        icon: '/icon.svg',
        badge: '/icon.svg',
        ...options,
      });
      notif.onclick = () => {
        window.focus();
        notif.close();
      };
      return true;
    } catch {
      // In-app was already displayed
    }
  }

  return false;
}

// Test notification button handler with detailed user guidance
export async function sendTestNotification(profile: CoupleProfile): Promise<{
  success: boolean;
  message: string;
  isSystemPermissionGranted: boolean;
}> {
  const child = profile.childName || 'el peque';
  const testTitle = '🔔 L&C Calendar — ¡Aviso de prueba!';
  const testBody = `¡Aviso recibido! Os recordaremos los eventos y turnos con ${child}.`;

  // Always play chime sound and trigger in-app toast banner
  const sound = profile.notifications?.soundEnabled ?? true;
  if (sound) {
    playNotificationSound();
  }
  triggerInAppToast(testTitle, testBody, false);

  // Check if system notifications are possible
  let systemGranted = false;
  const supported = isNotificationSupported();

  if (supported) {
    let perm = getNotificationPermission();
    if (perm !== 'granted') {
      perm = await requestNotificationPermission();
    }

    if (perm === 'granted') {
      systemGranted = true;
      // Try dispatching system alert
      try {
        const reg = await getServiceWorkerRegistration();
        if (reg && 'showNotification' in reg) {
          await reg.showNotification(testTitle, {
            body: testBody,
            icon: '/icon.svg',
            tag: 'test-notif',
          });
        } else if ('Notification' in window) {
          new Notification(testTitle, {
            body: testBody,
            icon: '/icon.svg',
            tag: 'test-notif',
          });
        }
      } catch {
        // Fall back gracefully
      }
    }
  }

  // Determine friendly message for the couple
  if (systemGranted) {
    return {
      success: true,
      message: '¡Aviso emitido con éxito tanto en pantalla como en el sistema!',
      isSystemPermissionGranted: true,
    };
  }

  if (isIOS() && !isStandalonePWA()) {
    return {
      success: true,
      message:
        '¡Aviso visual y sonoro emitido! 💡 En iPhone, para recibir avisos con el móvil bloqueado, pulsa Compartir (📤) en Safari y "Añadir a pantalla de inicio".',
      isSystemPermissionGranted: false,
    };
  }

  if (supported && getNotificationPermission() === 'denied') {
    return {
      success: true,
      message:
        '¡Aviso visual y sonoro emitido! Las alertas del sistema están desactivadas en los ajustes de tu navegador.',
      isSystemPermissionGranted: false,
    };
  }

  return {
    success: true,
    message: '¡Aviso visual y sonoro emitido correctamente en la app!',
    isSystemPermissionGranted: false,
  };
}

// Periodic check for upcoming events
export function checkAndTriggerEventReminders(
  events: CalendarEvent[],
  profile: CoupleProfile
) {
  const notifConfig = profile.notifications;
  if (!notifConfig || !notifConfig.enabled) return;

  const now = new Date();
  const todayStr = toDateString(now);
  const currentHours = format(now, 'HH:mm');
  const nowMs = now.getTime();

  const leadMinutes = notifConfig.leadTimeMinutes || 15;
  const leadMs = leadMinutes * 60 * 1000;
  const toleranceMs = 3 * 60 * 1000;

  // 1. Regular Event Reminders
  events.forEach((event) => {
    if (notifConfig.filterByOwner === 'user_1' && event.owner === 'user_2') return;
    if (notifConfig.filterByOwner === 'user_2' && event.owner === 'user_1') return;

    if (!event.date || event.date !== todayStr) return;
    if (!event.startTime || event.isAllDay) return;

    const eventTimeStr = `${event.date}T${event.startTime}:00`;
    const eventMs = new Date(eventTimeStr).getTime();
    if (isNaN(eventMs)) return;

    const diffMs = eventMs - nowMs;
    if (diffMs <= leadMs && diffMs >= -toleranceMs) {
      const storageKey = `lc_notif_${event.id || event.title}_${event.date}_${leadMinutes}`;
      if (typeof window !== 'undefined' && !sessionStorage.getItem(storageKey)) {
        sessionStorage.setItem(storageKey, 'true');

        const ownerLabel =
          event.owner === 'user_1'
            ? profile.user1Name
            : event.owner === 'user_2'
            ? profile.user2Name
            : 'Juntos';

        const leadText =
          leadMinutes === 0
            ? '¡Comienza ahora!'
            : `Empieza en ${leadMinutes} min (${event.startTime})`;

        sendDualNotification(
          `📅 ${event.title}`,
          {
            body: `${leadText} · Asignado a: ${ownerLabel}`,
            tag: `event-${event.id || event.title}`,
          },
          notifConfig.soundEnabled,
          false
        );
      }
    }
  });

  // 2. Special Night Shift Reminder (e.g. at 21:00)
  if (notifConfig.notifyNightShift) {
    const reminderTime = notifConfig.nightShiftReminderTime || '21:00';
    if (currentHours >= reminderTime) {
      const nightKey = `lc_notif_night_${todayStr}`;
      if (typeof window !== 'undefined' && !sessionStorage.getItem(nightKey)) {
        const nightEvent = events.find(
          (e) =>
            e.date === todayStr &&
            (e.babyTaskType === 'noche' || e.title.toLowerCase().includes('noche'))
        );

        if (nightEvent) {
          sessionStorage.setItem(nightKey, 'true');
          const who =
            nightEvent.owner === 'user_1'
              ? profile.user1Name
              : nightEvent.owner === 'user_2'
              ? profile.user2Name
              : 'Ambos';

          const child = profile.childName || 'el peque';

          sendDualNotification(
            `🌙 Turno de Noche con ${child}`,
            {
              body: `Esta noche le toca quedarse con ${child} a ${who}. ¡Que descanséis!`,
              tag: `night-shift-${todayStr}`,
            },
            notifConfig.soundEnabled,
            true
          );
        }
      }
    }
  }
}
