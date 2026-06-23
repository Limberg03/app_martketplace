// sw.js
// Service Worker para Web Push Notifications y Caché Offline PWA

importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js');

if (workbox) {
  // En producción, vite-plugin-pwa inyectará el listado de archivos aquí
  workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);
  
  // Estrategia para las imágenes
  workbox.routing.registerRoute(
    ({request}) => request.destination === 'image',
    new workbox.strategies.CacheFirst({
      cacheName: 'images-cache',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Días
        })
      ],
    })
  );
}

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
