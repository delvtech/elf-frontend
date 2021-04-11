export async function fetchYearnAPYs(): Promise<YearnAPYResult[]> {
  const result = await fetch("https://dev-api.yearn.tools/vaults/apy");
  console.log("result", result);

  const resultJSON = (await result.json()) as YearnAPYResult[];

  return resultJSON;
}

export interface YearnAPYResult {
  apyOneMonthSample: number;
  symbol: string;
  timestamp: number;
  apyOneWeekSample: number;
  apyInceptionSample: number;
  address: string;
  name: string;
  vaultSymbol: string;
  boost: {
    gaugeBalance: number;
    workingBalance: number;
    maxBoost: number;
    gaugeTotal: number;
    vecrvTotal: number;
    minVecrv: number;
    boost: number;
    vecrvBalance: number;
    workingTotal: number;
  };
  apyOneDaySample: number;
  apyThreeDaySample: number;
  tokenAddress: string;
  description: string;
  apyLoanscan: number;
  poolApy: number;
}
