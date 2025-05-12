import { Transition } from "@headlessui/react";
import { DocumentCheckIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import Logo from "public/img/MYSverse_Sentral_Logo.svg";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <Transition
      as="div"
      show={true}
      appear={true}
      enter="transform transition duration-[500ms] delay-75"
      enterFrom="opacity-0 -translate-y-36 scale-80"
      enterTo="opacity-100 translate-y-0 scale-100"
      leave="transform transition duration-[750ms]"
      leaveFrom="opacity-100 translate-y-0 scale-100"
      leaveTo="opacity-0 -translate-y-36 scale-80"
    >
      <div className="mb-6 flex flex-col items-center gap-y-6 md:mb-16">
        <Logo className="h-16 w-auto fill-white md:h-18" />
        {children}
        <div>
          <Link
            href="/verify"
            className="flex items-center gap-x-2 rounded px-4 py-2 text-white opacity-100 transition hover:opacity-80"
          >
            <DocumentCheckIcon className="size-5" />
            or verify a certificate
          </Link>
        </div>
      </div>
    </Transition>
  );
}
