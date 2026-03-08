// Spark — Service Worker v1
// Gère les notifications push en arrière-plan

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(clients.claim());
});

// Reçoit un message de la page principale pour afficher une notif
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SHOW_NOTIF') {
    const { title, body, icon, tag, postId } = e.data;
    e.waitUntil(
      self.registration.showNotification(title, {
        body,
        icon: icon || '/icon-192.png',
        badge: '/icon-192.png',
        tag: tag || 'spark',
        data: { postId },
        vibrate: [200, 100, 200],
        requireInteraction: false,
      })
    );
  }
});

// Clic sur la notification → ouvre/focus la page
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const postId = e.notification.data?.postId;
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      // Si un onglet Spark est déjà ouvert, on le focus
      for (const client of list) {
        if (client.url.includes('spark') || client.url.includes('localhost')) {
          client.focus();
          if (postId) client.postMessage({ type: 'OPEN_POST', postId });
          return;
        }
      }
      // Sinon ouvrir un nouvel onglet
      if (clients.openWindow) {
        return clients.openWindow(postId ? `?post=${postId}` : '/');
      }
    })
  );
});
