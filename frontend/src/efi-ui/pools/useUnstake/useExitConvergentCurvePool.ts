import { useCallback } from "react";

import { ConvergentCurvePool } from "elf-contracts/types";
import { Vault } from "elf-contracts/types/Vault";
import { BigNumber, Signer } from "ethers";
import { defaultAbiCoder, formatUnits, parseUnits } from "ethers/lib/utils";
import { PrincipalPoolTokenInfo } from "tokenlists/types";

import { ExitRequest } from "efi-balancer/ExitRequest";
import { BALANCER_POOL_LP_TOKEN_DECIMALS } from "efi-balancer/pools";
import { useBalancerVault } from "efi-ui/balancer/useBalancerVault";
import { useSmartContractTransactionPersisted } from "efi-ui/transactions/useSmartContractTransactionPersisted/useSmartContractTransactionPersisted";
import ContractAddresses from "efi/addresses";
import { BALANCER_ETH_SENTINEL } from "efi/balancer";
import { clipStringValueToDecimals } from "efi/base/math/fixedPoint";
import { ContractMethodArgs } from "efi/contracts/types";
import { calculateTokensOutForLPInFixed } from "efi/pools/calculateTokensOutForLPIn";
import { getPoolContract } from "efi/pools/getPoolContract";
import { getTokenInfo } from "efi/tokenlists";

export function useExitConvergentCurvePool(
  signer: Signer | undefined,
  account: string | null | undefined,
  poolInfo: PrincipalPoolTokenInfo,
  lpIn: string,
  onTransactionSubmitted?: () => void
): {
  onExitPool: () => void;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  error: Error | undefined;
  reset: () => void;
} {
  const balancerVault = useBalancerVault();
  const { poolId } = poolInfo.extensions;
  const pool = getPoolContract(poolInfo.address) as ConvergentCurvePool;
  const {
    mutate: exitPool,
    isLoading,
    isError,
    isSuccess,
    reset,
    error,
  } = useSmartContractTransactionPersisted(balancerVault, "exitPool", signer, {
    onTransactionSubmitted,
  });

  const onExitPool = useCallback(async () => {
    // grab these right when we exit to try to get the latest values
    const totalSupply = await pool.totalSupply();
    const [poolTokens = [], poolTokenReserves = []] =
      await balancerVault.getPoolTokens(poolId);
    const poolTokenDecimals = poolTokens.map((tokenAddress) => {
      const { decimals } = getTokenInfo(tokenAddress);
      return decimals;
    });

    const exitPoolCallArgs = makeExitPoolCallArgs(
      poolId,
      account,
      poolTokens,
      poolTokenReserves,
      poolTokenDecimals,
      totalSupply,
      lpIn
    );
    if (!exitPoolCallArgs) {
      return;
    }
    exitPool(exitPoolCallArgs);
  }, [account, balancerVault, exitPool, lpIn, pool, poolId]);

  return {
    onExitPool,
    isLoading,
    isError,
    isSuccess,
    reset,
    error: error as Error | undefined,
  };
}

function makeExitPoolCallArgs(
  poolId: string | undefined,
  account: string | null | undefined,
  poolTokens: string[] | undefined,
  poolTokenReserves: BigNumber[] | undefined,
  poolTokenDecimals: (number | undefined)[],
  totalSupply: BigNumber | undefined,
  lpIn: string
): ContractMethodArgs<Vault, "exitPool"> | undefined {
  if (
    !poolId ||
    !account ||
    !poolTokens ||
    !poolTokenReserves ||
    !totalSupply
  ) {
    return;
  }

  const assets = poolTokens.map((poolToken) => {
    if (poolToken === ContractAddresses.wethAddress) {
      return BALANCER_ETH_SENTINEL;
    }
    return poolToken;
  });

  // ok to cast since all input defined above
  const poolTokenMinAmountsOut = getPoolTokenMinAmountsOut(
    lpIn,
    totalSupply,
    poolTokenReserves,
    poolTokenDecimals
  ) as BigNumber[];

  const userData = defaultAbiCoder.encode(
    ["uint256[]"],
    [poolTokenMinAmountsOut]
  );

  const exitRequest: ExitRequest = {
    toInternalBalance: false,
    assets,
    minAmountsOut: poolTokenMinAmountsOut,
    userData,
  };

  const callArgs: ContractMethodArgs<Vault, "exitPool"> = [
    poolId,
    account,
    account,
    exitRequest,
  ];

  return callArgs;
}

function getPoolTokenMinAmountsOut(
  lpIn: string,
  totalSupply: BigNumber,
  poolTokenReserves: BigNumber[],
  poolTokenDecimals: (number | undefined)[]
) {
  const totalSupplyString = formatUnits(
    totalSupply,
    BALANCER_POOL_LP_TOKEN_DECIMALS
  );

  const xReservesString = formatUnits(
    poolTokenReserves[0],
    poolTokenDecimals[0]
  );
  const yReservesString = formatUnits(
    poolTokenReserves[1],
    poolTokenDecimals[1]
  );

  // shave off a few decimals to alleviate rounding errors for convergent pools
  const clippedLpIn = clipStringValueToDecimals(
    lpIn,
    BALANCER_POOL_LP_TOKEN_DECIMALS - 4
  );

  const { xNeeded, yNeeded } = calculateTokensOutForLPInFixed(
    clippedLpIn,
    xReservesString,
    yReservesString,
    totalSupplyString,
    poolTokenDecimals[0]
  );

  if (!xNeeded || !yNeeded) {
    return undefined;
  }

  // because ConvergentCurvePool doesn't let you specify exact BPT in, rather you have to specify
  // min pool tokens out.  because of rounding errors in the contract itself, we can't calculate
  // the exact tokens out.  therefore we chop off the last two decimals and leave very fine dust.
  // like really fine. like more fine than playa dust.

  const adjustedDecimals = poolTokenDecimals.map((decimals) => {
    // this indicates we are loading, set to 18 and risk failing the exit
    if (!decimals) {
      return 18;
    }

    // for USDC and BTC only clip the last place
    if (decimals < 10) {
      return decimals - 1;
    }

    // for ten or higher, which will usually be 18, clip 2
    return decimals - 2;
  });

  const poolTokenMinAmountsOut = [
    parseUnits(
      clipStringValueToDecimals(xNeeded, adjustedDecimals[0] ?? 0) || "0",
      poolTokenDecimals[0]
    ),
    parseUnits(
      clipStringValueToDecimals(yNeeded, adjustedDecimals[1] ?? 0) || "0",
      poolTokenDecimals[1]
    ),
  ];

  return poolTokenMinAmountsOut;
}
