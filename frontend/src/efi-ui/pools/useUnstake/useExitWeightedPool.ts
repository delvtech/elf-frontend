import { useCallback } from "react";
import { UseMutationResult } from "react-query";

import { Vault } from "elf-contracts/types/Vault";
import { WeightedPool } from "elf-contracts/types/WeightedPool";
import { BigNumber, ContractReceipt, Signer } from "ethers";
import { defaultAbiCoder, formatUnits, parseUnits } from "ethers/lib/utils";

import { ExitRequest } from "efi-balancer/ExitRequest";
import { BALANCER_POOL_LP_TOKEN_DECIMALS } from "efi-balancer/pools";
import { useBalancerVault } from "efi-ui/balancer/useBalancerVault";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { usePoolTokens } from "efi-ui/pools/usePoolTokens/usePoolTokens";
import { useSmartContractTransactionPersisted } from "efi-ui/transactions/useSmartContractTransactionPersisted/useSmartContractTransactionPersisted";
import ContractAddresses from "efi/addresses";
import { BALANCER_ETH_SENTINEL } from "efi/balancer";
import { ContractMethodArgs } from "efi/contracts/types";
import { calculateTokensOutForLPInFixed } from "efi/pools/calculateTokensOutForLPIn";
import { WeightedPoolExitKind } from "efi/pools/weightedPool";
import { getTokenInfo } from "efi/tokenlists";

export function useExitWeightedPool(
  signer: Signer | undefined,
  account: string | null | undefined,
  pool: WeightedPool | undefined,
  lpIn: string,
  onTransactionSubmitted?: () => void
): {
  mutationResult: UseMutationResult<
    ContractReceipt | undefined,
    unknown,
    ContractMethodArgs<Vault, "exitPool">
  >;
  onExitPool: () => void;
} {
  const balancerVault = useBalancerVault();
  const { data: poolId } = useSmartContractReadCall(pool, "getPoolId");
  const { data: [poolTokens = [], poolTokenReserves = []] = [] } =
    usePoolTokens(pool);

  const poolTokenDecimals = poolTokens.map((tokenAddress) => {
    const { decimals } = getTokenInfo(tokenAddress);
    return decimals;
  });

  const { data: totalSupply } = useSmartContractReadCall(pool, "totalSupply");

  const mutationResult = useSmartContractTransactionPersisted(
    balancerVault,
    "exitPool",
    signer,
    {
      onTransactionSubmitted,
    }
  );

  const { mutate: exitPool } = mutationResult;

  const exitPoolCallArgs = makeExitPoolCallArgs(
    poolId,
    account,
    poolTokens,
    poolTokenReserves,
    poolTokenDecimals,
    totalSupply,
    lpIn
  );
  const onExitPool = useCallback(() => {
    if (!exitPoolCallArgs) {
      return;
    }
    exitPool(exitPoolCallArgs);
  }, [exitPool, exitPoolCallArgs]);

  return {
    mutationResult,
    onExitPool,
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

  // ok to cast since all inputs are checked above
  // TODO: see if we can remove this, this is uses logic for exiting from a CCPool
  const poolTokenMinAmountsOut = getPoolTokenMinAmountsOut(
    lpIn,
    totalSupply,
    poolTokenReserves,
    poolTokenDecimals
  ) as BigNumber[];

  const lpInBN = parseUnits(lpIn || "0", BALANCER_POOL_LP_TOKEN_DECIMALS);

  // weighted pools take a exit kind and amount of bpt token in the user data
  const userData = defaultAbiCoder.encode(
    ["uint8", "uint256"],
    [WeightedPoolExitKind.EXACT_BPT_IN_FOR_TOKENS_OUT, lpInBN]
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

// TODO: see if we can remove this, this is uses logic for exiting from a CCPool
function getPoolTokenMinAmountsOut(
  lpIn: string,
  totalSupply: BigNumber,
  poolTokenReserves: BigNumber[],
  poolTokenDecimals: (number | undefined)[]
) {
  if (!poolTokenReserves.length) {
    return undefined;
  }

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

  const { xNeeded, yNeeded } = calculateTokensOutForLPInFixed(
    lpIn,
    xReservesString,
    yReservesString,
    totalSupplyString,
    poolTokenDecimals[0]
  );

  if (!xNeeded || !yNeeded) {
    return undefined;
  }

  const poolTokenMinAmountsOut = [
    parseUnits(xNeeded, poolTokenDecimals[0]),
    parseUnits(yNeeded, poolTokenDecimals[1]),
  ];
  return poolTokenMinAmountsOut;
}
