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
    stecrvAddress: string;
    crvtricryptoAddress: string;
    crvlusdAddress: string;
    crvalusdAddress: string;
  };
  safelist: string[];
}
