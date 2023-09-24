/* This example requires Tailwind CSS v2.0+ */
import { Disclosure } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { clsx } from "clsx";

const faqs = [
  {
    question: "What are the mandatory requirements?",
    answer:
      "Players must pass 3 mandatory criteria to be considered eligible for membership; account age, blacklist, and trust factor."
  },
  {
    question: "What does account age mean?",
    answer:
      "Account age is a measure of the duration since a player's account was created, and is typically measured in days. A mandatory membership requirement is to have an account older than 60 days*."
  },
  {
    question: "What types of blacklists are there?",
    answer:
      "There are two types of blacklists; individual and group blacklists. Individual blacklists are issued on a per-player basis, while group blacklists affect all players in a particular group."
  },
  {
    question:
      "Is it possible to be both individually and group blacklisted at the same time?",
    answer: `Yes. The MECS result will reflect this as "Multiple" under the blacklist section.`
  },
  {
    question: "What is the trust factor?",
    answer:
      "The trust factor system is a criteria-based scoring system that is used to determine a player's legitimacy based on several account characteristics, such as the amount of accessories owned."
  },
  {
    question: "Must all of the trust factor criteria be fulfilled to pass?",
    answer:
      "No. It is still possible to pass trust factor while failing any 1 of its criteria*. Passing score is 75% and above*."
  },
  {
    question: "What is DAR and MTBD?",
    answer:
      "DAR and MTBD are metrics used to gauge a membership staff's performance. DAR is short for Decision Accuracy Rate, a percentage that quantifies the decision-making accuracy of the individual. Higher DAR values are better. On the other hand, Mode Time Between Decisions (MTBD) measures the average time between decisions, typically measured in seconds and averaged with mode. A lower MTBD is better, however a higher DAR will always be prioritised."
  }
  // More questions...
];

export default function MECSFAQ() {
  return (
    <div className="divide-y-2 divide-gray-200">
      <h2 className="text-lg font-medium leading-6 text-gray-900">
        Common questions
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
                <Disclosure.Panel as="dd" className="mt-2 pr-12">
                  <p className="text-base text-gray-500">{faq.answer}</p>
                </Disclosure.Panel>
              </>
            )}
          </Disclosure>
        ))}
      </dl>
      <div className="mt-4 pt-4">
        <p className="text-sm opacity-60">*as of 11 May 2023</p>
      </div>
    </div>
  );
}
