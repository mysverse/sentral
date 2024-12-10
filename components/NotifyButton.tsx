"use client";

import clsx from "clsx";
import { useEffect, useState } from "react";

export function NotifyButton() {
  const [permission, setPermission] = useState<NotificationPermission>();

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  function askNotificationPermission() {
    // Check if the browser supports notifications
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications.");
      return;
    }
    Notification.requestPermission().then((permission) => {
      setPermission(permission);
      if (permission === "granted") {
        new Notification(
          "You have been granted permission to send notifications!"
        );
      }
    });
  }
  return (
    permission &&
    permission !== "granted" && (
      <button
        className={clsx(
          "rounded-md px-3 py-1 text-white transition hover:bg-white hover:text-blue-500",
          "bg-blue-500"
        )}
        onClick={askNotificationPermission}
      >
        {"Enable notifications"}
      </button>
    )
  );
}
