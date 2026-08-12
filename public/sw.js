const CACHE_NAME = "sena-bienestar-v1";
const STATIC_CACHE = "sena-static-v1";
const DYNAMIC_CACHE = "sena-dynamic-v1";

const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
];

// Install: cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch: network first for API, cache first for static
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip Supabase API calls (always go to network)
  if (url.hostname.includes("supabase")) return;

  // Skip Vercel SSO and internal URLs
  if (url.hostname.includes("vercel.app") && url.pathname.includes("sso-api")) return;
  if (url.pathname.includes("/_next/")) return;

  // Skip chrome-extension and other non-http
  if (!url.protocol.startsWith("http")) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      const fetched = fetch(request)
        .then((response) => {
          // Don't cache bad responses or redirects
          if (!response || response.status !== 200 || response.redirected) {
            return response;
          }

          // Clone the response
          const responseClone = response.clone();

          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });

          return response;
        })
        .catch(() => {
          // Return cached version if network fails
          return cached;
        });

      return cached || fetched;
    })
  );
});

// Handle push notifications
self.addEventListener("push", (event) => {
  const data = event.data?.json() || {
    title: "Bienestar SENA",
    body: "Tienes una actualización en tus citas",
  };

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      vibrate: [200, 100, 200],
      tag: "sena-notification",
    })
  );
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: "window" }).then((windowClients) => {
      // Focus existing window if available
      for (const client of windowClients) {
        if (client.url.includes("/") && "focus" in client) {
          return client.focus();
        }
      }
      // Otherwise open new window
      return clients.openWindow("/");
    })
  );
});
