import { InvoteSeats, InvoteStatsTimestamp } from "components/swr";

export function getColourByName(name: string | null) {
  switch (name) {
    case "PDM":
      return "#12447E";
    case "PAM":
      return "#000000";
    case "PTA":
      return "#0000AD";
    case "BRM":
      return "#FF1414";
    case "PPR":
      return "#d4d42b";
    case "OC/PP":
      return "#8f00ff";
    case "GR":
      return "#1A1F60";
    case "AKRAM":
      return "#f25c27";
    default:
      return "gray";
  }
}

export function getProgressiveGrayColour(index: number, total: number) {
  return `rgba(0, 0, 0, ${((total - index) / total) * 0.4 + 0.2})`;
}

export function frequencySort(arr: string[]) {
  const countOccurrences = (arr: string[], val: string) =>
    arr.reduce((a, v) => (v === val ? a + 1 : a), 0);
  interface arrayCount {
    [key: string]: {
      num: number;
      i: number;
    };
  }
  const d: arrayCount = {};
  arr = JSON.parse(JSON.stringify(arr));
  arr.forEach(
    (i, index) =>
      (d[i] = {
        num: countOccurrences(arr, i),
        i: index
      })
  );
  arr.sort(function (a, b) {
    let diff = d[b].num - d[a].num;
    if (diff == 0) diff = d[b].i - d[a].i;
    return diff;
  });

  return arr;
}

export function getSeatHolders(seatData?: InvoteSeats[], ignoreEmpty = false) {
  const seatsArray = new Array<string | null>(30).fill(null);
  if (seatData) {
    // Assuming 30 seats, make sure to insert parties into the array at the correct index, and fill null if empty
    seatData.forEach((seat) => {
      if (seat.index > 0 && seat.index <= 30) {
        seatsArray[seat.index - 1] = seat.party;
      }
    });
  }
  if (ignoreEmpty) {
    return seatsArray.filter((item) => item !== null);
  }
  return seatsArray;
}

interface StatNumber {
  [key: string]: number;
}

export function calculateSeats(stats: StatNumber) {
  const ignoreKeys = ["ROSAK"];
  const seats = 30;

  // Without ROSAK
  const filtered = Object.keys(stats)
    .filter((key) => !ignoreKeys.includes(key))
    .reduce((obj: StatNumber, key) => {
      obj[key] = stats[key];
      return obj;
    }, {});

  const totalValidVotes = Object.values(filtered).reduce((a, b) => a + b, 0);

  // Parties with above 10% of the vote
  const filtered2 = Object.keys(filtered)
    .filter((key) => filtered[key] / totalValidVotes > 0.1)
    .reduce((obj: StatNumber, key) => {
      obj[key] = filtered[key];
      return obj;
    }, {});

  const totalValidPartyVotes = Object.values(filtered2).reduce(
    (a, b) => a + b,
    0
  );

  return Object.keys(filtered2).reduce((obj: StatNumber, key) => {
    const votes = filtered2[key];
    obj[key] = Math.floor((votes / totalValidPartyVotes) * seats + 0.5);
    // obj[key] = filtered2[key];
    return obj;
  }, {});
}

export function getStatsObject(stats: InvoteStatsTimestamp[]) {
  const newData: StatNumber = {};
  for (const item of stats) {
    const data = item.results.data;
    for (const party of data) {
      if (newData[party.name]) {
        newData[party.name] += party.votes;
      } else {
        newData[party.name] = party.votes;
      }
    }
  }
  return newData;
}

export function getSeatColours(
  stats: InvoteStatsTimestamp[],
  seatStats: InvoteSeats[],
  ignoreEmpty = false
) {
  if (!stats && !seatStats) return null;

  // Hidden calculations start

  const hidden = stats.some((item) => item.results.hidden);

  const statsObject = getStatsObject(stats);

  const projectedSeats = calculateSeats(statsObject);

  const projectedSeatHolders = [];

  for (const key in projectedSeats) {
    const value = projectedSeats[key];
    for (let i = 0; i < value; i++) {
      projectedSeatHolders.push(key);
    }
  }

  const statsCount = Object.keys(projectedSeats).map((key) => ({
    name: key,
    stat: statsObject[key]
  }));

  const partyColours = statsCount.map((item, index) => ({
    colour: getProgressiveGrayColour(index, statsCount.length),
    ...item
  }));

  const hiddenSeatColours = projectedSeatHolders.map(
    (item) =>
      partyColours.find((party) => party.name === item)?.colour || "silver"
  );

  if (hidden) {
    return hiddenSeatColours;
  }

  // Hidden calculations end

  const seatHolders = getSeatHolders(seatStats, ignoreEmpty);

  const seatColours = seatHolders.map((item) => getColourByName(item));

  return seatColours;
}

export function getSeatParties(
  stats: InvoteStatsTimestamp[],
  seatStats: InvoteSeats[]
) {
  if (!stats && !seatStats) return null;

  // const statsObject = getStatsObject(stats);

  const seatHolders = getSeatHolders(seatStats);

  // if hidden

  // const hidden = stats.some((item) => item.results.hidden);

  // const projectedSeats = calculateSeats(statsObject);

  // const projectedSeatHolders = [];

  // for (const key in projectedSeats) {
  //   const value = projectedSeats[key];
  //   for (let i = 0; i < value; i++) {
  //     projectedSeatHolders.push(key);
  //   }
  // }

  // const hiddenSeatParties = projectedSeatHolders;

  // if (hidden) {
  //   return hiddenSeatParties;
  // }

  return seatHolders;
}
