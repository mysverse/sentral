"use client";

// hooks/useNotificationSound.ts
import { useRef, useEffect } from "react";

const useNotificationSound = (): (() => void) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/notification.wav");
      audioRef.current.preload = "auto";
    }
  }, []);

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((error: any) => {
        if (error instanceof Error) {
          if (error.name === "NotAllowedError") {
            console.warn("Browser blocked sound autoplay");
          } else {
            console.error("Error playing sound:", error);
          }
        } else {
          console.error("Error playing sound:", error);
        }
      });
    }
  };

  return playSound;
};

export default useNotificationSound;
