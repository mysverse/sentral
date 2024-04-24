import "../styles/globals.css";
import PlausibleProvider from "next-plausible";

import { SessionProvider } from "components/SessionProvider";

import { Metadata, Viewport } from "next";

const APP_NAME = "Sentral";
const APP_DEFAULT_TITLE = "MYSverse Sentral";
const APP_TITLE_TEMPLATE = "%s - MYSverse Sentral";
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
    // startUpImage: [],
  },
  formatDetection: {
    telephone: false
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE
    },
    description: APP_DESCRIPTION
  },
  twitter: {
    card: "summary",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE
    },
    description: APP_DESCRIPTION
  }
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF"
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
