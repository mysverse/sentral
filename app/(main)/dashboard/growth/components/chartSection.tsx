"use client";

import { Fragment, useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Label,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Radio,
  RadioGroup,
  Transition
} from "@headlessui/react";
import { ArrowsUpDownIcon, CheckIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";

const chartAxisOptions = [
  { name: "Linear", value: "linear", disabled: false },
  { name: "Logarithmic", value: "logarithmic", disabled: false }
];

interface DisplayMonth {
  name: string;
  value: string;
  valid: boolean;
}

const GrowthChart = dynamic(() => import("components/growthChart"));

export default function GrowthChartSection({
  chartData,
  displayOptions
}: {
  chartData: {
    labels: number[] | undefined;
    data: number[];
    increment: "day" | "week" | "month";
  };
  displayOptions: DisplayMonth[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  const [logarithmic, setLogarithmic] = useState(false);

  const [months] = useState<DisplayMonth[]>(
    [
      { name: "Cumulative (monthly)", value: "months", valid: true },
      { name: "Cumulative (weekly)", value: "weeks", valid: true }
    ].concat(displayOptions)
  );

  const [selectedMonthValue, setSelectedMonthValue] = useState<string>(
    months[0].value
  );

  const [selectedMonth, setSelectedMonth] = useState<DisplayMonth>(months[0]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    function isValidDisplayOption(option: string | null) {
      return months.find((month) => month.value === option);
    }
    const selectedOption = searchParams.get("displayOption");
    const result = isValidDisplayOption(selectedOption);
    if (result) {
      setSelectedMonthValue(result.value);
      setSelectedMonth(result);
      setLoading(false);
    }
  }, [searchParams, months]);

  return (
    <>
      <div className="rounded-lg bg-white px-1 py-6 shadow-sm sm:px-5">
        <div className="relative h-[28rem] w-[99%]">
          <GrowthChart
            chartData={chartData}
            logarithmic={logarithmic}
            loading={loading}
          />
        </div>
      </div>
      <div className="mt-8 grid grid-cols-1 justify-center gap-6 rounded-lg bg-white px-5 py-6 shadow-sm sm:grid-cols-2 sm:px-6">
        <RadioGroup
          value={logarithmic ? "logarithmic" : "linear"}
          onChange={(e) => {
            setLogarithmic(e === "logarithmic");
          }}
        >
          <Label className="sr-only">Choose a chart display option</Label>
          <div className="grid grid-cols-2 gap-2">
            {chartAxisOptions.map((option) => (
              <Radio
                key={option.name}
                value={option.value}
                className={({ hover, checked }) =>
                  clsx(
                    "flex items-center justify-center rounded-md border px-2 py-3 text-sm font-medium sm:flex-1 sm:px-6",
                    !option.disabled
                      ? "cursor-pointer focus:outline-hidden"
                      : "cursor-not-allowed opacity-25",
                    checked
                      ? "border-transparent bg-blue-600 text-white hover:bg-blue-700"
                      : "border-gray-200 bg-white text-gray-900 hover:bg-gray-50",
                    hover ? "ring-2 ring-blue-500 ring-offset-2" : ""
                  )
                }
                disabled={option.disabled}
              >
                <Label>{option.name}</Label>
              </Radio>
            ))}
          </div>
        </RadioGroup>
        <Listbox
          value={selectedMonthValue}
          onChange={(value) => {
            const month = months.find((e) => e.value === value);
            if (month) {
              setSelectedMonthValue(value);
              setSelectedMonth(month);
              setLoading(true);
              router.replace(
                pathname + "?" + createQueryString("displayOption", value),
                { scroll: false }
              );
            }
          }}
        >
          {({ open }) => (
            <div className="relative">
              <ListboxButton className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-3 pl-3 pr-10 text-left shadow-xs focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500 sm:text-sm">
                <div className="flex items-center">
                  <span
                    aria-label={selectedMonth.valid ? "Online" : "Offline"}
                    className={clsx(
                      selectedMonth.valid ? "bg-green-400" : "bg-gray-200",
                      "inline-block h-2 w-2 shrink-0 rounded-full"
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
              </ListboxButton>

              <Transition
                as="div"
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                {open && (
                  <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-hidden sm:text-sm">
                    {months.map((month, index) => (
                      <ListboxOption
                        key={index}
                        value={month.value}
                        disabled={!month.valid}
                        className={({ selected, disabled }) =>
                          clsx(
                            "relative cursor-default select-none py-2 pl-3 pr-9",
                            selected
                              ? "bg-linear-to-l from-blue-500 via-blue-700 to-blue-800 text-white"
                              : "text-gray-900",
                            disabled && "opacity-50"
                          )
                        }
                      >
                        {({ selected }) => (
                          <>
                            <div className="flex items-center">
                              <span
                                className={clsx(
                                  month.valid ? "bg-green-400" : "bg-gray-200",
                                  "inline-block h-2 w-2 shrink-0 rounded-full"
                                )}
                                aria-hidden="true"
                              />
                              <span
                                className={clsx(
                                  selected ? "font-semibold" : "font-normal",
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
                                  selected ? "text-white" : "text-blue-600",
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
                      </ListboxOption>
                    ))}
                  </ListboxOptions>
                )}
              </Transition>
            </div>
          )}
        </Listbox>
      </div>
    </>
  );
}
