class DateUtils {
  private static daysInMonth: number[] = [
    31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31
  ];

  private static isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  private static getDayOfYear(
    day: number,
    month: number,
    year: number
  ): number {
    if (DateUtils.isLeapYear(year)) {
      DateUtils.daysInMonth[1] = 29;
    } else {
      DateUtils.daysInMonth[1] = 28;
    }

    let dayOfYear = day;
    for (let i = 0; i < month - 1; i++) {
      dayOfYear += DateUtils.daysInMonth[i];
    }
    return dayOfYear;
  }

  public static getCurrentWeekInfo(): {
    weekNumber: number;
    startDate: Date;
    endDate: Date;
  } {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const dayOfYear = DateUtils.getDayOfYear(
      currentDate.getDate(),
      currentDate.getMonth() + 1,
      currentYear
    );

    const weekNumber = Math.ceil(dayOfYear / 7);

    // Calculate the start and end dates of the current week
    const startDate = new Date(currentDate);
    startDate.setDate(
      currentDate.getDate() -
        currentDate.getDay() +
        (currentDate.getDay() === 0 ? -6 : 1)
    );

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    return {
      weekNumber,
      startDate,
      endDate
    };
  }
}

export default DateUtils;
