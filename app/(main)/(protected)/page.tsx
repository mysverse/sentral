import Image from "next/image";
import Link from "next/link";

import { isStandalonePWA } from "components/utils";
import Navigation from "components/nav";
import Footer from "components/footer";
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

import { getServerSession } from "next-auth";
import { authOptions } from "app/api/auth/[...nextauth]/route";

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
    image: MECSOGImage
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
      {links.map((link) => (
        <li
          key={link.href}
          className="col-span-1 flex flex-col text-center bg-white rounded-lg shadow divide-y divide-gray-200 overflow-hidden"
        >
          <Image src={link.image} alt={"Marketing image for " + link.title} />
          <div className="flex-1 flex flex-col p-8">
            {/* <link.logo className="w-36 my-3 flex-shrink-0 mx-auto fill-slate-700" /> */}
            <h2 className="text-gray-900 text-xl font-semibold">{link.name}</h2>
            <h3 className="text-gray-700 text-sm font-medium">{link.title}</h3>
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
      ))}
    </ul>
  );
}

function RobloxAvatarDisplay({
  id,
  name,
  image
}: {
  id: string;
  name: string;
  image: string;
}) {
  return (
    <a href="#" className="group block flex-shrink-0">
      <div className="flex items-center">
        <div>
          <Image
            className="inline-block h-9 w-9 rounded-full"
            src={image}
            alt="Headshot"
            width={150}
            height={150}
          />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
            {`@${name}`}
          </p>
          <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">
            {id}
          </p>
        </div>
      </div>
    </a>
  );
}

export default async function Page() {
  const session = await getServerSession(authOptions);
  return (
    <>
      {/* <Head>
      <title>Dashboard</title>
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      <meta property="og:title" content="Dashboard" />
      <meta property="og:site_name" content="MYX Labs" />
      <meta property="og:url" content="https://myx.yan.gg/app" />
      <meta
        property="og:description"
        content="Your gateway to a selection of web services catered to the MYS community. A @yan3321 project."
      />
      <meta property="og:type" content="website" />
      <meta
        property="og:image"
        content="https://myx.yan.gg/img/og_image_v2.png"
      />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="MYX Labs App Dashboard" />
      <meta
        name="twitter:description"
        content="Your gateway to a selection of web services catered to the MYS community. A @yan3321 project."
      />
      <meta
        name="twitter:image"
        content="https://myx.yan.gg/img/og_image_v2.png"
      />
    </Head> */}

      <main>
        <div className="flex flex-col h-screen">
          <Navigation />
          <div className="-mt-32 flex">
            <div className="max-w-7xl my-auto flex-grow mx-auto px-4 sm:px-6 lg:px-8">
              <AppList />
              {/* <div className="bg-white rounded-lg shadow px-5 py-6 sm:px-6 mt-6">
              <div className="m-4 mt-8 sm:gap-6 flex flex-wrap justify-center align-center">
                <a
                  className="my-auto"
                  href="https://play.google.com/store/apps/details?id=com.yan3321.myxlabs&pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1"
                >
                  <Image
                    alt="Get it on Google Play"
                    height={125 * 0.65}
                    width={323 * 0.65}
                    src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
                  />
                </a>
                <a
                  className="my-auto"
                  href="https://www.microsoft.com/store/apps/9PBHCH55SMPL"
                >
                  <Image
                    alt="Get it on Microsoft"
                    height={156 * 0.35}
                    width={432 * 0.35}
                    src="https://getbadgecdn.azureedge.net/images/English_L.png"
                  />
                </a>
              </div>
            </div> */}

              <div className="bg-white rounded-lg shadow px-5 py-6 sm:px-6 mt-6">
                <GeneralFAQ />
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </main>
    </>
  );
}
