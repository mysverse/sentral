import humanizeDuration from "humanize-duration";
import clsx from "clsx";
import DefaultTransitionLayout from "./transition";
import { MYSverseData } from "./fetcher";
import CountUp from "./Countup";

function Stats({ bandarData }: { bandarData: MYSverseData["bandarData"] }) {
  const stats = [
    {
      name: "Playtime",
      value: humanizeDuration(bandarData.SessionTimeKeeper * 1000, {
        units: ["h", "m", "s", "ms"],
        largest: 1,
        round: true
      })
      // change: "+4.75%",
      // changeType: "positive"
    },
    {
      name: "Currency",
      value: <CountUp end={bandarData.bandar_ringgit} decimals={2} />
    },
    {
      name: "Cars owned",
      value: bandarData.MYS_PermanentVehicles_2.length || 0
      // change: "-1.39%",
      // changeType: "positive"
    },
    {
      name: "Quests completed",
      value: bandarData.MYS_Quest_2.Quests.length || 0
      // change: "-1.39%",
      // changeType: "positive"
    },
    {
      name: "Friends in phone",
      value: Object.keys(bandarData.MYS_Message_2.Friends).length || 0
      // change: "+54.02%",
      // changeType: "negative"
    }
    // {
    //   name: "Expenses",
    //   value: "$30,156.00",
    //   change: "+10.18%",
    //   changeType: "negative"
    // }
  ];
  return (
    <dl className="mx-auto grid grid-cols-1 gap-px bg-gray-900/5">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 bg-white py-4"
        >
          <dt className="text-sm leading-6 font-medium text-gray-500">
            {stat.name}
          </dt>
          {/* <dd
            className={clsx(
              stat.changeType === "negative"
                ? "text-rose-600"
                : "text-gray-700",
              "text-xs font-medium"
            )}
          >
            {stat.change}
          </dd> */}
          <dd className="w-full flex-none text-3xl leading-10 font-medium tracking-tight text-gray-900">
            {stat.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function PosStats({
  posStats
}: {
  posStats: MYSverseData["bandarData"]["MYS_POS_2"];
}) {
  if (!posStats) {
    return null;
  }
  const stats = [
    {
      name: "Level",
      value: <CountUp end={posStats.Level} />
    },
    {
      name: "Current XP",
      value: `${posStats.XP} / ${posStats.MaxXP}`
    },
    {
      name: "Packages delivered",
      value: posStats.Packages
    },
    {
      name: "Salary",
      value: posStats.Salary
    },
    {
      name: "Suspended",
      value: posStats.Suspended ? "Yes" : "No"
    }
  ];
  return (
    <dl className="mx-auto grid grid-cols-1 gap-px bg-gray-900/5">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 bg-white py-4"
        >
          <dt className="text-sm leading-6 font-medium text-gray-500">
            {stat.name}
          </dt>
          {/* <dd
            className={clsx(
              stat.changeType === "negative"
                ? "text-rose-600"
                : "text-gray-700",
              "text-xs font-medium"
            )}
          >
            {stat.change}
          </dd> */}
          <dd className="w-full flex-none text-3xl leading-10 font-medium tracking-tight text-gray-900">
            {stat.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function TaxiStats({
  taxiStats
}: {
  taxiStats: MYSverseData["bandarData"]["MYS_Taxi_2"];
}) {
  const stats = [
    {
      name: "Customers",
      value: taxiStats.Customer
    },
    {
      name: "Money",
      value: taxiStats.Money
    },
    {
      name: "Suspended",
      value: taxiStats.Suspended ? "Yes" : "No"
    }
  ];
  return (
    <dl className="mx-auto grid grid-cols-1 gap-px bg-gray-900/5">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 bg-white py-4"
        >
          <dt className="text-sm leading-6 font-medium text-gray-500">
            {stat.name}
          </dt>
          {/* <dd
            className={clsx(
              stat.changeType === "negative"
                ? "text-rose-600"
                : "text-gray-700",
              "text-xs font-medium"
            )}
          >
            {stat.change}
          </dd> */}
          <dd className="w-full flex-none text-3xl leading-10 font-medium tracking-tight text-gray-900">
            {stat.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function AgencyTimeStats({
  bandarData
}: {
  bandarData: MYSverseData["bandarData"];
}) {
  interface Stat {
    name: string;
    value: string;
  }

  const stats: Stat[] = [];

  if (bandarData.TimeOnPDRM) {
    stats.push({
      name: "Time on Police",
      value: humanizeDuration(bandarData.TimeOnPDRM * 1000, {
        units: ["h", "m", "s", "ms"],
        largest: 1,
        round: true
      })
    });
  }
  if (bandarData.TimeOnMAF) {
    stats.push({
      name: "Time on Military",
      value: humanizeDuration(bandarData.TimeOnMAF * 1000, {
        units: ["h", "m", "s", "ms"],
        largest: 1,
        round: true
      })
    });
  }
  if (bandarData.TimeOnMYT) {
    stats.push({
      name: "Time on Transit",
      value: humanizeDuration(bandarData.TimeOnMYT * 1000, {
        units: ["h", "m", "s", "ms"],
        largest: 1,
        round: true
      })
    });
  }
  return (
    <dl className="mx-auto grid grid-cols-1 gap-px bg-gray-900/5">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 bg-white py-4"
        >
          <dt className="text-sm leading-6 font-medium text-gray-500">
            {stat.name}
          </dt>
          {/* <dd
            className={clsx(
              stat.changeType === "negative"
                ? "text-rose-600"
                : "text-gray-700",
              "text-xs font-medium"
            )}
          >
            {stat.change}
          </dd> */}
          <dd className="w-full flex-none text-3xl leading-10 font-medium tracking-tight text-gray-900">
            {stat.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function BandarCars({
  cars
}: {
  cars: MYSverseData["bandarData"]["MYS_PermanentVehicles_2"];
}) {
  return (
    <>
      <ul role="list" className="grid grid-cols-2 sm:grid-cols-3">
        {cars
          .sort((a, b) => b.Time - a.Time)
          .map((car) => (
            <li key={car.VehicleName} className="flex gap-x-4 py-4">
              {/* <Image
              className="h-12 w-12 flex-none rounded-full bg-gray-50"
              src={person.imageUrl}
              alt=""
            /> */}
              <div className="min-w-0">
                <p className="text-base leading-6 font-semibold text-gray-900">
                  {car.VehicleName}
                </p>
                <p className="mt-1 truncate text-sm leading-5 text-gray-500">
                  {`Purchased ${new Date(
                    car.Time * 1000
                  ).toLocaleDateString()}`}
                </p>
              </div>
            </li>
          ))}
      </ul>
    </>
  );
}

function BandarStats({
  bandarData
}: {
  bandarData: MYSverseData["bandarData"];
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div className="rounded-lg bg-white px-6 py-6 shadow-sm">
        <header>
          <h3 className="mb-2 text-xl font-bold">General stats</h3>
        </header>
        <Stats bandarData={bandarData} />
      </div>

      {bandarData.MYS_POS_2 ? (
        <div className="rounded-lg bg-white px-5 py-6 shadow-sm sm:px-6">
          <header>
            <h3 className="mb-2 text-xl font-bold">POS stats</h3>
          </header>
          <PosStats posStats={bandarData.MYS_POS_2} />
        </div>
      ) : null}
      {bandarData.MYS_Taxi_2 ? (
        <div className="rounded-lg bg-white px-5 py-6 shadow-sm sm:px-6">
          <header>
            <h3 className="mb-2 text-xl font-bold">Taxi stats</h3>
          </header>
          <TaxiStats taxiStats={bandarData.MYS_Taxi_2} />
        </div>
      ) : null}
      {bandarData.TimeOnMAF || bandarData.TimeOnMYT || bandarData.TimeOnPDRM ? (
        <div className="rounded-lg bg-white px-6 py-6 shadow-sm">
          <header>
            <h3 className="mb-2 text-xl font-bold">Occupational stats</h3>
          </header>
          <AgencyTimeStats bandarData={bandarData} />
        </div>
      ) : null}
      {bandarData.MYS_PermanentVehicles_2.length > 0 ? (
        <div className="rounded-lg bg-white px-5 py-6 shadow-sm sm:col-span-2 sm:px-6">
          <header>
            <h3 className="mb-2 text-xl font-bold">Owned vehicles</h3>
          </header>
          <BandarCars cars={bandarData.MYS_PermanentVehicles_2} />
        </div>
      ) : null}
    </div>
  );
}

function Arrests({ arrests }: { arrests: MYSverseData["arrests"] }) {
  const statuses = {
    Served: "text-green-700 bg-green-50 ring-green-600/20",
    Ongoing: "text-gray-600 bg-gray-50 ring-gray-500/10",
    Issue: "text-red-700 bg-red-50 ring-red-600/10"
  };

  return arrests.length > 0 ? (
    <ul
      role="list"
      className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 md:grid-cols-3 xl:gap-x-8"
    >
      {arrests.map((arrest) => {
        const timeArrest = new Date(arrest.Time_Arrest);
        const timeRelease = new Date(arrest.Time_Release);
        const [x, , z] = arrest.Location_Arrest;
        return (
          <li
            key={arrest.Reference}
            className="overflow-hidden rounded-xl border border-gray-200"
          >
            <div className="flex items-center gap-x-4 border-b border-gray-900/5 bg-gray-50 px-6 py-4">
              {/* <img
              src={client.imageUrl}
              alt={client.name}
              className="h-12 w-12 flex-none rounded-lg bg-white object-cover ring-1 ring-gray-900/10"
            /> */}
              <div className="text-sm leading-6 font-medium text-gray-900">
                {arrest.Reference}
              </div>
              <div
                className={clsx(
                  statuses[arrest.Time_Release ? "Served" : "Ongoing"],
                  "rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset"
                )}
              >
                {arrest.Time_Release ? "Served" : "Ongoing"}
              </div>
            </div>

            <dl className="-my-3 divide-y divide-gray-100 px-6 py-4 text-sm leading-6">
              <div className="flex flex-col justify-between gap-x-4 py-3 lg:flex-row">
                <dt className="text-gray-500">Time arrested</dt>
                <dd className="text-gray-700">
                  <time dateTime={timeArrest.toLocaleString()}>
                    {timeArrest.toLocaleString()}
                  </time>
                </dd>
              </div>
              <div className="flex flex-col justify-between gap-x-4 py-3 lg:flex-row">
                <dt className="text-gray-500">Time released</dt>
                <dd className="text-gray-700">
                  <time dateTime={timeRelease.toLocaleString()}>
                    {timeRelease.toLocaleString()}
                  </time>
                </dd>
              </div>
              <div className="flex flex-col justify-between gap-x-4 py-3 lg:flex-row">
                <dt className="text-gray-500">Officer ID</dt>
                <dd className="text-gray-700">{arrest.Player_Arresting}</dd>
              </div>
              <div className="flex flex-col justify-between gap-x-4 py-3 lg:flex-row">
                <dt className="text-gray-500">Location</dt>
                <dd className="text-gray-700">
                  {arrest.StringLocation || `${x}°X, ${z}°Z`}
                </dd>
              </div>
              <div className="flex flex-col justify-between gap-x-4 pt-3 lg:flex-row">
                <dt className="text-gray-500">Reason</dt>
              </div>
            </dl>
            <div className="px-6 pb-6 text-sm text-gray-600">
              {arrest.Description || "N/A"}
            </div>
          </li>
        );
      })}
    </ul>
  ) : (
    <div className="italic opacity-80">
      No records to show. Congratulations for being a law-abiding citizen!
    </div>
  );
}

function Summons({ summons }: { summons: MYSverseData["summons"] }) {
  const statuses = {
    Paid: "text-green-700 bg-green-50 ring-green-600/20",
    Dispute: "text-red-700 bg-red-50 ring-red-600/10"
  };

  return summons.length > 0 ? (
    <ul
      role="list"
      className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 md:grid-cols-3 xl:gap-x-8"
    >
      {summons.map((summon) => {
        const timeOffence = new Date(summon.OffenceTime);
        return (
          <li
            key={summon.Reference}
            className="overflow-hidden rounded-xl border border-gray-200"
          >
            <div className="flex items-center gap-x-4 border-b border-gray-900/5 bg-gray-50 px-6 py-4">
              {/* <img
              src={client.imageUrl}
              alt={client.name}
              className="h-12 w-12 flex-none rounded-lg bg-white object-cover ring-1 ring-gray-900/10"
            /> */}
              <div className="text-sm leading-6 font-medium text-gray-900">
                {summon.Reference}
              </div>
              <div
                className={clsx(
                  statuses[summon.Dispute ? "Dispute" : "Paid"],
                  "rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset"
                )}
              >
                {summon.Dispute ? "Dispute" : "Paid"}
              </div>
            </div>

            <dl className="-my-3 divide-y divide-gray-100 px-6 py-4 text-sm leading-6">
              <div className="flex flex-col justify-between gap-x-4 py-3 lg:flex-row">
                <dt className="text-gray-500">Time</dt>
                <dd className="text-gray-700">
                  <time dateTime={timeOffence.toLocaleString()}>
                    {timeOffence.toLocaleString()}
                  </time>
                </dd>
              </div>
              <div className="flex flex-col justify-between gap-x-4 py-3 lg:flex-row">
                <dt className="text-gray-500">Amount</dt>
                <dd className="text-gray-700">
                  {`${summon.FineAmount.toFixed(2)}`}
                </dd>
              </div>
              <div className="flex flex-col justify-between gap-x-4 py-3 lg:flex-row">
                <dt className="text-gray-500">Officer ID</dt>
                <dd className="text-gray-700">{summon.Officer}</dd>
              </div>
              <div className="flex flex-col justify-between gap-x-4 pt-3 lg:flex-row">
                <dt className="text-gray-500">Description</dt>
              </div>
            </dl>
            <div className="px-6 pb-6 text-sm text-gray-600">
              {summon.OffenceDescription || "N/A"}
            </div>
          </li>
        );
      })}
    </ul>
  ) : (
    <div className="italic opacity-80">
      No records to show. Congratulations for being a law-abiding citizen!
    </div>
  );
}

export default function MysverseStats({ data }: { data: MYSverseData }) {
  return (
    <>
      <header>
        <h3 className="mb-10 text-center text-2xl font-bold text-slate-900">
          Bandaraya Insights
        </h3>
      </header>
      <DefaultTransitionLayout show={!!data} appear={true}>
        <BandarStats bandarData={data.bandarData} />
      </DefaultTransitionLayout>
      <div className="mt-8 rounded-lg bg-white px-5 py-6 shadow-sm sm:px-6">
        <header className="mb-6">
          <h3 className="mb-2 text-xl font-bold">Arrests</h3>
          <ul className="ml-4 flex list-disc flex-col gap-y-1">
            <li className="opacity-80">{`Arrests are made by (roleplay) law enforcement officers for breaking major in-game laws.`}</li>
            <li className="opacity-80">{`Players will be held inside a lock-up for a fixed time period, after which they are released and gameplay resumes.`}</li>
          </ul>
        </header>
        <Arrests arrests={data.arrests} />
      </div>

      <div className="mt-8 rounded-lg bg-white px-5 py-6 shadow-sm sm:px-6">
        <header className="mb-6">
          <h3 className="mb-2 text-xl font-bold">Summonses</h3>
          <ul className="ml-4 flex list-disc flex-col gap-y-1">
            <li className="opacity-80">{`A summons is issued by a (roleplay) law enforcement officer for breaking minor in-game laws.`}</li>
            <li className="opacity-80">{`The fine amount is typically deducted directly from the player's in-game bank account.`}</li>
          </ul>
        </header>
        <Summons summons={data.summons} />
      </div>
    </>
  );
}
