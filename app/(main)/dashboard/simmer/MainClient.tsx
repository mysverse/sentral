"use client";

import EmailAccess from "./EmailAccess";
import FeatureCard from "./FeatureCard";
import FinsysLogo from "public/img/finsys/finsys.svg";
import GentagLogo from "public/img/gentag/gentag.svg";
import SimetricsLogo from "public/img/simetrics/MYS_Simetrics_Logo.svg";

interface Group {
  group: {
    id: number;
    name: string;
  };
  role: {
    name: string;
  };
}

interface MainClientProps {
  authorised: boolean;
  groups: Group[];
  userId: number;
  username: string;
}

export default function MainClient({
  authorised,
  // groups,
  userId,
  username
}: MainClientProps) {
  if (!authorised) {
    return (
      <div className="flex h-screen items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-800">
          You are not authorised to view this page.
        </h1>
      </div>
    );
  }

  return (
    <div className="">
      {/* <div className="mb-8">
        <h1 className="mb-2 text-center text-2xl font-bold text-white">
          Welcome, @{username}
        </h1>
        <h2 className="text-center text-xl font-medium text-white">
          Your MYSverse Sim memberships
        </h2>

        <div className="mt-4 grid grid-cols-1 items-center justify-center gap-6 md:grid-cols-2">
          {groups.map((group) => (
            <div
              key={group.group.id}
              className="col-span-1 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-gray-800 md:text-xl">
                {group.group.name}
              </h3>
              <p className="text-gray-600">{group.role.name}</p>
            </div>
          ))}
        </div>
      </div> */}
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
        <FeatureCard
          title="GenTag"
          description="Generate unique nametags"
          href="/dashboard/simmer/gentag"
          logo={GentagLogo}
        />
        <FeatureCard
          title="FinSys"
          description="Request a payout"
          href="/dashboard/simmer/finsys"
          logo={FinsysLogo}
        />
        <FeatureCard
          title="Simetrics"
          description="Detailed duty metrics"
          href="/dashboard/simmer/simetrics"
          logo={SimetricsLogo}
        />
        <EmailAccess userId={userId} username={username} />
      </div>
    </div>
  );
}
