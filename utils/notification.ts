"use client";

export async function notify(title: string, options?: NotificationOptions) {
  try {
    new Notification(title, options);
  } catch (error: unknown) {
    if (error instanceof TypeError) {
      console.warn("Error showing notification", error);
    }
    try {
      const registration = await navigator.serviceWorker.ready;
      if (!options) {
        options = {};
      }
      if (!options.icon) {
        options.icon = "/icon.png";
      }
      if (!options.badge) {
        options.badge = "/img/favicons/monochrome-512x512.png";
      }
      registration.showNotification(title, options);
    } catch (error: unknown) {
      console.error("Error showing notification via service worker", error);
    }
  }
}
