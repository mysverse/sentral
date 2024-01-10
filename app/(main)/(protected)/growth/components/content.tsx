import GrowthInsights from "components/growthInsights";
import GrowthUtils from "components/growthUtils";
import DefaultTransitionLayout from "components/transition";
import { GrowthEntry } from "components/apiTypes";
import GrowthChartSection from "./chartSection";

export default function GrowthPageContent({
  data: growthData,
  searchParams
}: {
  data: GrowthEntry[];
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const growthUtils = new GrowthUtils(growthData);

  const displayOptions = growthUtils.getDisplayOptionsArray();

  const displayOption = searchParams.displayOption
    ? Array.isArray(searchParams.displayOption)
      ? searchParams.displayOption[0]
      : searchParams.displayOption
    : searchParams.displayOption || "months";

  const sevenDayGrowth = growthUtils.get7DaysGrowth();
  const threeMonthGrowth = growthUtils.get3MonthsGrowth();

  const lastMonthGrowth = growthUtils.getLastMonthGrowth();
  const lastDayGrowth = growthUtils.getLastDayGrowth();

  const highestNumericGrowthMonth = growthUtils.getHighestGrowthMonth();
  const highestRelativeGrowthMonth =
    growthUtils.getHighestRelativeGrowthMonth();

  return (
    <div className="mx-auto my-auto max-w-7xl flex-grow px-4 sm:px-6 lg:px-8">
      <DefaultTransitionLayout show={true} appear={true}>
        <GrowthChartSection
          chartData={growthUtils.getLineChartDataPure(displayOption)}
          displayOptions={displayOptions}
        />
        <div className="mt-8">
          <GrowthInsights
            sevenDayGrowth={sevenDayGrowth}
            threeMonthGrowth={threeMonthGrowth}
            lastMonthGrowth={lastMonthGrowth}
            lastDayGrowth={lastDayGrowth}
            highestNumericGrowthMonth={highestNumericGrowthMonth}
            highestRelativeGrowthMonth={highestRelativeGrowthMonth}
          />
        </div>
        <div className="my-8 flex justify-center">
          <p className="text-sm tracking-normal opacity-60">
            * asterisks indicate{" "}
            <a
              href="https://www.trysmudford.com/blog/linear-interpolation-functions/"
              className="underline hover:no-underline"
            >
              lerp (linear interpolation)
            </a>{" "}
            used to calculate values due to incomplete data
          </p>
        </div>
      </DefaultTransitionLayout>
    </div>
  );
}
