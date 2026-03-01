/// <reference no-default-lib="true" />
/// <reference lib="esnext" />
/// <reference lib="webworker" />
import { defaultCache } from "@serwist/turbopack/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // Optimized caching for API routes (Leaderboard, Certifier, etc.)
    {
      matcher({ url }) {
        return url.pathname.startsWith("/api/");
      },
      handler: "NetworkFirst",
      options: {
        cacheName: "api-cache",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24, // 24 hours
        },
        networkTimeoutSeconds: 5, // Fallback to cache if network is slow
      },
    },
    // Cache fonts for long-term offline use
    {
      matcher({ url }) {
        return url.pathname.startsWith("/fonts/");
      },
      handler: "CacheFirst",
      options: {
        cacheName: "font-cache",
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
        },
      },
    },
    // Use the standard Serwist default cache for everything else
    ...defaultCache,
  ],
  fallbacks: {
    entries: [
      {
        url: "/~offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

// Add a generic Push notification listener
self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title || "MYSverse Sentral";
  const options = {
    body: data.body || "New update available!",
    icon: "/img/favicons/favicon-192x192.png",
    badge: "/img/favicons/monochrome-512x512.png",
    data: data.url || "/",
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Open the relevant URL when the user clicks the notification
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.openWindow(event.notification.data)
  );
});

serwist.addEventListeners();
