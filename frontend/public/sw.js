// sw.js
// Service Worker para Web Push Notifications

self.addEventListener('push', function(event) {
  if (event.data) {
    const data = event.data.json();
    console.log("Push event received: ", data);
    
    const options = {
      body: data.body,
      icon: '/vite.svg', // Idealmente el icono de la UAGRM o NexusApp
      badge: '/vite.svg',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/'
      }
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  // Si la notificación tiene una URL, la abrimos
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(windowClients => {
      // Check if there is already a window/tab open with the target URL
      const urlToOpen = event.notification.data.url;
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
