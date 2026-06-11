"use client"; // Error components must be Client Components

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

// Replaces the root layout when it crashes, so Tailwind CSS is not
// available here — styles must be inline.
export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f9fafb",
          fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
        }}
      >
        <div
          style={{
            maxWidth: "28rem",
            padding: "2rem",
            textAlign: "center"
          }}
        >
          <h1
            style={{
              fontSize: "1.125rem",
              fontWeight: 600,
              color: "#111827",
              marginBottom: "0.5rem"
            }}
          >
            Something went wrong
          </h1>
          <p
            style={{
              fontSize: "0.875rem",
              color: "#6b7280",
              marginBottom: "1.5rem"
            }}
          >
            We could not load MYSverse Sentral. Please try again — if the
            problem keeps happening, contact support.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              backgroundColor: "#2563eb",
              color: "#ffffff",
              fontSize: "0.875rem",
              fontWeight: 600,
              padding: "0.5rem 1rem",
              borderRadius: "0.375rem",
              border: "none",
              cursor: "pointer"
            }}
          >
            Try again
          </button>
          {error.digest && (
            <p
              style={{
                marginTop: "1rem",
                fontSize: "0.75rem",
                color: "#9ca3af"
              }}
            >
              Reference ID: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
