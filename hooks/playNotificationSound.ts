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
        console.error("Error playing sound:", error);
      });
    }
  };

  return playSound;
};

export default useNotificationSound;
