export async function fetchYearnVaults(): Promise<YearnVaultResult[]> {
  const result = await fetch("https://vaults.finance/all");

  const resultJSON = (await result.json()) as YearnVaultResult[];

  return resultJSON;
}

export interface YearnVaultResult {
  inception: number;
  icon: string;
  symbol: string;
  apy: {
    description: string;
    type: string;
    data: {
      grossApy: number;
      managementFee: number;
      oneWeekSample: number;
      oneMonthSample: number;
      netApy: number;
      performanceFee: number;
    };
    composite: boolean;
    recommended: number;
  };
  address: string;
  endorsed: boolean;
  strategies: {
    name: string;
    address: string;
  }[];
  tvl: {
    totalAssets: number;
    value: string;
    price: number;
  };
  apiVersion: string;
  name: string;
  displayName: string;
  updated: number;
  fees: {
    special: Record<string, number>;
    general: {
      managementFee: number;
      performanceFee: number;
    };
  };
  token: {
    name: string;
    icon: string;
    symbol: string;
    address: string;
    displayName: string;
    decimals: number;
  };
  decimals: number;
  emergencyShutdown: boolean;
  tags: string[];
  type: string;
}
