// Try Monk Mode Web Push Service Worker
// High-Reliability Native Web Push & FCM Notification Handler

self.addEventListener('install', function (event) {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', function (event) {
  let title = '⚡ Try Monk Mode';
  let body = 'Stay focused and execute your daily goals.';
  let data = {};

  if (event.data) {
    try {
      const payload = event.data.json();
      title = payload.notification?.title || payload.data?.title || payload.title || title;
      body = payload.notification?.body || payload.data?.body || payload.body || body;
      data = payload.data || {};
    } catch (e) {
      try {
        body = event.data.text() || body;
      } catch (err) {}
    }
  }

  const options = {
    body: body,
    icon: '/icon.png',
    badge: '/icon.png',
    data: data,
    tag: 'trymonkmode-' + Date.now(),
    renotify: true,
    requireInteraction: true,
    vibrate: [200, 100, 200]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
