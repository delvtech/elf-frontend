export interface AddressesJsonFile {
  chainId: number;
  addresses: {
    balancerVaultAddress: string;
    trancheFactoryAddress: string;
    interestTokenFactoryAddress: string;
    weightedPoolFactoryAddress: string;
    convergentPoolFactoryAddress: string;
    userProxyContractAddress: string;
    wethAddress: string;
    daiAddress: string;
    usdcAddress: string;
    crvlusdAddress: string;
  };
  safelist: string[];
}
