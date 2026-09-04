'use client';

import { CalendarEvent, CoupleProfile } from '@/types/calendar';
import { toDateString } from '@/lib/dateUtils';
import { format } from 'date-fns';

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) return 'denied';
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch {
    return Notification.permission;
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

export function sendBrowserNotification(
  title: string,
  options?: NotificationOptions,
  playSound: boolean = true
): boolean {
  if (!isNotificationSupported()) return false;
  if (Notification.permission !== 'granted') return false;

  try {
    if (playSound) {
      playNotificationSound();
    }

    const notif = new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options,
    });

    notif.onclick = () => {
      window.focus();
      notif.close();
    };

    return true;
  } catch {
    return false;
  }
}

// Test notification button handler
export async function sendTestNotification(profile: CoupleProfile): Promise<{
  success: boolean;
  message: string;
}> {
  if (!isNotificationSupported()) {
    return {
      success: false,
      message: 'Tu navegador actual no tiene soporte para la API de Notificaciones del sistema.',
    };
  }

  let permission = Notification.permission;
  if (permission !== 'granted') {
    permission = await requestNotificationPermission();
  }

  if (permission !== 'granted') {
    return {
      success: false,
      message:
        'Permiso de notificaciones denegado o no concedido. Habilita los permisos de notificaciones en los ajustes de tu navegador.',
    };
  }

  const child = profile.childName || 'el peque';
  const sent = sendBrowserNotification(
    '🔔 L&C Calendar — Notificación de prueba',
    {
      body: `¡Todo listo! Os avisaremos con antelación de vuestros eventos y de quién se queda con ${child} por las noches.`,
      tag: 'test-notification',
    },
    profile.notifications?.soundEnabled ?? true
  );

  if (sent) {
    return {
      success: true,
      message: '¡Notificación de prueba enviada con éxito!',
    };
  } else {
    return {
      success: false,
      message: 'No se pudo emitir la notificación. Comprueba que el navegador permite avisos en esta pestaña.',
    };
  }
}

// Check upcoming events and trigger notifications
export function checkAndTriggerEventReminders(
  events: CalendarEvent[],
  profile: CoupleProfile
) {
  if (!isNotificationSupported() || Notification.permission !== 'granted') return;
  const notifConfig = profile.notifications;
  if (!notifConfig || !notifConfig.enabled) return;

  const now = new Date();
  const todayStr = toDateString(now);
  const currentHours = format(now, 'HH:mm');
  const nowMs = now.getTime();

  const leadMinutes = notifConfig.leadTimeMinutes || 15;
  const leadMs = leadMinutes * 60 * 1000;
  const toleranceMs = 3 * 60 * 1000; // 3 min window

  // 1. Regular Event Reminders
  events.forEach((event) => {
    // Check owner filter
    if (notifConfig.filterByOwner === 'user_1' && event.owner === 'user_2') return;
    if (notifConfig.filterByOwner === 'user_2' && event.owner === 'user_1') return;

    if (!event.date || event.date !== todayStr) return;
    if (!event.startTime || event.isAllDay) return;

    const eventTimeStr = `${event.date}T${event.startTime}:00`;
    const eventMs = new Date(eventTimeStr).getTime();
    if (isNaN(eventMs)) return;

    const diffMs = eventMs - nowMs;
    // If event is starting in approximately leadMinutes
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

        sendBrowserNotification(
          `📅 ${event.title}`,
          {
            body: `${leadText} · Asignado a: ${ownerLabel}`,
            tag: `event-${event.id || event.title}`,
          },
          notifConfig.soundEnabled
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
        // Find night event for today
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

          sendBrowserNotification(
            `🌙 Turno de Noche con ${child}`,
            {
              body: `Esta noche le toca quedarse con ${child} a ${who}. ¡Que descanséis!`,
              tag: `night-shift-${todayStr}`,
            },
            notifConfig.soundEnabled
          );
        }
      }
    }
  }
}
