import "../styles/globals.css";
import PlausibleProvider from "next-plausible";

import { SessionProvider } from "components/SessionProvider";

import { Metadata } from "next";
import { env } from "process";

export const metadata: Metadata = {
  title: "Sentral",
  description:
    "Sentral is the official hub and companion app for MYSverse, serving game statistics, analytics tools, and a lot more to come!",
  metadataBase: env.NEXT_URL ? new URL(env.NEXT_URL) : undefined
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
    >
      <SessionProvider>{children}</SessionProvider>
    </PlausibleProvider>
  );
}
