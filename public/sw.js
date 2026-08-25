// Service worker for browser Web Push notifications (companies portal —
// restaurant/merchant new-order alerts). Registered from
// lib/useOrderAlerts.ts. Kept deliberately minimal: this only shows
// notifications and routes a click back into the app, it does not do any
// caching/offline work.

self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (err) {
    payload = { title: 'City Wheels', body: event.data ? event.data.text() : 'New activity' };
  }

  const title = payload.title || 'City Wheels';
  const options = {
    body: payload.body || '',
    icon: '/city-wheels.jpg',
    badge: '/city-wheels.jpg',
    data: payload.data || {},
    // A new order is time-sensitive (see MERCHANT_RESPONSE_WINDOW_MS on the
    // backend) — keep it on screen until the merchant actually dismisses or
    // clicks it, rather than letting it auto-disappear like a normal toast.
    requireInteraction: true,
    tag: payload.data && payload.data.merchantOrderId ? `order-${payload.data.merchantOrderId}` : undefined,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const orderId = event.notification.data && event.notification.data.merchantOrderId;
  const url = orderId ? `/dashboard/orders/${orderId}` : '/dashboard/orders';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          if ('navigate' in client) {
            try {
              client.navigate(url);
            } catch (err) {
              // Ignore — falling through to focus() still surfaces the app.
            }
          }
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    }),
  );
});
