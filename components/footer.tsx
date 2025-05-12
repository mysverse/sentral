"use client";

import { JSX, SVGProps } from "react";
import { isStandalonePWA } from "./utils";
import Link from "next/link";
import VerifyACertificate from "./VerifyACertificate";

// import PlayStoreBadge from "public/img/store_badges/store_badge_google.svg";
// import MicrosoftStoreBadge from "public/img/store_badges/store_badge_microsoft.svg";

const footerNavigation = {
  main: [
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Terms of Service", href: "/terms-of-service" },
    { name: "Main Website", href: "https://mysver.se" },
    { name: "Blog", href: "https://blog.mysver.se" }
    // { name: "Blog", href: "https://blog.yan3321.com" },
    // { name: "Donate", href: "https://blog.yan3321.com/donate" }
  ],
  social: [
    {
      name: "Twitter",
      href: "https://twitter.com/mys_verse",
      icon: (props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => (
        // <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
        //   <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
        // </svg>
        <svg viewBox="0 0 1200 1227" fill="currentColor" {...props}>
          <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z" />
        </svg>
      )
    },
    {
      name: "GitHub",
      href: "https://github.com/mysverse",
      icon: (props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path
            fillRule="evenodd"
            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            clipRule="evenodd"
          />
        </svg>
      )
    }
  ]
};

export default function Footer() {
  if (isStandalonePWA()) {
    return null;
  }
  return (
    <footer className="mt-24 bg-linear-to-r from-blue-500 via-blue-700 to-blue-800 sm:mt-12">
      <div className="mx-auto max-w-md overflow-hidden px-4 pb-12 sm:max-w-3xl sm:px-6 lg:max-w-7xl lg:px-8">
        {/* <div className="mx-4 my-10 gap-8 flex flex-wrap justify-center align-center">
            <a
              className="my-auto"
              href="https://play.google.com/store/apps/details?id=com.yan3321.myxlabs&pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1"
            >
              <PlayStoreBadge className="h-12" />
            </a>
            <a
              className="my-auto"
              href="https://www.microsoft.com/store/apps/9PBHCH55SMPL"
            >
              <MicrosoftStoreBadge className="h-12" />
            </a>
          </div> */}
        <nav className="mt-8 flex flex-wrap justify-center" aria-label="Footer">
          <VerifyACertificate name={"Certificate Verifier"} />
          {footerNavigation.main.map((item) => (
            <div key={item.name} className="px-5 py-2">
              <Link
                href={item.href}
                className="text-base text-white hover:text-gray-200"
              >
                {item.name}
              </Link>
            </div>
          ))}
        </nav>
        <div className="mt-8 flex justify-center space-x-6">
          {footerNavigation.social.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-white hover:text-gray-200"
            >
              <span className="sr-only">{item.name}</span>
              <item.icon className="h-6 w-6" aria-hidden="true" />
            </a>
          ))}
        </div>
        <p className="mt-8 text-center text-sm font-light text-white">
          &copy; {new Date().getFullYear()} MYSverse Digital Ventures
          (AS0469188-M).
        </p>
        <p className="mt-2 text-center text-sm font-light text-white">
          All trademarks are property of their respective owners.
        </p>
      </div>
    </footer>
  );
}
