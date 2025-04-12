"use client";

import MECSFAQ from "components/mecs/mecsFaq";
import StaffStats from "components/mecs/staffStats";

export default function MecsStaffPage() {
  return (
    <div className="mx-auto my-auto max-w-7xl grow px-4 sm:px-6 lg:px-8">
      <div className="rounded-lg bg-white px-5 py-6 shadow-sm sm:px-6">
        <StaffStats />
      </div>
      <div className="mt-6 rounded-lg bg-white px-5 py-6 shadow-sm sm:px-6">
        <MECSFAQ />
      </div>
    </div>
  );
}
