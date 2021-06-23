export function convertEpochSecondsToDate2(seconds: number): Date {
  const epochMilliseconds = seconds * 1000;
  return new Date(epochMilliseconds);
}
