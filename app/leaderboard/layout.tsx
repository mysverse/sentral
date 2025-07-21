import { Suspense } from "react";

export const metadata = {
  title: "Live Leaderboard",
  description: "Real-time racing leaderboard with live updates",
  viewport: "width=device-width, initial-scale=1"
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <body className="overflow-hidden font-sans antialiased">
        <Suspense
          fallback={
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
              <div className="text-center">
                <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-white"></div>
                <p className="text-xl text-white">Loading leaderboard...</p>
              </div>
            </div>
          }
        >
          {children}
        </Suspense>
      </body>
    </html>
  );
}
