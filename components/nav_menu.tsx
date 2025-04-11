"use client";

import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel
} from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/20/solid";
import FinsysLogo from "public/img/finsys/finsys.svg";
import MECSLogo from "public/img/mecs/mecs_logo.svg";
import GentagLogo from "public/img/gentag/gentag.svg";
import CertifierLogo from "public/img/certifier/MYS_Certifier_Logo.svg";
import GrowthLogo from "public/img/growth/myx_growth_logo.svg";
import SentralLogo from "public/img/MYSverse_Sentral_Logo.svg";
import InvoteLogo from "public/img/invote/myx_invote_logo.svg";
import TracerLogo from "public/img/tracer/MYS_Tracer_Logo.svg";
import SimmerLogo from "public/img/simmer/simmer_logo.svg";
import SimetricsLogo from "public/img/simetrics/MYS_Simetrics_Logo.svg";
import Link from "next/link";
import { clsx } from "clsx";
import PrivacyBanner from "./privacy/privacyBanner";
import { usePathname } from "next/navigation";

import { ReactNode } from "react";

type NavigationItem = {
  name: string;
  href: string;
  current?: boolean;
  hidden?: boolean;
  logo?: any; // Replace `any` with a more specific type if needed
};

export default function NavMenu({
  avatar,
  sim
}: {
  avatar?: ReactNode;
  sim?: boolean;
}) {
  const pathname = usePathname();

  let navigation: NavigationItem[] = [
    { name: "Home", href: "/dashboard", current: false },
    {
      name: "Privacy Policy",
      href: "/privacy-policy",
      hidden: true
    },
    {
      name: "Terms of Service",
      href: "/terms-of-service",
      hidden: true
    },
    {
      name: "Certifier",
      href: "/dashboard/certifier",
      logo: CertifierLogo,
      hidden: true
    },
    {
      name: "Feedback",
      href: "/dashboard/feedback",
      hidden: true
    },
    {
      name: "Tracer",
      href: "/dashboard/tracer",
      logo: TracerLogo
    },
    {
      name: "MECS",
      href: "/dashboard/mecs",
      logo: MECSLogo
    },
    {
      name: "Growth",
      href: "/dashboard/growth",
      logo: GrowthLogo
    },
    {
      name: "inVote",
      href: "/dashboard/invote",
      logo: InvoteLogo
    },
    {
      name: "Simmer",
      href: "/dashboard/simmer",
      logo: SimmerLogo,
      hidden: !sim
    },
    {
      name: "GenTag",
      href: "/dashboard/simmer/gentag",
      logo: GentagLogo,
      hidden: true
    },
    {
      name: "FinSys",
      href: "/dashboard/simmer/finsys",
      logo: FinsysLogo,
      hidden: true
    },
    {
      name: "Simetrics",
      href: "/dashboard/simmer/simetrics",
      logo: SimetricsLogo,
      hidden: true
    }
  ];

  // Function to determine if the current path is a descendant of the nav item's path
  const isCurrentPath = (
    navItem: NavigationItem,
    currentPath: string
  ): boolean => {
    return currentPath.startsWith(navItem.href);
  };

  // Find the navigation item that has the longest href matching the current path (including hidden items)
  const currentNavItem = navigation.reduce<NavigationItem | null>(
    (currentLongest, navItem) => {
      if (
        isCurrentPath(navItem, pathname) &&
        (!currentLongest || navItem.href.length > currentLongest.href.length)
      ) {
        return navItem;
      }
      return currentLongest;
    },
    null
  );

  // Find the first non-hidden nav item that matches the current path
  const currentNavLink = navigation
    .filter((item) => !item.hidden)
    .reduce<NavigationItem | null>((currentLongest, navItem) => {
      if (
        isCurrentPath(navItem, pathname) &&
        (!currentLongest || navItem.href.length > currentLongest.href.length)
      ) {
        return navItem;
      }
      return currentLongest;
    }, null);

  // Map over the original navigation items to set the current property based on currentNavLink
  navigation = navigation.map(
    (obj): NavigationItem => ({
      ...obj,
      current: obj === currentNavLink
    })
  );

  const currentNav = currentNavItem;

  return (
    <>
      <PrivacyBanner />
      <div className="bg-linear-to-r from-blue-500 via-blue-700 to-blue-800 pb-32">
        <Disclosure
          as="nav"
          className="border-b border-blue-300/25 bg-linear-to-r from-blue-500 via-blue-700 to-blue-800 lg:border-none"
        >
          {({ open }) => (
            <>
              <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-8">
                <div className="relative flex h-16 items-center justify-between lg:border-b lg:border-blue-300/25">
                  <div className="flex items-center px-2 lg:px-0">
                    <div className="shrink-0 pt-1">
                      <Link
                        href={"/"}
                        className="transition hover:opacity-80"
                        passHref={true}
                      >
                        <SentralLogo
                          height={43}
                          width={128}
                          alt="MYSverse Sentral Logo"
                          className="fill-white"
                        />
                      </Link>
                    </div>
                  </div>
                  <div className="hidden lg:ml-10 lg:block">
                    <div className="flex space-x-4">
                      {navigation
                        .filter((item) => !item.hidden)
                        .map((item) =>
                          item.href.includes("http") ? (
                            <a
                              href={item.href}
                              key={item.name}
                              className={clsx(
                                item.current
                                  ? "bg-blue-600 text-white"
                                  : "hover:bg-opacity-75 text-white hover:bg-blue-400",
                                "rounded-md px-3 py-2 text-sm font-medium transition"
                              )}
                              aria-current={item.current ? "page" : undefined}
                            >
                              {item.name}
                            </a>
                          ) : (
                            <Link
                              key={item.name}
                              href={item.href}
                              className={clsx(
                                item.current
                                  ? "bg-blue-600 text-white"
                                  : "hover:bg-opacity-75 text-white hover:bg-blue-400",
                                "rounded-md px-3 py-2 text-sm font-medium transition"
                              )}
                              aria-current={item.current ? "page" : undefined}
                            >
                              {item.name}
                            </Link>
                          )
                        )}
                    </div>
                  </div>
                  {avatar ? (
                    <div className="hidden w-28 flex-col items-end justify-end lg:flex">
                      {avatar}
                    </div>
                  ) : null}
                  <div className="flex lg:hidden">
                    {/* Mobile menu button */}
                    <DisclosureButton className="hover:bg-opacity-75 inline-flex items-center justify-center rounded-md p-2 text-blue-200 transition hover:bg-blue-500 hover:text-white focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 focus:outline-hidden">
                      <span className="sr-only">Open main menu</span>
                      {open ? (
                        <XMarkIcon
                          className="block h-6 w-6"
                          aria-hidden="true"
                        />
                      ) : (
                        <Bars3Icon
                          className="block h-6 w-6"
                          aria-hidden="true"
                        />
                      )}
                    </DisclosureButton>
                  </div>
                </div>
              </div>

              <DisclosurePanel className="lg:hidden">
                <div className="flex flex-col divide-y divide-blue-300/25">
                  <div className="space-y-1 px-2 pt-2 pb-3">
                    {navigation
                      .filter((item) => !item.hidden)
                      .map((item) => (
                        <DisclosureButton
                          key={item.name}
                          as="a"
                          href={item.href}
                          className={clsx(
                            item.current
                              ? "bg-blue-700 text-white"
                              : "hover:bg-opacity-75 text-white hover:bg-blue-500",
                            "block rounded-md px-3 py-2 text-base font-medium transition"
                          )}
                          aria-current={item.current ? "page" : undefined}
                        >
                          {item.name}
                        </DisclosureButton>
                      ))}
                  </div>
                  {avatar ? (
                    <div className="flex flex-col items-center px-3 py-6 lg:hidden">
                      {avatar}
                    </div>
                  ) : null}
                </div>
              </DisclosurePanel>
            </>
          )}
        </Disclosure>
        <header className="py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="m-4 flex h-14 flex-wrap justify-center">
              {currentNav?.logo ? (
                <>
                  <currentNav.logo
                    alt={`${currentNav.name} logo`}
                    className="m-auto w-48 fill-white"
                  />
                </>
              ) : (
                <h1 className="m-auto h-24 text-4xl font-bold text-white">
                  {currentNav?.name ?? "Home"}
                </h1>
              )}
            </div>
          </div>
        </header>
      </div>
    </>
  );
}
