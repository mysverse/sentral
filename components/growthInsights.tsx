import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/20/solid";
import {
  CalendarIcon,
  SunIcon,
  UserGroupIcon
} from "@heroicons/react/24/outline";
import { clsx } from "clsx";

type HeroIcon = React.ForwardRefExoticComponent<
  Omit<React.SVGProps<SVGSVGElement>, "ref"> & {
    title?: string | undefined;
    titleId?: string | undefined;
  } & React.RefAttributes<SVGSVGElement>
>;

interface statistics {
  id: number;
  name: string;
  subtitle: string;
  stat: string;
  icon: HeroIcon;
  change?: string;
  changeType?: string;
}

function StatDisplay(stats: statistics[]) {
  return (
    <div>
      {/* <h3 className="text-lg leading-6 font-medium text-gray-900">
        Last 30 days
      </h3> */}
      <dl className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((item) => (
          <div
            key={item.id}
            className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6"
          >
            <dt>
              <div
                className={clsx(
                  item.changeType === "increase"
                    ? "bg-green-400"
                    : item.changeType === "decrease"
                      ? "bg-red-400"
                      : "bg-slate-500",
                  "absolute rounded-md p-3"
                )}
              >
                <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">
                {item.name}
              </p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">
                {item.stat}
              </p>
              {item.changeType && item.change ? (
                <p
                  className={clsx(
                    item.changeType === "increase"
                      ? "text-green-600"
                      : "text-red-600",
                    "ml-2 flex items-baseline text-sm font-semibold"
                  )}
                >
                  {item.changeType === "increase" ? (
                    <ArrowUpIcon
                      className="mr-1 h-4 w-4 flex-shrink-0 self-center text-green-500"
                      aria-hidden="true"
                    />
                  ) : (
                    <ArrowDownIcon
                      className="mr-1 h-4 w-4 flex-shrink-0 self-center text-red-500"
                      aria-hidden="true"
                    />
                  )}

                  <span className="sr-only">
                    {item.changeType === "increase" ? "Increased" : "Decreased"}{" "}
                    by
                  </span>
                  {item.change}
                </p>
              ) : null}
              <div className="absolute inset-x-0 bottom-0 bg-gray-50 px-4 py-4 sm:px-6">
                <p className="text-sm font-normal text-slate-500">
                  {item.subtitle}
                  <span className="sr-only"> {item.name} stats</span>
                </p>
              </div>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default function GrowthInsights({
  sevenDayGrowth,
  threeMonthGrowth,
  lastMonthGrowth,
  lastDayGrowth,
  highestNumericGrowthMonth,
  highestRelativeGrowthMonth
}: {
  sevenDayGrowth: {
    current: number;
    previous: number;
    interpolated: boolean;
  };
  threeMonthGrowth: {
    current: number;
    previous: number;
    interpolated: boolean;
  };
  lastMonthGrowth: {
    current: number;
    previous: number;
    interpolated: boolean;
  };
  lastDayGrowth: {
    current: number;
    previous: number;
    interpolated: boolean;
  };
  highestNumericGrowthMonth: {
    date: Date;
    currentMonthGrowth?: number;
    previousMonthGrowth?: number;
    members: number;
    interpolated: boolean;
  };
  highestRelativeGrowthMonth: {
    date: Date;
    currentMonthGrowth?: number;
    previousMonthGrowth?: number;
    members: number;
    interpolated: boolean;
  };
}) {
  const statList = [
    {
      id: 1,
      name: "Average Daily Growth",
      subtitle: "Values over the last 7 days",
      stat:
        `${Math.floor(sevenDayGrowth.current / 7).toLocaleString()}` +
        (sevenDayGrowth.interpolated ? "*" : ""),
      icon: SunIcon,
      change: `${(
        ((sevenDayGrowth.current - sevenDayGrowth.previous) /
          sevenDayGrowth.previous) *
        100
      ).toFixed(2)}%`,
      changeType:
        sevenDayGrowth.current > sevenDayGrowth.previous
          ? "increase"
          : sevenDayGrowth.current < sevenDayGrowth.previous
            ? "decrease"
            : undefined
    },
    {
      id: 2,
      name: "Average Monthly Growth",
      subtitle: "Values over the last 3 months",
      stat:
        `${Math.floor(threeMonthGrowth.current / 3).toLocaleString()}` +
        (threeMonthGrowth.interpolated ? "*" : ""),
      icon: CalendarIcon,
      change: `${(
        ((threeMonthGrowth.current - threeMonthGrowth.previous) /
          threeMonthGrowth.previous) *
        100
      ).toFixed(2)}%`,
      changeType:
        threeMonthGrowth.current > threeMonthGrowth.previous
          ? "increase"
          : threeMonthGrowth.current < threeMonthGrowth.previous
            ? "decrease"
            : undefined
    },
    {
      id: 3,
      name: "Previous Daily Growth",
      subtitle: "Value compared to day before it",
      stat:
        `${lastDayGrowth.current.toLocaleString()}` +
        (lastDayGrowth.interpolated ? "*" : ""),
      icon: SunIcon,
      change: `${(
        ((lastDayGrowth.current - lastDayGrowth.previous) /
          lastDayGrowth.previous) *
        100
      ).toFixed(2)}%`,
      changeType:
        lastDayGrowth.current > lastDayGrowth.previous
          ? "increase"
          : lastDayGrowth.current < lastDayGrowth.previous
            ? "decrease"
            : undefined
    },
    {
      id: 4,
      name: "Previous Monthly Growth",
      subtitle: "Value compared to month before it",
      stat:
        `${lastMonthGrowth.current.toLocaleString()}` +
        (lastMonthGrowth.interpolated ? "*" : ""),
      icon: CalendarIcon,
      change: `${(
        ((lastMonthGrowth.current - lastMonthGrowth.previous) /
          lastMonthGrowth.previous) *
        100
      ).toFixed(2)}%`,
      changeType:
        lastMonthGrowth.current > lastMonthGrowth.previous
          ? "increase"
          : lastMonthGrowth.current < lastMonthGrowth.previous
            ? "decrease"
            : undefined
    },
    {
      id: 5,
      name: "Highest Numeric Growth Month",
      subtitle: "Month with the highest member increase",
      stat:
        highestNumericGrowthMonth.date.toLocaleString("default", {
          month: "short",
          year: "numeric"
        }) + (highestNumericGrowthMonth.interpolated ? "*" : ""),
      icon: UserGroupIcon,
      change: `${highestNumericGrowthMonth.currentMonthGrowth?.toLocaleString()}`
      // changeType: "increase"
    },
    {
      id: 6,
      name: "Highest Relative Growth Month",
      subtitle: "Percentage relative to previous member count",
      stat:
        highestRelativeGrowthMonth.date.toLocaleString("default", {
          month: "short",
          year: "numeric"
        }) + (highestRelativeGrowthMonth.interpolated ? "*" : ""),
      icon: UserGroupIcon,
      change: `${(
        ((highestRelativeGrowthMonth.currentMonthGrowth || 0) /
          highestRelativeGrowthMonth.members) *
        100
      ).toFixed(2)}%`
      // changeType: "increase"
    }
  ];

  return <>{StatDisplay(statList)}</>;
}
