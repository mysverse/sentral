import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
import { useCombinedBlacklistData } from "components/swr";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Dispatch, SetStateAction } from "react";

export default function BlacklistSlideover({
  open,
  setOpen,
  type,
  setType
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  type: "users" | "groups";
  setType: Dispatch<SetStateAction<"users" | "groups">>;
}) {
  const { apiResponse, isLoading, isError } = useCombinedBlacklistData(true);

  if (isLoading || isError) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={setOpen}
      className="relative z-50 transition duration-300 ease-out data-closed:opacity-0"
      transition
    >
      <DialogBackdrop className="fixed inset-0 bg-black/30" />
      <div className="fixed inset-0 flex items-end justify-end">
        <DialogPanel className="flex h-full w-full max-w-md flex-col bg-white">
          <div className="flex items-start justify-between p-6">
            <DialogTitle className="text-lg font-medium text-gray-900">
              Blacklisted
            </DialogTitle>
            <button
              type="button"
              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:ring-2 focus:ring-slate-500"
              onClick={() => setOpen(false)}
            >
              <span className="sr-only">Close panel</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="border-b border-gray-200 px-6">
            <nav className="-mb-px flex space-x-6">
              {[
                { name: "Users", value: "users" },
                { name: "Communities", value: "groups" }
              ].map((tab) => (
                <div
                  key={tab.value}
                  className={clsx(
                    tab.value === type
                      ? "border-slate-500 text-slate-600"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                    "cursor-pointer border-b-2 px-1 pb-4 text-sm font-medium whitespace-nowrap"
                  )}
                  onClick={() => setType(tab.value as "users" | "groups")}
                >
                  {tab.name}
                </div>
              ))}
            </nav>
          </div>
          <ul
            role="list"
            className="flex-1 divide-y divide-gray-200 overflow-y-auto px-2"
          >
            {apiResponse &&
              (type === "groups" ? apiResponse.groups : apiResponse.users)
                .sort((a, b) =>
                  new Date(a.updated).getTime() < new Date(b.updated).getTime()
                    ? 1
                    : -1
                )
                .map((item, index) => (
                  <li key={index}>
                    <div className="group relative flex items-center px-5 py-6">
                      <Link
                        target="_blank"
                        href={
                          type === "groups"
                            ? `https://roblox.com/groups/${item.id}`
                            : item.id
                              ? `https://www.roblox.com/users/${item.id}/profile`
                              : `https://www.roblox.com/search/users?keyword=${item.name}`
                        }
                        className="-m-1 block flex-1 p-1"
                      >
                        <div
                          className="absolute inset-0 group-hover:bg-gray-50"
                          aria-hidden="true"
                        />
                        <div className="relative flex min-w-0 flex-1 items-center">
                          <div className="truncate">
                            <p className="truncate text-sm font-medium text-gray-900">
                              {type === "groups" ? item.name : `@${item.name}`}
                            </p>
                            <p className="w-72 text-sm whitespace-normal text-gray-500">
                              from {item.types.sort().join(", ")}
                            </p>
                            <p className="w-72 text-sm whitespace-normal text-gray-500">
                              {formatDistanceToNow(item.updated, {
                                addSuffix: true
                              })}
                            </p>
                          </div>
                        </div>
                      </Link>
                    </div>
                  </li>
                ))}
          </ul>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
