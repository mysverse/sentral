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
      registration.showNotification(title, options);
    } catch (error: unknown) {
      console.error("Error showing notification via service worker", error);
    }
  }
}
