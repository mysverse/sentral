"use client";

import {
  CalendarIcon,
  ChevronDownIcon,
  ClockIcon
} from "@heroicons/react/24/outline";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel
} from "@headlessui/react";
import { AnimatePresence, motion } from "motion/react";

export default function FilterBar({
  selectedDate,
  onDateChange,
  startTime,
  onStartTimeChange,
  endTime,
  onEndTimeChange,
  maxDate
}: {
  selectedDate: string;
  onDateChange: (date: string) => void;
  startTime: string;
  onStartTimeChange: (time: string) => void;
  endTime: string;
  onEndTimeChange: (time: string) => void;
  maxDate: string;
}) {
  return (
    <div className="bg-surface rounded-lg shadow-sm">
      <Disclosure defaultOpen>
        {({ open }) => (
          <>
            <DisclosureButton className="flex w-full items-center justify-between px-4 py-4 sm:px-6">
              <h2 className="text-strong text-sm font-semibold">Filters</h2>
              <motion.div
                animate={{ rotate: open ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDownIcon className="text-muted h-5 w-5" />
              </motion.div>
            </DisclosureButton>

            <AnimatePresence initial={false}>
              {open && (
                <DisclosurePanel static as="div">
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-gray-100 px-4 pb-4 sm:px-6">
                      <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-end">
                        <div className="flex flex-col gap-1.5 sm:flex-1">
                          <label className="text-strong flex items-center gap-1.5 text-sm font-medium">
                            <CalendarIcon className="text-muted h-4 w-4" />
                            Date
                          </label>
                          <input
                            type="date"
                            value={selectedDate}
                            max={maxDate}
                            onChange={(e) => onDateChange(e.target.value)}
                            className="border-edge rounded-md text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5 sm:flex-1">
                          <label className="text-strong flex items-center gap-1.5 text-sm font-medium">
                            <ClockIcon className="text-muted h-4 w-4" />
                            Start time
                          </label>
                          <input
                            type="time"
                            value={startTime}
                            onChange={(e) => onStartTimeChange(e.target.value)}
                            className="border-edge rounded-md text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5 sm:flex-1">
                          <label className="text-strong flex items-center gap-1.5 text-sm font-medium">
                            <ClockIcon className="text-muted h-4 w-4" />
                            End time
                          </label>
                          <input
                            type="time"
                            value={endTime}
                            onChange={(e) => onEndTimeChange(e.target.value)}
                            className="border-edge rounded-md text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </DisclosurePanel>
              )}
            </AnimatePresence>
          </>
        )}
      </Disclosure>
    </div>
  );
}
