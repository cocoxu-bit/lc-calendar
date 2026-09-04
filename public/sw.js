// Service Worker for L&C Calendar
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Listen for notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});

// Listen for push notifications if configured in the future
self.addEventListener('push', (event) => {
  if (event.data) {
    try {
      const data = event.data.json();
      self.registration.showNotification(data.title || 'L&C Calendar', {
        body: data.body || 'Tienes un nuevo recordatorio',
        icon: '/icon.svg',
        badge: '/icon.svg',
        data: data,
      });
    } catch {
      self.registration.showNotification('L&C Calendar', {
        body: event.data.text(),
        icon: '/icon.svg',
      });
    }
  }
});
