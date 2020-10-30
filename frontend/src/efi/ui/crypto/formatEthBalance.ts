import { formatEther } from "@ethersproject/units";
import { BigNumber } from "ethers";

// Show eth in the format of xxxxxx.12345 place values after the decimal
export function formatEthBalance(ethBalance: BigNumber | number): string {
  const ethBalanceString = formatEther(ethBalance);
  const decimalIndex = ethBalanceString.indexOf(".");
  if (decimalIndex > -1) {
    return ethBalanceString.slice(0, decimalIndex + 5);
  }
  return ethBalanceString;
}
