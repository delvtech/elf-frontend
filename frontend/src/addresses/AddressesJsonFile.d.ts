export interface AddressesJsonFile {
  chainId: number;
  addresses: {
    balancerVaultAddress: string;
    trancheFactoryAddress: string;
    crv3cryptoAddress: string;
    weightedPoolFactoryAddress: string;
    convergentPoolFactoryAddress: string;
    userProxyContractAddress: string;
    wethAddress: string;
    wbtcAddress: string;
    daiAddress: string;
    usdcAddress: string;
    stecrvAddress: string;
    crvtricryptoAddress: string;
    "lusd3crv-fAddress": string;
    crvalusdAddress: string;
  };
  safelist: string[];
}
