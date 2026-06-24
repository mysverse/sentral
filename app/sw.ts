/// <reference no-default-lib="true" />
/// <reference lib="esnext" />
/// <reference lib="webworker" />
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
    {
      matcher({ sameOrigin, url }) {
        return (
          sameOrigin &&
          (url.pathname.startsWith("/_next/static/") ||
            /\.(?:js|css|woff2?|ttf)$/.test(url.pathname))
        );
      },
      handler: "CacheFirst",
      options: {
        cacheName: "sentral-static-v2",
        expiration: {
          maxEntries: 96,
          maxAgeSeconds: 60 * 60 * 24 * 30
        }
      }
    },
    {
      matcher({ sameOrigin, request, url }) {
        return (
          sameOrigin &&
          (request.destination === "image" ||
            request.destination === "audio" ||
            url.pathname.startsWith("/img/"))
        );
      },
      handler: "CacheFirst",
      options: {
        cacheName: "sentral-media-v2",
        expiration: {
          maxEntries: 128,
          maxAgeSeconds: 60 * 60 * 24 * 30
        }
      }
    },
    {
      matcher({ sameOrigin, url }) {
        return (
          sameOrigin &&
          (/^\/api\/read\/mecs\/(staff|case|audit|blacklist)$/.test(
            url.pathname
          ) ||
            url.pathname.startsWith("/api/read/invote/") ||
            url.pathname === "/api/read/gentag/templates" ||
            url.pathname === "/api/read/avatars")
        );
      },
      method: "GET",
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "sentral-public-data-v2",
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 60 * 60
        }
      }
    },
    {
      matcher({ sameOrigin, url }) {
        return (
          sameOrigin &&
          (url.pathname === "/privacy-policy" ||
            url.pathname === "/terms-of-service" ||
            url.pathname === "/verify" ||
            url.pathname.startsWith("/verify/") ||
            url.pathname === "/leaderboard" ||
            url.pathname.startsWith("/leaderboard/"))
        );
      },
      method: "GET",
      handler: "NetworkFirst",
      options: {
        cacheName: "sentral-public-pages-v2",
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 60 * 60
        },
        networkTimeoutSeconds: 5
      }
    },
    {
      matcher({ sameOrigin, url }) {
        return (
          sameOrigin &&
          (url.pathname.startsWith("/api/") ||
            url.pathname.startsWith("/dashboard"))
        );
      },
      handler: "NetworkOnly"
    },
    {
      matcher({ sameOrigin }) {
        return sameOrigin;
      },
      handler: "NetworkOnly"
    },
    {
      matcher({ request, url }) {
        return (
          request.destination === "image" &&
          (url.hostname === "rbxcdn.com" ||
            url.hostname.endsWith(".rbxcdn.com"))
        );
      },
      handler: "CacheFirst",
      options: {
        cacheName: "sentral-roblox-images-v2",
        expiration: {
          maxEntries: 128,
          maxAgeSeconds: 60 * 60 * 24
        }
      }
    },
    {
      matcher() {
        return true;
      },
      handler: "NetworkOnly"
    }
  ],
  fallbacks: {
    entries: [
      {
        url: "/~offline",
        matcher({ request }) {
          return request.destination === "document";
        }
      }
    ]
  }
});

const LEGACY_CACHE_NAMES = [
  "api-cache",
  "apis",
  "pages",
  "pages-rsc",
  "pages-rsc-prefetch",
  "next-data",
  "others",
  "cross-origin"
];

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names
            .filter((name) => LEGACY_CACHE_NAMES.includes(name))
            .map((name) => caches.delete(name))
        )
      )
  );
});

// Add a generic Push notification listener
self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title || "MYSverse Sentral";
  const options = {
    body: data.body || "New update available!",
    icon: "/img/favicons/favicon-192x192.png",
    badge: "/img/favicons/monochrome-512x512.png",
    data: data.url || "/"
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Open the relevant URL when the user clicks the notification
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(self.clients.openWindow(event.notification.data));
});

serwist.addEventListeners();
