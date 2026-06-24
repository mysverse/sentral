import Image from "next/image";
import IntentPrefetchLink from "components/IntentPrefetchLink";
import { invoteSeatsKey, invoteStatsKey, MECS_READ_KEYS } from "lib/readKeys";

import { isStandalonePWA } from "components/utils";
import GeneralFAQ from "components/generalFaq";

import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import MECSLogo from "public/img/mecs/mecs_logo.svg";
// import GentagLogo from "public/img/gentag/gentag.svg";
import GrowthLogo from "public/img/growth/myx_growth_logo.svg";
import InvoteLogo from "public/img/invote/myx_invote_logo.svg";
import TracerLogo from "public/img/tracer/MYS_Tracer_Logo.svg";

import MECSOGImage from "public/img/mecs/feature_image.webp";
// import GenTagOGImage from "public/img/gentag/feature_image.webp";
import GrowthOGImage from "public/img/growth/feature_image.webp";
import InvoteOGImage from "public/img/invote/feature_image.webp";
import TracerOGImage from "public/img/tracer/feature_image.webp";
import * as motion from "motion/react-client";
import { enterUp, STAGGER } from "components/ui/motion";
import { Badge } from "components/ui/badge";
import { Card } from "components/ui/card";
import { PageContainer } from "components/ui/page-container";

const links = [
  {
    name: "Tracer",
    title: "Game Statistics Tracker",
    description: isStandalonePWA()
      ? "View your statistics in MYSverse games"
      : "View your statistics in MYSverse games",
    href: "/dashboard/tracer",
    logo: TracerLogo,
    version: "v1.0.0",
    news: "Initial release for Bandar",
    image: TracerOGImage
  },
  {
    name: "MECS",
    title: "Membership Eligibility Criteria System",
    description: isStandalonePWA()
      ? "Verify membership criteria with a username"
      : "Verify membership criteria of any Roblox player",
    href: "/dashboard/mecs",
    logo: MECSLogo,
    version: "v2.4.1",
    news: "Fixed blacklist button layout",
    image: MECSOGImage
  },
  {
    name: "Growth",
    title: "Group Membership Analytics",
    description: "Visualised trends of community membership",
    href: "/dashboard/growth",
    logo: GrowthLogo,
    version: "v1.1.1",
    news: "Colour and semantic adjustments",
    image: GrowthOGImage
  },
  {
    name: "inVote",
    title: "Voting Statistics",
    description: "Presenting in-game community elections on the web",
    href: "/dashboard/invote",
    logo: InvoteLogo,
    version: "v1.1.0",
    news: "Stacked bar chart for votes by party",
    image: InvoteOGImage
  }
];

export const metadata = {
  title: "Dashboard"
};

function AppList() {
  return (
    <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-3">
      {links.map((link, index) => (
        <motion.li
          key={link.href}
          {...enterUp}
          transition={{ ...enterUp.transition, delay: index * STAGGER }}
          className="divide-edge bg-surface col-span-1 flex flex-col divide-y overflow-hidden rounded-lg text-center shadow-sm"
        >
          <Image src={link.image} alt={"Marketing image for " + link.title} />
          <div className="flex flex-1 flex-col p-8">
            {/* <link.logo className="w-36 my-3 shrink-0 mx-auto fill-slate-700" /> */}
            <h2 className="text-strong text-xl font-semibold">{link.name}</h2>
            <h3 className="text-strong text-sm font-medium">{link.title}</h3>
            <dl className="mt-3 flex grow flex-col justify-between">
              <dt className="sr-only">Description</dt>
              <dd className="text-muted text-sm">{link.description}</dd>
              <dt className="sr-only">Status</dt>
              <dd className="mt-3">
                <Badge>{link.version}</Badge>
                {link.news ? (
                  <span className="text-muted ml-3 text-xs font-medium italic">
                    {link.news}
                  </span>
                ) : null}
              </dd>
            </dl>
          </div>
          <div>
            <div className="divide-edge -mt-px flex divide-x">
              <div className="flex w-0 flex-1">
                <IntentPrefetchLink
                  href={link.href}
                  swrKeys={
                    link.href === "/dashboard/mecs"
                      ? [
                          MECS_READ_KEYS.staff,
                          MECS_READ_KEYS.caseStats,
                          MECS_READ_KEYS.audit,
                          MECS_READ_KEYS.blacklist
                        ]
                      : link.href === "/dashboard/invote"
                        ? [invoteStatsKey("GE25"), invoteSeatsKey("GE25")]
                        : undefined
                  }
                  className="text-strong hover:text-muted relative -mr-px inline-flex w-0 flex-1 items-center justify-center rounded-bl-lg border border-transparent py-4 text-sm font-medium"
                >
                  <ArrowTopRightOnSquareIcon
                    className="text-muted h-5 w-5"
                    aria-hidden="true"
                  />
                  <span className="ml-3">Launch applet</span>
                </IntentPrefetchLink>
              </div>
            </div>
          </div>
        </motion.li>
      ))}
    </ul>
  );
}

export default function MainPage() {
  return (
    <PageContainer>
      <AppList />
      <Card className="mt-6">
        <GeneralFAQ />
      </Card>
    </PageContainer>
  );
}
