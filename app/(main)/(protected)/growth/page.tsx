"use client";

import { NextPage } from "next";
import Head from "next/head";
import dynamic from "next/dynamic";
import Footer from "components/footer";

import { CheckIcon, ArrowsUpDownIcon } from "@heroicons/react/20/solid";

import Navigation from "components/nav";
import { useGrowthData } from "components/swr";

import Spinner from "components/spinner";
import GrowthInsights from "components/growthInsights";
import GrowthUtils from "components/growthUtils";
import { Fragment, useState } from "react";
import { RadioGroup, Listbox, Transition } from "@headlessui/react";
import { clsx } from "clsx";

const chartAxisOptions = [
  { name: "Linear", value: "linear", disabled: false },
  { name: "Logarithmic", value: "logarithmic", disabled: false }
];

const GrowthChart = dynamic(() => import("components/growthChart"), {
  ssr: false
});

interface DisplayMonth {
  name: string;
  value: string;
  valid: boolean;
}

const months: DisplayMonth[] = [
  { name: "Cumulative (monthly)", value: "months", valid: true },
  { name: "Cumulative (weekly)", value: "weeks", valid: true }
];

function Main() {
  const { growthData, isLoading, isError } = useGrowthData(true);
  const [logarithmic, setLogarithmic] = useState(false);
  const [selectedMonthValue, setSelectedMonthValue] = useState<string>(
    months[0].value
  );
  const [selectedMonth, setSelectedMonth] = useState<DisplayMonth>(months[0]);

  let growthUtils: GrowthUtils = null as any;

  if (!isLoading && !isError) {
    growthUtils = new GrowthUtils(growthData);
  }

  return (
    <>
      <Head>
        <title>Growth</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta property="og:title" content="Growth" />
        <meta property="og:site_name" content="MYX Labs" />
        <meta property="og:url" content="https://myx.yan.gg/growth" />
        <meta
          property="og:description"
          content="See a visualised graph of MYS's growth and data insights. A MYX Labs donationware project."
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content="https://myx.yan.gg/img/growth/og_image_v2.png"
        />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Growth by MYX Labs" />
        <meta
          name="twitter:description"
          content="See a visualised graph of MYS's growth and data insights. A MYX Labs donationware project."
        />
        <meta
          name="twitter:image"
          content="https://myx.yan.gg/img/growth/og_image_v2.png"
        />
      </Head>

      <main>
        <div className="flex flex-col h-screen">
          <Navigation />
          <div className="-mt-32 flex">
            <div className="max-w-7xl my-auto flex-grow mx-auto px-4 sm:px-6 lg:px-8">
              {growthUtils ? (
                <>
                  <div className="bg-white rounded-lg shadow py-6 px-1 sm:px-5">
                    {/* chart won't scale properly without width class: https://stackoverflow.com/a/70191511 */}
                    <div className="relative h-[28rem] w-[99%]">
                      <GrowthChart
                        growthUtils={growthUtils}
                        logarithmic={logarithmic}
                        displayOption={selectedMonth.value}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 justify-center gap-6 bg-white rounded-lg shadow px-5 py-6 sm:px-6 mt-8">
                    <RadioGroup
                      value={logarithmic ? "logarithmic" : "linear"}
                      onChange={(e) => {
                        setLogarithmic(e === "logarithmic");
                      }}
                    >
                      <RadioGroup.Label className="sr-only">
                        Choose a chart display option
                      </RadioGroup.Label>
                      <div className="grid grid-cols-2 gap-2">
                        {chartAxisOptions.map((option) => (
                          <RadioGroup.Option
                            key={option.name}
                            value={option.value}
                            className={({ active, checked }) =>
                              clsx(
                                !option.disabled
                                  ? "cursor-pointer focus:outline-none"
                                  : "opacity-25 cursor-not-allowed",
                                active
                                  ? "ring-2 ring-offset-2 ring-blue-500"
                                  : "",
                                checked
                                  ? "bg-blue-600 border-transparent text-white hover:bg-blue-700"
                                  : "bg-white border-gray-200 text-gray-900 hover:bg-gray-50",
                                "border rounded-md py-3 px-2 flex items-center justify-center text-sm font-medium sm:flex-1 sm:px-6"
                              )
                            }
                            disabled={option.disabled}
                          >
                            <RadioGroup.Label as="p">
                              {option.name}
                            </RadioGroup.Label>
                          </RadioGroup.Option>
                        ))}
                      </div>
                    </RadioGroup>
                    <Listbox
                      value={selectedMonthValue}
                      onChange={(value) => {
                        const month = months
                          .concat(growthUtils.getDisplayOptionsArray())
                          .find((e) => e.value === value);
                        if (month) {
                          setSelectedMonthValue(value);
                          setSelectedMonth(month);
                        }
                      }}
                    >
                      {({ open }) => (
                        <>
                          <div className="relative my-auto flex flex-grow">
                            <Listbox.Button className="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-3 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500 sm:text-sm">
                              <div className="flex items-center">
                                <span
                                  aria-label={
                                    selectedMonth.valid ? "Online" : "Offline"
                                  }
                                  className={clsx(
                                    selectedMonth.valid
                                      ? "bg-green-400"
                                      : "bg-gray-200",
                                    "flex-shrink-0 inline-block h-2 w-2 rounded-full"
                                  )}
                                />
                                <span className="ml-3 block truncate">
                                  {selectedMonth.name}
                                </span>
                              </div>
                              <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                <ArrowsUpDownIcon
                                  className="h-5 w-5 text-gray-400"
                                  aria-hidden="true"
                                />
                              </span>
                            </Listbox.Button>

                            <Transition
                              show={open}
                              as={Fragment}
                              leave="transition ease-in duration-100"
                              leaveFrom="opacity-100"
                              leaveTo="opacity-0"
                            >
                              <Listbox.Options className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                                {months
                                  .concat(growthUtils.getDisplayOptionsArray())
                                  .map((month, index) => (
                                    <Listbox.Option
                                      key={index}
                                      className={({ active }) =>
                                        clsx(
                                          active
                                            ? "text-white bg-slate-700"
                                            : "text-gray-900",
                                          "cursor-default select-none relative py-2 pl-3 pr-9"
                                        )
                                      }
                                      value={month.value}
                                      disabled={!month.valid}
                                    >
                                      {({ selected, active }) => (
                                        <>
                                          <div className="flex items-center">
                                            <span
                                              className={clsx(
                                                month.valid
                                                  ? "bg-green-400"
                                                  : "bg-gray-200",
                                                "flex-shrink-0 inline-block h-2 w-2 rounded-full"
                                              )}
                                              aria-hidden="true"
                                            />
                                            <span
                                              className={clsx(
                                                selected
                                                  ? "font-semibold"
                                                  : "font-normal",
                                                "ml-3 block truncate"
                                              )}
                                            >
                                              {month.name}
                                              <span className="sr-only">
                                                {" "}
                                                is{" "}
                                                {month.valid
                                                  ? "online"
                                                  : "offline"}
                                              </span>
                                            </span>
                                          </div>

                                          {selected ? (
                                            <span
                                              className={clsx(
                                                active
                                                  ? "text-white"
                                                  : "text-slate-600",
                                                "absolute inset-y-0 right-0 flex items-center pr-4"
                                              )}
                                            >
                                              <CheckIcon
                                                className="h-5 w-5"
                                                aria-hidden="true"
                                              />
                                            </span>
                                          ) : null}
                                        </>
                                      )}
                                    </Listbox.Option>
                                  ))}
                              </Listbox.Options>
                            </Transition>
                          </div>
                        </>
                      )}
                    </Listbox>
                  </div>
                  <div className="mt-8">
                    <GrowthInsights growthUtils={growthUtils} />
                  </div>
                  <div className="my-8 flex justify-center">
                    <p className="text-sm tracking-normal opacity-60">
                      * asterisks indicate{" "}
                      <a
                        href="https://www.trysmudford.com/blog/linear-interpolation-functions/"
                        className="underline hover:no-underline"
                      >
                        lerp (linear interpolation)
                      </a>{" "}
                      used to calculate values due to incomplete data
                    </p>
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-lg shadow px-5 py-32 sm:px-6- h-[60vh]">
                  <Spinner />
                </div>
              )}
            </div>
          </div>
          <Footer />
        </div>
      </main>
    </>
  );
}

const Home: NextPage = () => {
  return Main();
};

export default Home;
