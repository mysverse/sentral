/* This example requires Tailwind CSS v2.0+ */
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Transition
} from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { clsx } from "clsx";
import { JSX } from "react";

interface FAQProps {
  title: string;
  footer?: string;
  faqs: { question: string; answer: JSX.Element | string }[];
}

export default function FAQ(props: FAQProps) {
  return (
    <div className="divide-edge divide-y-2">
      <h2 className="text-strong pb-2 text-lg leading-6 font-medium">
        {props.title}
      </h2>
      <dl className="divide-edge mt-4 space-y-3 divide-y">
        {props.faqs.map((faq) => (
          <Disclosure as="div" key={faq.question} className="pt-1 pb-3">
            {({ open }) => (
              <>
                <dt className="text-base">
                  <DisclosureButton className="text-muted flex w-full items-start justify-between text-left">
                    <span className="text-strong font-medium">
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
                  </DisclosureButton>
                </dt>
                <Transition
                  as="div"
                  enter="transition duration-100 ease-out"
                  enterFrom="transform scale-95 opacity-0"
                  enterTo="transform scale-100 opacity-100"
                  leave="transition duration-75 ease-out"
                  leaveFrom="transform scale-100 opacity-100"
                  leaveTo="transform scale-95 opacity-0"
                >
                  <DisclosurePanel as="dd" className="mt-2 pr-12">
                    <p className="text-muted text-base">{faq.answer}</p>
                  </DisclosurePanel>
                </Transition>
              </>
            )}
          </Disclosure>
        ))}
      </dl>
      {props.footer && (
        <div className="mt-4 pt-4">
          <p className="text-sm opacity-60">{props.footer}</p>
        </div>
      )}
    </div>
  );
}
