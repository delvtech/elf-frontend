import { formatEther } from "@ethersproject/units";
import { BigNumber } from "ethers";

export function formatEth(
  wei: BigNumber | undefined,
  defaultValue = 0
): string {
  const finalWei = wei !== undefined ? wei : defaultValue;

  const formatted = formatEther(finalWei);
  return formatted;
}
