import "../styles/globals.css";

import type { Metadata, Viewport } from "next";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import PlausibleProvider from "next-plausible";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import { SerwistProvider } from "./serwist";
import SwrProvider from "components/SwrProvider";
import AppToaster from "components/ui/app-toaster";
import { publicSans } from "styles/fonts";

const APP_NAME = "MYSverse Sentral";
const APP_DEFAULT_TITLE = "Sentral";
const APP_TITLE_TEMPLATE = "%s - Sentral";
const APP_DESCRIPTION =
  "Sentral is the official hub and companion app for MYSverse, serving game statistics, analytics tools, and a lot more to come!";

export const metadata: Metadata = {
  metadataBase: process.env.AUTH_URL
    ? new URL(process.env.AUTH_URL)
    : undefined,
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DEFAULT_TITLE
  },
  formatDetection: {
    telephone: false
  },
  openGraph: {
    type: "website"
  },
  twitter: {
    card: "summary_large_image"
  }
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#4976d8" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1120" }
  ]
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const plausibleSrc = process.env.NEXT_PUBLIC_PLAUSIBLE_SRC;

  const tree = (
    <ClerkProvider>
      <SwrProvider>
        <NuqsAdapter>
          <SerwistProvider
            swUrl="/serwist/sw.js"
            disable={process.env.NODE_ENV === "development"}
          >
            {children}
          </SerwistProvider>
        </NuqsAdapter>
      </SwrProvider>
    </ClerkProvider>
  );

  // Single root html so navigation between route groups stays client-side
  // (SPA) and view transitions can run across surfaces
  return (
    <html lang="en" className={publicSans.className} suppressHydrationWarning>
      <body className="flex min-h-dvh flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AppToaster />
          {plausibleSrc ? (
            <PlausibleProvider src={plausibleSrc}>{tree}</PlausibleProvider>
          ) : (
            tree
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
