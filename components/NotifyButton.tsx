"use client";

import { BellAlertIcon } from "@heroicons/react/20/solid";
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
        try {
          new Notification("Notifications enabled for Sentral", {
            body: "Keep the tab open to receive notifications on inVote!",
            icon: "/icon.png"
          });
        } catch (error: unknown) {
          if (error instanceof TypeError) {
            console.warn("Error showing notification", error);
          }
          void navigator.serviceWorker.ready.then(function (registration) {
            registration.showNotification("Notifications enabled for Sentral", {
              body: "Keep the tab open to receive notifications on inVote!",
              icon: "/icon.png"
            });
          });
        }
      }
    });
  }
  return (
    permission &&
    permission !== "granted" && (
      <button
        className={clsx(
          "group rounded-md p-2.5 text-white outline-0 outline-blue-500 transition hover:bg-white hover:text-blue-500 hover:outline hover:outline-2",
          "bg-blue-500"
        )}
        onClick={askNotificationPermission}
      >
        <BellAlertIcon className="size-5 fill-white group-hover:fill-blue-500" />
      </button>
    )
  );
}
