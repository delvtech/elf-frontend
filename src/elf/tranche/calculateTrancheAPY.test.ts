import {
  ONE_WEEK_IN_MILLISECONDS,
  ONE_YEAR_IN_MILLISECONDS,
} from "elf/base/time";
import { calculateTrancheAPY } from "elf/tranche/calculateTrancheAPY";

test("it should calculate the tranche apy on a one year tranche", () => {
  const start = 0;
  const end = ONE_YEAR_IN_MILLISECONDS;
  // simple math: selling dollars for 98 cents, redeemable in one year = 2%.
  const apy = calculateTrancheAPY(0.98, start, end);
  expect(apy).toEqual(0.020000000000000018);
});

test("it should calculate the tranche apy on a 4 week tranche", () => {
  const start = 0;
  const end = ONE_WEEK_IN_MILLISECONDS * 4;
  const apy = calculateTrancheAPY(0.98, start, end);
  expect(apy).toEqual(0.26071428571428594);
});
