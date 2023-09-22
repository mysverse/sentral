"use client";

import MECSFAQ from "components/mecs/mecsFaq";
import StaffStats from "components/mecs/staffStats";

export default function MecsStaffPage() {
  return (
    <div className="max-w-7xl my-auto flex-grow mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-lg shadow px-5 py-6 sm:px-6">
        <StaffStats />
      </div>
      <div className="bg-white rounded-lg shadow px-5 py-6 sm:px-6 mt-6">
        <MECSFAQ />
      </div>
    </div>
  );
}
