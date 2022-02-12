export interface AddressesJsonFile {
  chainId: number;
  addresses: {
    balancerVaultAddress: string;
    trancheFactoryAddress: string;
    interestTokenFactoryAddress?: string;
    weightedPoolFactoryAddress: string;
    convergentPoolFactoryAddress: string;
    userProxyContractAddress: string;

    // tokens
    wbtcAddress: string;
    usdcAddress: string;
    usdtAddress: string;
    daiAddress: string;
    lusdAddress: string;
    "3crvAddress": string; // USDT - DAI - USDC
    usdtAddress: string;
    alusdAddress: string;
    mimAddress: string;
    wethAddress: string;
    ethAddress: string;
    stethAddress: string;
    eursAddress: string;
    seursAddress: string;
    "lusd3crv-fAddress": string;
    "alusd3crv-fAddress": string;
    "mim-3lp3crv-fAddress": string;
    crv3cryptoAddress: string;
    crvtricryptoAddress: string;
    stecrvAddress: string;
    eurscrvAddress: string;
  };
  safelist: string[];
}
