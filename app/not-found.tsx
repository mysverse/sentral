// app/not-found.tsx

import Link from "next/link";

export default function NotFound() {
  return (
    <html lang="en">
      <head>
        <title>Page Not Found</title>
      </head>
      <body className="flex min-h-screen items-center justify-center bg-gray-100">
        <main className="rounded-lg bg-white p-6 text-center shadow-lg">
          <h1 className="mb-4 text-4xl font-bold text-gray-800">
            Page Not Found
          </h1>
          <p className="mb-6 text-gray-600">
            Sorry, the page you are looking for does not exist in MYSverse
            Sentral.
          </p>
          <Link
            href="/"
            className="inline-block rounded-md bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Go to Home
          </Link>
        </main>
      </body>
    </html>
  );
}
