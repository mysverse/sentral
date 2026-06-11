import { Suspense } from "react";

export const metadata = {
  title: "Live Leaderboard",
  description: "Real-time racing leaderboard with live updates"
};

export const viewport = {
  width: "device-width",
  initialScale: 1
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    // Always-dark display surface: the permanent `dark` class keeps shared
    // primitives in dark mode here regardless of the user's theme toggle
    <div className="bg-brand-gradient-dark dark h-dvh grow overflow-hidden font-sans antialiased">
      <Suspense
        fallback={
          <div className="bg-brand-gradient-dark flex min-h-screen items-center justify-center">
            <div className="text-center">
              <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-white"></div>
              <p className="text-xl text-white">Loading leaderboard...</p>
            </div>
          </div>
        }
      >
        {children}
      </Suspense>
    </div>
  );
}
