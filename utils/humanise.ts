import humanizeDuration from "humanize-duration";

export function humanise(seconds: number) {
  return humanizeDuration(seconds * 1000, {
    units: ["mo", "d", "h", "m", "s"],
    round: true,
    unitMeasures: {
      y: 31557600000,
      mo: 30 * 86400000,
      w: 604800000,
      d: 86400000,
      h: 3600000,
      m: 60000,
      s: 1000,
      ms: 1
    }
  });
}
