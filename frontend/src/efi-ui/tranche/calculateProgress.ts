import { scaleLinear } from "@visx/scale";

export function calculateProgress(
  createdAtDate: Date | undefined,
  unlockDate: Date | undefined
): number {
  if (!createdAtDate || !unlockDate) {
    return 0;
  }

  const endTime = unlockDate.getTime();
  const startTime = createdAtDate.getTime();

  // bind progress value between 0 and 1
  const currentTime = Date.now();
  const progressScale = scaleLinear<number>()
    .domain([startTime, endTime])
    .range([0, 1])
    .clamp(true); // clamp to range when input out of range

  const progressValue = progressScale(currentTime);
  return progressValue;
}
