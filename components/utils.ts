export function isStandalonePWA() {
  if (typeof window !== "undefined") {
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes("android-app://")
    ) {
      return true;
    }
  }
  return false;
}
