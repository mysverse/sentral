import React from "react";
import MainClient from "./MainClient";

export const metadata = {
  title: "Simetry"
};

export interface User {
  name: {
    name: string;
    userId: number;
  };
  rank?: string;
  signOnTime: string; // ISO date string
  signOffTime: string; // ISO date string
  dutyDuration: number; // in seconds
  cumulativeDutyDuration: number; // in seconds
  location: string;
}

export default async function SimetryPage() {
  const response = await fetch(
    "https://mysverse-webhook-data.yan3321.workers.dev/614134433204797466",
    { next: { revalidate: 60 } }
  );

  const data: User[] = await response.json();

  return <MainClient data={data} />;
}
