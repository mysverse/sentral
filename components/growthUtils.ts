import { ChartData, ScriptableLineSegmentContext } from "chart.js";
import { DateGrowthEntry, GrowthEntry } from "./apiTypes";

import {
  addDays,
  format,
  getISOWeek,
  getISOWeekYear,
  isAfter,
  isBefore,
  isSameDay,
  parse
} from "date-fns";

interface MonthItem {
  date: Date;
  year: number;
  month: number;
  members: number;
  previousMonthGrowth?: number;
  currentMonthGrowth?: number;
}

// thanks! https://www.trysmudford.com/blog/linear-interpolation-functions/
const lerp = (x: number, y: number, a: number) => x * (1 - a) + y * a;

export default class GrowthUtils {
  data: DateGrowthEntry[];
  interpolatedData: DateGrowthEntry[];
  stringDateData: GrowthEntry[];
  cachedDefaultChartData?: any[];
  monthData: MonthItem[];

  constructor(data: GrowthEntry[]) {
    this.stringDateData = data;
    this.data = data.map((item) => [new Date(item[0]), item[1], item[2]]);
    this.interpolatedData = this.fillInMissingDates();
    this.monthData = this.getMonthData();
  }

  isInterpolated(date: Date) {
    const stringDate = date.toISOString().substring(0, 10);
    return this.stringDateData.some((value) =>
      stringDate === value[0] ? value[2] === true : false
    );
  }

  getRepresentativeDataset(data: DateGrowthEntry[], type = "month") {
    interface DisplayCandidate {
      key: string;
      data: DateGrowthEntry[];
    }

    const candidates: DisplayCandidate[] = [];

    for (const item of data) {
      const date = item[0];
      let key: string | undefined = undefined;

      if (type === "month") {
        key = date.toISOString().substring(0, 7);
      } else if (type === "week") {
        // const date = new Date(dateString);
        const year = getISOWeekYear(date);
        const week = getISOWeek(date);
        key = `${year}-${week}`;
      }

      if (key) {
        const index = candidates.findIndex((item) => item.key === key);
        if (index !== -1) {
          candidates[index].data.push(item);
        } else {
          candidates.push({
            key: key,
            data: [item]
          });
        }
      }
    }

    return candidates
      .map((item) => this.getRepresentativeEntry(item.data))
      .filter((item) => item !== null);
  }

  getRepresentativeEntry(dataset: DateGrowthEntry[]) {
    let backup: DateGrowthEntry | null = null;
    for (const data of dataset) {
      if (!data[2]) {
        return data;
      } else {
        backup = data;
      }
    }
    return backup ? backup : null;
  }

  getLineChartData(displayOption: string) {
    const skipped = (ctx: ScriptableLineSegmentContext, value: any) =>
      ctx.p0.skip || ctx.p1.skip ? value : undefined;
    const down = (ctx: ScriptableLineSegmentContext, value: any) =>
      ctx.p0.parsed.y > ctx.p1.parsed.y ? value : undefined;

    const lineChartData: ChartData<"line", number[], number> = {
      labels: [],
      datasets: [
        {
          label: "Member count",
          borderColor: "rgb(3, 105, 161)",
          segment: {
            borderColor: (ctx) =>
              skipped(ctx, "rgb(0,0,0,0.2)") || down(ctx, "rgb(192,75,75)"),
            borderDash: (ctx) => skipped(ctx, [6, 6])
          },
          spanGaps: true,
          data: []
        }
      ]
    };

    const data = this.interpolatedData;

    if (lineChartData.labels) {
      switch (displayOption) {
        case "weeks":
          for (const candidate of this.getRepresentativeDataset(data, "week")) {
            if (candidate) {
              const timestampDate = candidate[0];
              lineChartData.labels.push(timestampDate.getTime());
              lineChartData.datasets[0].data.push(
                candidate[2] ? NaN : candidate[1]
              );
            }
          }
          break;
        case "months":
          for (const candidate of this.getRepresentativeDataset(
            data,
            "month"
          )) {
            if (candidate) {
              const timestampDate = candidate[0];
              lineChartData.labels.push(timestampDate.getTime());
              lineChartData.datasets[0].data.push(
                candidate[2] ? NaN : candidate[1]
              );
            }
          }
          break;
        default: {
          const removeSuffixes = (string: string) => {
            const suffixes = ["-D", "-W", "-M"];
            for (const suffix of suffixes) {
              string = string.replace(suffix, "");
            }
            return string;
          };

          const filteredData = data.filter((date) =>
            date[0]
              .toISOString()
              .substring(0, 10)
              .includes(removeSuffixes(displayOption))
          );

          const useMonths = displayOption.includes("-M");
          const useWeeks = displayOption.includes("-W");
          const useDays = displayOption.includes("-D");

          if (useMonths || useWeeks) {
            for (const candidate of this.getRepresentativeDataset(
              filteredData,
              useMonths ? "month" : "week"
            )) {
              if (candidate) {
                const timestampDate = candidate[0];
                lineChartData.labels.push(timestampDate.getTime());
                lineChartData.datasets[0].data.push(
                  candidate[2] ? NaN : candidate[1]
                );
              }
            }
          } else if (useDays) {
            for (const [
              isoTimestamp,
              memberCount,
              interpolated
            ] of filteredData) {
              const timestampDate = isoTimestamp;
              lineChartData.labels.push(timestampDate.getTime());
              lineChartData.datasets[0].data.push(
                interpolated ? NaN : memberCount
              );
            }
          }
          break;
        }
      }
    }

    return lineChartData;
  }

