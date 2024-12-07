"use client";

import { useState, useEffect } from "react";

const useTabVisibility = (): boolean => {
  const [isTabVisible, setIsTabVisible] = useState<boolean>(
    typeof document !== "undefined"
      ? document.visibilityState === "visible"
      : false
  );

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(document.visibilityState === "visible");
    };

    // Add event listener for visibility change
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup event listener
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return isTabVisible;
};

export default useTabVisibility;
