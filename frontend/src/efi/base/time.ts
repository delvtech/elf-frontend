import { formatDuration, intervalToDuration } from "date-fns";

export const ONE_MINUTE_IN_SECONDS = 60;
export const ONE_HOUR_IN_SECONDS = 60 * ONE_MINUTE_IN_SECONDS;
export const ONE_DAY_IN_SECONDS = 24 * ONE_HOUR_IN_SECONDS;
export const ONE_WEEK_IN_SECONDS = 7 * ONE_DAY_IN_SECONDS;
export const THIRTY_DAYS_IN_SECONDS = 30 * ONE_DAY_IN_SECONDS;
export const ONE_YEAR_IN_SECONDS = 365 * ONE_DAY_IN_SECONDS;

export const ONE_MINUTE_IN_MILLISECONDS = 1000 * ONE_MINUTE_IN_SECONDS;
export const ONE_HOUR_IN_MILLISECONDS = 60 * ONE_MINUTE_IN_MILLISECONDS;
export const ONE_DAY_IN_MILLISECONDS = 24 * ONE_HOUR_IN_MILLISECONDS;
export const ONE_WEEK_IN_MILLISECONDS = 7 * ONE_DAY_IN_MILLISECONDS;
export const ONE_YEAR_IN_MILLISECONDS = 365 * ONE_DAY_IN_MILLISECONDS;
export const THIRTY_DAYS_IN_MILLISECONDS = 30 * ONE_DAY_IN_MILLISECONDS;

/**
 * Helper function to get the [days, hours, minutes, seconds] of a time value.
 * @param {number} time time in milliseconds
 * @deprecated use getTimeLeft2 instead
 */
export function getTimeLeft(time: number): [number, number, number, number] {
  const days = Math.floor(time / ONE_DAY_IN_MILLISECONDS);
  const hours = Math.floor(time / ONE_HOUR_IN_MILLISECONDS);
  const minutes = Math.floor(time / ONE_MINUTE_IN_MILLISECONDS);
  const seconds = Math.floor(time / 1000);

  const hoursLeft = hours - days * 24;
  const minutesLeft = minutes - hours * 60;
  const secondsLeft = seconds - minutes * 60;
  return [days, hoursLeft, minutesLeft, secondsLeft];
}

export function getTimeLeft2(
  maturationDate: Date | undefined
): string | undefined {
  if (!maturationDate) {
    return;
  }

  const duration = intervalToDuration({
    start: Date.now(),
    end: maturationDate.getTime(),
  });

  return formatDuration(duration, {
    delimiter: ", ",
    format: ["years", "months", "days"],
  });
}
