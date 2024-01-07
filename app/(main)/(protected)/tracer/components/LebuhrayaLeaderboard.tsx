"use client";

import { Avatar } from "components/catalyst/avatar";
import { RaceLeaderboard } from "components/constants/types";
import DefaultTransitionLayout from "components/transition";
import Link from "next/link";

export default function LebuhrayaLeaderboard({
  data
}: {
  data: RaceLeaderboard[];
}) {
  return (
    <DefaultTransitionLayout show={!!data} appear={true}>
      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                  >
                    Position
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Player
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Record Time
                  </th>
                  {/* <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Role
                  </th> */}
                  {/* <th
                    scope="col"
                    className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                  >
                    <span className="sr-only">Edit</span>
                  </th> */}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {data
                  .filter((person) => person.user)
                  .map((person, index) => (
                    <tr key={person.user.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {`${(index + 1).toString().padStart(3, "0")}`}
                      </td>
                      {/* <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {person.title}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {person.email}
                    </td> */}
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <Link
                          href={`https://roblox.com/users/${person.user.id}/profile`}
                          target="=_blank"
                          className="flex items-center"
                        >
                          <Avatar
                            className="size-8 sm:size-11"
                            src={person.image}
                            initials={person.user.displayName.slice(0, 1)}
                            square
                          />
                          <div className="ml-4">
                            <div className="hidden font-medium text-gray-900 hover:underline sm:block">
                              {`${person.user.displayName} (@${person.user.name})`}
                            </div>
                            <div className="block font-medium text-gray-900 hover:underline sm:hidden">
                              {`@${person.user.name}`}
                            </div>
                          </div>
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {person.time}
                      </td>
                      {/* <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <a
                        href="#"
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit<span className="sr-only">, {person.name}</span>
                      </a>
                    </td> */}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DefaultTransitionLayout>
  );
}
