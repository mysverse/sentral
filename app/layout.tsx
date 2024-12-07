import "../styles/globals.css";

import type { Metadata, Viewport } from "next";
import { SessionProvider } from "components/SessionProvider";
import PlausibleProvider from "next-plausible";

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
      <SessionProvider>{children}</SessionProvider>
    </PlausibleProvider>
  );
}