  getMembersForDate(inputDate: Date) {
    type memberResult = [number, boolean];
    const dateMembersArray = this.data;
    for (const [compareDate, members] of dateMembersArray) {
      if (inputDate.getTime() === compareDate.getTime()) {
        return [members as number, false] as memberResult;
      }
    }
    // interpolate between next and last date;
    const nextKnownDate = dateMembersArray.find(([date]) =>
      isBefore(inputDate, date)
    );
    const previousKnownDate = dateMembersArray
      .slice()
      .reverse()
      .find(([date]) => isAfter(inputDate, date));
    if (nextKnownDate && previousKnownDate) {
      const [nDate, nMembers] = nextKnownDate;
      const [pDate, pMembers] = previousKnownDate;

      const nextTimestamp = nDate.getTime();
      const prevTimestamp = pDate.getTime();
      const progression =
        Math.abs(inputDate.getTime() - prevTimestamp) /
        Math.abs(nextTimestamp - prevTimestamp);
      const lerpMembers = Math.floor(lerp(pMembers, nMembers, progression));
      return [lerpMembers, true] as memberResult;
    }
    return [0, true] as memberResult;
  }

  fillInMissingDates() {
    const dateMembersArray = this.data;
    const [firstDate] = dateMembersArray[0];
    const [lastDate] = dateMembersArray[dateMembersArray.length - 1];
    const dateArray = [] as DateGrowthEntry[];
    let currentDate = firstDate;
    const stopDate = lastDate;
    while (
      isSameDay(currentDate, stopDate) ||
      isBefore(currentDate, stopDate)
    ) {
      const [members, interpolated] = this.getMembersForDate(currentDate);
      dateArray.push([currentDate, members, interpolated]);
      currentDate = addDays(currentDate, 1);
    }
    return dateArray;
  }

  getMonthData() {
    const monthData = [] as MonthItem[];

    let lastMonth: number | undefined;

    for (const entry of this.interpolatedData) {
      const [isoTimestamp, memberCount] = entry;

      const thisMonth = isoTimestamp.getMonth();
      const thisYear = isoTimestamp.getFullYear();

      if (typeof lastMonth === "undefined" || lastMonth !== thisMonth) {
        lastMonth = thisMonth;
        monthData.push({
          date: isoTimestamp,
          year: thisYear,
          month: thisMonth,
          members: memberCount
        });
      }
    }

    return monthData.map((currentMonth, index) => {
      const previousMonth = monthData[index - 1];
      const nextMonth = monthData[index + 1];
      if (previousMonth) {
        currentMonth.previousMonthGrowth =
          currentMonth.members - previousMonth.members;
      }
      if (nextMonth) {
        currentMonth.currentMonthGrowth =
          nextMonth.members - currentMonth.members;
      }
      return currentMonth;
    });
  }

