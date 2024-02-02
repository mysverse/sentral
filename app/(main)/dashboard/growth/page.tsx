import { getGrowthData } from "components/fetcher";
import GrowthPageContent from "./components/content";

export default async function GrowthPage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const data = await getGrowthData();
  return <GrowthPageContent data={data} searchParams={searchParams} />;
}
