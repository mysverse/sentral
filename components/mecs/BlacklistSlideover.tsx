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
  const items = apiResponse
    ? type === "groups"
      ? apiResponse.groups
      : apiResponse.users
    : [];

  return (
    <Dialog
      open={open}
      onClose={setOpen}
      className="relative z-50 transition duration-300 ease-out data-closed:opacity-0"
      transition
    >
      <DialogBackdrop className="fixed inset-0 bg-black/30" />
      <div className="fixed inset-0 flex items-end justify-end">
        <DialogPanel className="bg-surface flex h-full w-full max-w-md flex-col">
          <div className="flex items-start justify-between p-6">
            <DialogTitle className="text-strong text-lg font-medium">
              Blacklisted
            </DialogTitle>
            <button
              type="button"
              className="bg-surface text-muted hover:text-muted rounded-md focus:ring-2 focus:ring-slate-500"
              onClick={() => setOpen(false)}
            >
              <span className="sr-only">Close panel</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="border-edge border-b px-6">
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
                      : "text-muted hover:border-edge hover:text-strong border-transparent",
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
            className="divide-edge flex-1 divide-y overflow-y-auto px-2"
          >
            {isLoading ? (
              <li className="text-muted px-5 py-6 text-sm">
                Loading blacklist data...
              </li>
            ) : isError ? (
              <li className="text-muted px-5 py-6 text-sm">
                Unable to load blacklist data.
                {isError.message ? ` ${isError.message}` : null}
              </li>
            ) : (
              [...items]
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
                          className="group-hover:bg-surface-muted absolute inset-0"
                          aria-hidden="true"
                        />
                        <div className="relative flex min-w-0 flex-1 items-center">
                          <div className="truncate">
                            <p className="text-strong truncate text-sm font-medium">
                              {type === "groups" ? item.name : `@${item.name}`}
                            </p>
                            <p className="text-muted w-72 text-sm whitespace-normal">
                              from{" "}
                              {Array.isArray(item.types)
                                ? item.types.sort().join(", ")
                                : "unknown source"}
                            </p>
                            <p className="text-muted w-72 text-sm whitespace-normal">
                              {formatDistanceToNow(new Date(item.updated), {
                                addSuffix: true
                              })}
                            </p>
                          </div>
                        </div>
                      </Link>
                    </div>
                  </li>
                ))
            )}
          </ul>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
