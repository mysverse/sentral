"use client";

export function notify(title: string, options?: NotificationOptions) {
  try {
    new Notification(title, options);
  } catch (error: unknown) {
    if (error instanceof TypeError) {
      console.warn("Error showing notification", error);
    }
    void navigator.serviceWorker.ready.then(({ showNotification }) =>
      showNotification(title, options)
    );
  }
}
