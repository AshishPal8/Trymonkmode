// Try Monk Mode Web Push Service Worker

self.addEventListener("install", function () {
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(self.clients.claim());
});

const ACTION_BUTTONS = {
  done: { action: "done", title: "✓ Done" },
  snooze: { action: "snooze", title: "⏰ Snooze 10 min" },
};

function parsePayload(event) {
  let title = "⚡ Try Monk Mode";
  let body = "Stay focused and execute your daily goals.";
  let data = {};

  if (event.data) {
    try {
      const payload = event.data.json();
      title =
        payload.notification?.title || payload.data?.title || payload.title || title;
      body =
        payload.notification?.body || payload.data?.body || payload.body || body;
      data = payload.data || {};
    } catch (e) {
      try {
        body = event.data.text() || body;
      } catch (err) {}
    }
  }

  return { title, body, data };
}

self.addEventListener("push", function (event) {
  const { title, body, data } = parsePayload(event);

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(function (clientList) {
        // App is open and on screen: let the page show an in-app toast
        // instead of an OS notification, so the user isn't alerted twice.
        const visible = clientList.filter(function (c) {
          return c.visibilityState === "visible";
        });
        if (visible.length > 0) {
          visible.forEach(function (c) {
            c.postMessage({ type: "monk-push", title, body, data });
          });
          return;
        }

        return self.registration.showNotification(title, {
          body,
          icon: "/icon.png",
          badge: "/icon.png",
          data,
          // Same tag replaces the older notification for the same item.
          tag: data.tag || "trymonkmode",
          renotify: true,
          requireInteraction: data.requireInteraction === "true",
          vibrate: [200, 100, 200],
          // Action buttons (Chrome/Edge/Android; ignored where unsupported)
          actions: String(data.actions || "")
            .split(",")
            .map(function (a) {
              return ACTION_BUTTONS[a.trim()];
            })
            .filter(Boolean),
        });
      }),
  );
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const data = event.notification.data || {};
  const moduleId = data.moduleId;
  const isAction =
    (event.action === "done" || event.action === "snooze") && data.kind && data.refId;

  // The API uses the app's login cookies, so the open app (or a newly opened
  // one) makes the actual Done/Snooze request.
  let url = moduleId ? "/?module=" + encodeURIComponent(moduleId) : "/";
  if (isAction) {
    url +=
      (url.includes("?") ? "&" : "?") +
      "notifAction=" + event.action +
      "&kind=" + encodeURIComponent(data.kind) +
      "&refId=" + encodeURIComponent(data.refId);
  }

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(function (clientList) {
        for (const client of clientList) {
          if ("focus" in client) {
            if (isAction) {
              client.postMessage({
                type: "monk-action",
                action: event.action,
                kind: data.kind,
                refId: data.refId,
              });
              // Snooze doesn't need the app in front.
              if (event.action === "snooze") return;
            } else if (moduleId) {
              client.postMessage({ type: "monk-open-module", moduleId });
            }
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(url);
        }
      }),
  );
});
