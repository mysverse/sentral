import { getGrowthData } from "components/fetcher";
import GrowthPageContent from "./components/content";

export default async function GrowthPage(
  props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  }
) {
  const searchParams = await props.searchParams;
  const data = await getGrowthData();
  return <GrowthPageContent data={data} searchParams={searchParams} />;
}
