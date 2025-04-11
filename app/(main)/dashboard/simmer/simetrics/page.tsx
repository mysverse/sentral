import React from "react";
import MainClient from "./MainClient";
import type { SearchParams } from "nuqs/server";
import { dateParamsCache } from "utils/searchParams";

export const metadata = {
  title: "Simetrics"
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

export default async function SimetryPage(props: {
  searchParams: Promise<SearchParams>; // Next.js 15+: async searchParams prop
}) {
  const url = new URL(
    "https://mysverse-webhook-data.yan3321.workers.dev/614134433204797466"
  );

  let { date } = await dateParamsCache.parse(props.searchParams);

  if (!date) {
    date = new Date();
  }

  url.searchParams.set("date", date.toISOString());

  const response = await fetch(url, { next: { revalidate: 60 } });

  const data: User[] = await response.json();

  return <MainClient data={data} key={date.toISOString()} />;
}
