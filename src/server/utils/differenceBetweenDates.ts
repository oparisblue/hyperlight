const DATE_DIVISORS = [
  ["year", 1000 * 60 * 60 * 24 * 365],
  ["month", 1000 * 60 * 60 * 24 * 30],
  ["week", 1000 * 60 * 60 * 24 * 7],
  ["day", 1000 * 60 * 60 * 24],
  ["hour", 1000 * 60 * 60],
  ["minute", 1000 * 60],
  ["second", 1000],
] as const;

export function differenceBetweenDates(a: Date, b: Date): string {
  let result = [];
  let remainingDifference = Math.abs(b.getTime() - a.getTime());

  for (const [unit, divisor] of DATE_DIVISORS) {
    const quotient = Math.floor(remainingDifference / divisor);
    const remainder = remainingDifference % divisor;

    if (quotient > 0) {
      result.push(`${quotient} ${unit}${quotient !== 1 ? "s" : ""}`);
      remainingDifference = remainder;
    }
  }

  if (result.length === 0) {
    return `${remainingDifference} ms`;
  }

  return result.join(", ");
}