  get3MonthsGrowth() {
    const monthData = this.getMonthData();
    const data = monthData.slice().reverse();
    let currentSum = 0;
    let previousSum = 0;
    let counter = 0;
    const interpolations: boolean[] = [];

    for (const item of data) {
      if (item.previousMonthGrowth) {
        const interpolated = this.isInterpolated(item.date);
        if (counter <= 3) {
          currentSum += item.previousMonthGrowth;
          interpolations.push(interpolated);
        } else if (counter <= 6) {
          previousSum += item.previousMonthGrowth;
          interpolations.push(interpolated);
        }
        counter++;
      }
    }

    const interpolated = interpolations.some((value) => value === true);
    return {
      current: currentSum,
      previous: previousSum,
      interpolated: interpolated
    };
  }

  getLastMonthGrowth() {
    const monthData = this.getMonthData();
    const data = monthData.slice().reverse();
    const currentSum = data[0].previousMonthGrowth || 0;
    const previousSum = data[1].previousMonthGrowth || 0;

    return {
      current: currentSum,
      previous: previousSum,
      interpolated:
        this.isInterpolated(data[0].date) || this.isInterpolated(data[1].date)
    };
  }

  dateCount(date: string) {
    let count = 0;
    for (const item of this.stringDateData) {
      if (item[0].substring(0, 10).includes(date)) {
        count++;
      }
    }
    return count;
  }

  getDisplayOptionsArray() {
    const set = new Set<string>();

    for (const item of this.stringDateData) {
      const isoString = item[0];
      const month = isoString.substring(0, 7);
      const year = month.substring(0, 4);
      set.add(year);
      set.add(month);
    }

    const array = [];
    for (const date of Array.from(set)) {
      const isYear = date.length === 4;
      const isMonth = date.length > 4;

      const parsed = isMonth
        ? parse(date, "yyyy-MM", new Date())
        : parse(date, "yyyy", new Date());

      if (isYear) {
        array.push({
          name: `${date} (monthly)`,
          value: `${date}-M`,
          valid: this.dateCount(date) > 7
        });
        array.push({
          name: `${date} (weekly)`,
          value: `${date}-W`,
          valid: this.dateCount(date) > 7
        });
      } else if (isMonth) {
        array.push({
          name: `${format(parsed, "yyyy > MMMM")} (weekly)`,
          value: `${date}-W`,
          valid: this.dateCount(date) > 7
        });
        array.push({
          name: `${format(parsed, "yyyy > MMMM")} (daily)`,
          value: `${date}-D`,
          valid: this.dateCount(date) > 7
        });
      }
    }
    return array;
  }

  getLastDayGrowth() {
    const interpolatedData = this.interpolatedData;
    const data = interpolatedData.slice().reverse();
    const currentSum = data[0][1] - data[1][1];
    const previousSum = data[1][1] - data[2][1];
    return {
      current: currentSum,
      previous: previousSum,
      interpolated:
        this.isInterpolated(data[0][0]) || this.isInterpolated(data[1][0])
    };
  }

  get7DaysGrowth() {
    const interpolatedData = this.interpolatedData;
    const data = interpolatedData.slice().reverse();
    let currentSum = 0;
    let previousSum = 0;
    const interpolations: boolean[] = [];
    for (let i = 0; i < 14; i++) {
      const currentDay = data[i];
      const previousDay = data[i + 1];
      if (currentDay && previousDay) {
        const dailyGrowth = currentDay[1] - previousDay[1];
        interpolations.push(this.isInterpolated(currentDay[0]));
        interpolations.push(this.isInterpolated(previousDay[0]));
        if (i < 7) {
          currentSum += dailyGrowth;
        } else {
          previousSum += dailyGrowth;
        }
      }
    }
    const interpolated = interpolations.some((value) => value === true);
    return {
      current: currentSum,
      previous: previousSum,
      interpolated: interpolated
    };
  }

  getHighestGrowthMonth() {
    const monthData = this.getMonthData();
    return monthData.reduce((prev, current) =>
      (prev.currentMonthGrowth || 0) > (current.currentMonthGrowth || 0)
        ? prev
        : current
    );
  }

  getHighestRelativeGrowthMonth() {
    const monthData = this.getMonthData();
    return monthData.reduce((prev, current) => {
      return (prev.currentMonthGrowth || 0) / prev.members >
        (current.currentMonthGrowth || 0) / current.members
        ? prev
        : current;
    });
  }
}
