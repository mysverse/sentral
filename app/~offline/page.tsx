import Link from "next/link";
import { Button } from "components/catalyst/button";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="mb-6 rounded-full bg-blue-100 p-6 dark:bg-blue-900/30">
        <svg
          className="h-12 w-12 text-blue-600 dark:text-blue-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.828m-4.243 1.172a3 3 0 000 4.242m0 0L4 21m8-11a2 2 0 114 0 2 2 0 01-4 0z"
          />
        </svg>
      </div>
      <h1 className="mb-2 text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
        You're Offline
      </h1>
      <p className="mb-8 max-w-sm text-zinc-500 dark:text-zinc-400">
        It looks like you've lost your connection. Don't worry, Sentral has
        cached some of your data for offline viewing.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => window.location.reload()}>Try Again</Button>
        <Button outline asChild>
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    </div>
  );
}
