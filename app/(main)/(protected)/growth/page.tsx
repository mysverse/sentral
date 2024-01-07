import { getGrowthData } from "components/fetcher";
import GrowthPageContent from "./components/content";

export default async function GrowthPage() {
  const data = await getGrowthData();
  return <GrowthPageContent data={data} />;
}
