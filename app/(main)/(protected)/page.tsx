import Image from "next/image";
import Link from "next/link";

import { isStandalonePWA } from "components/utils";
import GeneralFAQ from "components/generalFaq";

import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import MECSLogo from "public/img/mecs/mecs_logo.svg";
import GentagLogo from "public/img/gentag/gentag.svg";
import GrowthLogo from "public/img/growth/myx_growth_logo.svg";
import InvoteLogo from "public/img/invote/myx_invote_logo.svg";
import TracerLogo from "public/img/tracer/MYS_Tracer_Logo.svg";

import MECSOGImage from "public/img/mecs/feature_image.webp";
import GenTagOGImage from "public/img/gentag/feature_image.webp";
import GrowthOGImage from "public/img/growth/feature_image.webp";
import InvoteOGImage from "public/img/invote/feature_image.webp";
import TracerOGImage from "public/img/tracer/feature_image.webp";
import DefaultTransitionLayout from "components/transition";

const links = [
  {
    name: "Tracer",
    title: "Game Statistics Tracker",
    description: isStandalonePWA()
      ? "View your statistics in MYSverse games"
      : "View your statistics in MYSverse games",
    href: "/tracer",
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
    href: "/mecs",
    logo: MECSLogo,
    version: "v2.4.1",
    news: "Fixed blacklist button layout",
    image: MECSOGImage
  },
  {
    name: "GenTag",
    title: "Nametag Generator",
    description: "Personalise virtual uniforms with nametags",
    href: "/gentag",
    logo: GentagLogo,
    version: "v1.0.2",
    news: "Performance improvements",
    image: GenTagOGImage
  },
  {
    name: "Growth",
    title: "Group Membership Analytics",
    description: "Visualised trends of community membership",
    href: "/growth",
    logo: GrowthLogo,
    version: "v1.1.1",
    news: "Colour and semantic adjustments",
    image: GrowthOGImage
  },
  {
    name: "inVote",
    title: "Voting Statistics",
    description: "Presenting in-game community elections on the web",
    href: "/invote",
    logo: InvoteLogo,
    version: "v1.1.0",
    news: "Stacked bar chart for votes by party",
    image: InvoteOGImage
  }
];

function AppList() {
  return (
    <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-3">
      {links.map((link, index) => (
        <DefaultTransitionLayout
          show={true}
          key={link.href}
          appear={true}
          duration={index * 10000}
        >
          <li className="col-span-1 flex flex-col text-center bg-white rounded-lg shadow divide-y divide-gray-200 overflow-hidden">
            <Image src={link.image} alt={"Marketing image for " + link.title} />
            <div className="flex-1 flex flex-col p-8">
              {/* <link.logo className="w-36 my-3 flex-shrink-0 mx-auto fill-slate-700" /> */}
              <h2 className="text-gray-900 text-xl font-semibold">
                {link.name}
              </h2>
              <h3 className="text-gray-700 text-sm font-medium">
                {link.title}
              </h3>
              <dl className="mt-3 flex-grow flex flex-col justify-between">
                <dt className="sr-only">Description</dt>
                <dd className="text-gray-500 text-sm">{link.description}</dd>
                <dt className="sr-only">Status</dt>
                <dd className="mt-3">
                  <span className="px-2 py-1 text-slate-500 text-xs font-medium bg-slate-100 rounded-md">
                    {link.version}
                  </span>
                  {link.news ? (
                    <span className="ml-3 text-slate-400 text-xs font-medium italic">
                      {link.news}
                    </span>
                  ) : null}
                </dd>
              </dl>
            </div>
            <div>
              <div className="-mt-px flex divide-x divide-gray-200">
                <div className="w-0 flex-1 flex">
                  <Link
                    href={link.href}
                    className="relative -mr-px w-0 flex-1 inline-flex items-center justify-center py-4 text-sm text-gray-700 font-medium border border-transparent rounded-bl-lg hover:text-gray-500"
                  >
                    <ArrowTopRightOnSquareIcon
                      className="w-5 h-5 text-gray-400"
                      aria-hidden="true"
                    />
                    <span className="ml-3">Launch applet</span>
                  </Link>
                </div>
              </div>
            </div>
          </li>
        </DefaultTransitionLayout>
      ))}
    </ul>
  );
}

export default function MainPage() {
  return (
    <div className="max-w-7xl my-auto flex-grow mx-auto px-4 sm:px-6 lg:px-8">
      <AppList />
      <div className="bg-white rounded-lg shadow px-5 py-6 sm:px-6 mt-6">
        <GeneralFAQ />
      </div>
    </div>
  );
}
