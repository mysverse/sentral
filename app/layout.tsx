import "../styles/globals.css";

import type { Metadata, Viewport } from "next";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import PlausibleProvider from "next-plausible";
import { ClerkProvider } from "@clerk/nextjs";
import { SerwistProvider } from "./serwist";

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
  themeColor: "#4976d8"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <PlausibleProvider
      domain="sentral.mysver.se"
      customDomain="https://plausible.yan.gg"
      exclude="/auth/*"
    >
      <ClerkProvider>
        <NuqsAdapter>
          <SerwistProvider swUrl="/serwist/sw.js" disable={process.env.NODE_ENV === "development"}>
            {children}
          </SerwistProvider>
        </NuqsAdapter>
      </ClerkProvider>
    </PlausibleProvider>
  );
}
