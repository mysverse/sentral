"use client";

/* This example requires Tailwind CSS v2.0+ */
import { Disclosure, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { clsx } from "clsx";

const faqs = [
  {
    question: "What is Sentral?",
    answer: `MYSverse Sentral, or just Sentral, is the official hub and companion app for MYSverse, serving game statistics, analytics tools, and a lot more to come!`
  },
  {
    question: "This looks familiar, is Sentral related to MYX Labs?",
    answer: `Since the developer of MYX Labs joined the MYSverse project, most of its current architecture has been shared. However, there have been a lot of backend changes to accomodate the new Roblox authentication flow, and a new, more efficient application UI will be introduced in due time.`
  },
  {
    question: "Who's behind this project?",
    answer: (
      <>
        Sentral is developed by{" "}
        <a
          href="https://twitter.com/yan3321"
          className="text-blue-700 underline hover:no-underline"
        >
          {" "}
          @yan3321
        </a>{" "}
        (aka. Yan), co-founder of MYSverse who also leads engineering, design,
        and content initiatives.
      </>
    )
  },
  {
    question: "How do I reach out for reports and enquiries?",
    answer: (
      <>
        For everything regarding MYSverse web infrastructure, contact Yan at{" "}
        <a
          href="mailto:yan@mysver.se"
          className="text-blue-700 underline hover:no-underline"
        >
          yan@mysver.se
        </a>
        . A reply (if applicable) will typically be sent within a week.
      </>
    )
  },
  {
    question:
      "What about open-source commitments? I'd like to look at the code.",
    answer: (
      <>
        The open-source strategy for MYSverse is still being finalised, but many
        features from MYX Labs are available on their{" "}
        <a
          href="https://github.com/myx-labs"
          className="text-blue-700 underline hover:no-underline"
        >
          GitHub
        </a>
        .
      </>
    )
  }
];

export default function GeneralFAQ() {
  return (
    <div className="divide-y-2 divide-gray-200">
      <h2 className="text-lg font-medium leading-6 text-gray-900">
        About MYSverse Sentral
      </h2>
      <dl className="mt-4 space-y-3 divide-y divide-gray-200">
        {faqs.map((faq) => (
          <Disclosure as="div" key={faq.question} className="pt-6">
            {({ open }) => (
              <>
                <dt className="text-base">
                  <Disclosure.Button className="flex w-full items-start justify-between text-left text-gray-400">
                    <span className="font-medium text-gray-900">
                      {faq.question}
                    </span>
                    <span className="ml-6 flex h-7 items-center">
                      <ChevronDownIcon
                        className={clsx(
                          open ? "-rotate-180" : "rotate-0",
                          "h-6 w-6 transform"
                        )}
                        aria-hidden="true"
                      />
                    </span>
                  </Disclosure.Button>
                </dt>
                <Transition
                  enter="transition duration-100 ease-out"
                  enterFrom="transform scale-95 opacity-0"
                  enterTo="transform scale-100 opacity-100"
                  leave="transition duration-75 ease-out"
                  leaveFrom="transform scale-100 opacity-100"
                  leaveTo="transform scale-95 opacity-0"
                >
                  <Disclosure.Panel as="dd" className="mt-2 pr-12">
                    <p className="text-base text-gray-500">{faq.answer}</p>
                  </Disclosure.Panel>
                </Transition>
              </>
            )}
          </Disclosure>
        ))}
      </dl>
    </div>
  );
}
