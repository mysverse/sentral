"use client";

import { ArrowsUpDownIcon, CheckIcon } from "@heroicons/react/20/solid";
import { Listbox, RadioGroup, Transition } from "@headlessui/react";
import { clsx } from "clsx";
import GrowthInsights from "components/growthInsights";
import GrowthUtils from "components/growthUtils";
import { Fragment, useState } from "react";
import DefaultTransitionLayout from "components/transition";
import GrowthChart from "components/growthChart";
import { GrowthEntry } from "components/apiTypes";

const chartAxisOptions = [
  { name: "Linear", value: "linear", disabled: false },
  { name: "Logarithmic", value: "logarithmic", disabled: false }
];

interface DisplayMonth {
  name: string;
  value: string;
  valid: boolean;
}

const months: DisplayMonth[] = [
  { name: "Cumulative (monthly)", value: "months", valid: true },
  { name: "Cumulative (weekly)", value: "weeks", valid: true }
];

export default function GrowthPageContent({
  data: growthData
}: {
  data: GrowthEntry[];
}) {
  const [logarithmic, setLogarithmic] = useState(false);

  const [selectedMonthValue, setSelectedMonthValue] = useState<string>(
    months[0].value
  );

  const [selectedMonth, setSelectedMonth] = useState<DisplayMonth>(months[0]);

  const growthUtils = new GrowthUtils(growthData);

  return (
    <div className="mx-auto my-auto max-w-7xl flex-grow px-4 sm:px-6 lg:px-8">
      <DefaultTransitionLayout show={true} appear={true}>
        <div className="rounded-lg bg-white px-1 py-6 shadow sm:px-5">
          {/* chart won't scale properly without width class: https://stackoverflow.com/a/70191511 */}
          <div className="relative h-[28rem] w-[99%]">
            <GrowthChart
              growthUtils={growthUtils}
              logarithmic={logarithmic}
              displayOption={selectedMonth.value}
            />
          </div>
        </div>
        <div className="mt-8 grid grid-cols-1 justify-center gap-6 rounded-lg bg-white px-5 py-6 shadow sm:grid-cols-2 sm:px-6">
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
                        : "cursor-not-allowed opacity-25",
                      active ? "ring-2 ring-blue-500 ring-offset-2" : "",
                      checked
                        ? "border-transparent bg-blue-600 text-white hover:bg-blue-700"
                        : "border-gray-200 bg-white text-gray-900 hover:bg-gray-50",
                      "flex items-center justify-center rounded-md border px-2 py-3 text-sm font-medium sm:flex-1 sm:px-6"
                    )
                  }
                  disabled={option.disabled}
                >
                  <RadioGroup.Label as="p">{option.name}</RadioGroup.Label>
                </RadioGroup.Option>
              ))}
            </div>
          </RadioGroup>
          <Listbox
            value={selectedMonthValue}
            onChange={(value) => {
              if (!growthUtils) return;
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
                  <Listbox.Button className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-3 pl-3 pr-10 text-left shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 sm:text-sm">
                    <div className="flex items-center">
                      <span
                        aria-label={selectedMonth.valid ? "Online" : "Offline"}
                        className={clsx(
                          selectedMonth.valid ? "bg-green-400" : "bg-gray-200",
                          "inline-block h-2 w-2 flex-shrink-0 rounded-full"
                        )}
                      />
                      <span className="ml-3 block truncate">
                        {selectedMonth.name}
                      </span>
                    </div>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
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
                    <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                      {months
                        .concat(growthUtils?.getDisplayOptionsArray() || [])
                        .map((month, index) => (
                          <Listbox.Option
                            key={index}
                            className={({ active }) =>
                              clsx(
                                active
                                  ? "bg-slate-700 text-white"
                                  : "text-gray-900",
                                "relative cursor-default select-none py-2 pl-3 pr-9"
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
                                      "inline-block h-2 w-2 flex-shrink-0 rounded-full"
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
                                      is {month.valid ? "online" : "offline"}
                                    </span>
                                  </span>
                                </div>

                                {selected ? (
                                  <span
                                    className={clsx(
                                      active ? "text-white" : "text-slate-600",
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
      </DefaultTransitionLayout>
    </div>
  );
}
