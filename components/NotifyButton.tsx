"use client";

import { BellAlertIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
import { useState } from "react";
import { notify } from "utils/notification";

export function NotifyButton() {
  const [permission, setPermission] = useState<NotificationPermission | undefined>(() => {
    // Initialize state from Notification API if available
    if (typeof window !== "undefined" && "Notification" in window) {
      return Notification.permission;
    }
    return undefined;
  });

  function askNotificationPermission() {
    // Check if the browser supports notifications
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications.");
      return;
    }
    Notification.requestPermission().then((permission) => {
      setPermission(permission);
      if (permission === "granted") {
        notify("Notifications enabled for Sentral", {
          body: "Keep the tab open to receive notifications on inVote!",
          icon: "/icon.png"
        });
      }
    });
  }
  return (
    permission &&
    permission !== "granted" && (
      <button
        className={clsx(
          "group rounded-md p-2.5 text-white outline-0 outline-blue-500 transition hover:bg-white hover:text-blue-500 hover:outline",
          "bg-blue-500"
        )}
        onClick={askNotificationPermission}
      >
        <BellAlertIcon className="size-5 fill-white group-hover:fill-blue-500" />
      </button>
    )
  );
}
