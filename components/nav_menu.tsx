"use client";

import { Disclosure } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/20/solid";

import MECSLogo from "public/img/mecs/mecs_logo.svg";
import GentagLogo from "public/img/gentag/gentag.svg";
import GrowthLogo from "public/img/growth/myx_growth_logo.svg";
import SentralLogo from "public/img/MYSverse_Sentral_Logo.svg";
import InvoteLogo from "public/img/invote/myx_invote_logo.svg";
import TracerLogo from "public/img/tracer/MYS_Tracer_Logo.svg";
import Link from "next/link";
import { clsx } from "clsx";
import PrivacyBanner from "./privacy/privacyBanner";
import { usePathname } from "next/navigation";

import { ReactNode } from "react";

export default function NavMenu({ avatar }: { avatar?: ReactNode }) {
  const pathname = usePathname();
  const navigation = [
    { name: "Home", href: "/dashboard", current: false },
    {
      name: "Privacy Policy",
      href: "/privacy-policy",
      current: false,
      hidden: true
    },
    {
      name: "Terms of Service",
      href: "/terms-of-service",
      current: false,
      hidden: true
    },
    // {
    //   name: "Server Status",
    //   href: "https://myx.yan.gg/status",
    //   current: false,
    // },
    {
      name: "Tracer",
      href: "/dashboard/tracer",
      logo: TracerLogo,
      current: false
    },
    {
      name: "MECS",
      href: "/dashboard/mecs",
      pages: ["staff"],
      logo: MECSLogo,
      current: false
    },
    {
      name: "GenTag",
      href: "/dashboard/gentag",
      logo: GentagLogo,
      current: false
    },
    {
      name: "Growth",
      href: "/dashboard/growth",
      logo: GrowthLogo,
      current: false
    },
    {
      name: "inVote",
      href: "/dashboard/invote",
      logo: InvoteLogo,
      current: false
    }
  ].map((obj) => ({
    ...obj,
    current:
      pathname === obj.href ||
      obj.pages?.some((page) => pathname === `${obj.href}/${page}`)
  }));
  const currentNav = navigation.find((value) => value.current);

  return (
    <>
      <PrivacyBanner />
      <div className="bg-gradient-to-r from-blue-500 via-blue-700 to-blue-800 pb-32">
        <Disclosure
          as="nav"
          className="border-b border-blue-300 border-opacity-25 bg-gradient-to-r from-blue-500 via-blue-700 to-blue-800 lg:border-none"
        >
          {({ open }) => (
            <>
              <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-8">
                <div className="relative flex h-16 items-center justify-between lg:border-b lg:border-blue-300 lg:border-opacity-25">
                  <div className="flex items-center px-2 lg:px-0">
                    <div className="flex-shrink-0 pt-1">
                      <Link href={"/"} passHref={true}>
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
                                  : "text-white hover:bg-blue-400 hover:bg-opacity-75",
                                "rounded-md px-3 py-2 text-sm font-medium"
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
                                  : "text-white hover:bg-blue-400 hover:bg-opacity-75",
                                "rounded-md px-3 py-2 text-sm font-medium"
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
                    <div className="hidden lg:block">{avatar}</div>
                  ) : null}
                  <div className="flex lg:hidden">
                    {/* Mobile menu button */}
                    <Disclosure.Button className="inline-flex items-center justify-center rounded-md bg-gradient-to-r from-blue-500 via-blue-700 to-blue-800 p-2 text-blue-200 hover:bg-blue-500 hover:bg-opacity-75 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600">
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
                    </Disclosure.Button>
                  </div>
                </div>
              </div>

              <Disclosure.Panel className="lg:hidden">
                <div className="flex flex-col divide-y divide-blue-300/25">
                  <div className="space-y-1 px-2 pb-3 pt-2">
                    {navigation
                      .filter((item) => !item.hidden)
                      .map((item) => (
                        <Disclosure.Button
                          key={item.name}
                          as="a"
                          href={item.href}
                          className={clsx(
                            item.current
                              ? "bg-blue-700 text-white"
                              : "text-white hover:bg-blue-500 hover:bg-opacity-75",
                            "block rounded-md px-3 py-2 text-base font-medium"
                          )}
                          aria-current={item.current ? "page" : undefined}
                        >
                          {item.name}
                        </Disclosure.Button>
                      ))}
                  </div>
                  {avatar ? (
                    <div className="block px-3 py-6 lg:hidden">{avatar}</div>
                  ) : null}
                </div>
              </Disclosure.Panel>
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
