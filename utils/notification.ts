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
      const { showNotification, pushManager } = registration;
      let subscription = await pushManager.getSubscription();
      if (!subscription) {
        subscription = await pushManager.subscribe();
      }
      showNotification(title, options);
    } catch (e) {
      console.error("Error showing notification via service worker", e);
    }
  }
}
