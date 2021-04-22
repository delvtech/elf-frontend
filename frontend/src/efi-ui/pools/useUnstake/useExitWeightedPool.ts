import { useCallback } from "react";

import { ERC20__factory } from "elf-contracts/types/factories/ERC20__factory";
import { Vault } from "elf-contracts/types/Vault";
import { BigNumber, Signer } from "ethers";
import { defaultAbiCoder, formatUnits, parseUnits } from "ethers/lib/utils";

import { ExitRequest } from "efi-balancer/ExitRequest";
import { BALANCER_POOL_LP_TOKEN_DECIMALS } from "efi-balancer/pools";
import { useBalancerVault } from "efi-ui/balancer/useBalancerVault";
import { getQueriesData } from "efi-ui/base/queryResults";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { usePoolTokens } from "efi-ui/pools/usePoolTokens/usePoolTokens";
import { useTokenBalanceOf } from "efi-ui/token/hooks/useTokenBalanceOf";
import { useTokenDecimalsMulti } from "efi-ui/token/hooks/useTokenDecimalsMulti";
import { useSmartContractTransactionPersisted } from "efi-ui/transactions/useSmartContractTransactionPersisted/useSmartContractTransactionPersisted";
import { BALANCER_ETH_SENTINEL } from "efi/balancer";
import ContractAddresses from "efi/contracts/contractsJson";
import { ContractMethodArgs } from "efi/contracts/types";
import { calculateTokensOutForLPInFixed } from "efi/pools/calculateTokensOutForLPIn";
import { getSmartContractFromRegistryMulti } from "efi-ui/contracts/SmartContractsRegistry";
import { WeightedPool } from "elf-contracts/types/WeightedPool";
import { WeightedPoolExitKind } from "efi/pools/weightedPool";

export function useExitWeightedPool(
  signer: Signer | undefined,
  account: string | null | undefined,
  pool: WeightedPool | undefined
): () => void {
  const balancerVault = useBalancerVault();
  const { data: poolId } = useSmartContractReadCall(pool, "getPoolId");
  const {
    data: [poolTokens = [], poolTokenReserves = []] = [],
  } = usePoolTokens(pool);
  const poolTokenContracts = getSmartContractFromRegistryMulti(
    poolTokens,
    ERC20__factory.connect
  );

  const poolTokenDecimalsResults = useTokenDecimalsMulti(poolTokenContracts);
  const poolTokenDecimals = getQueriesData(poolTokenDecimalsResults);

  const { data: totalSupply } = useSmartContractReadCall(pool, "totalSupply");
  const { data: lpBalanceOf } = useTokenBalanceOf(pool, account);

  const { mutate: exitPool } = useSmartContractTransactionPersisted(
    balancerVault,
    "exitPool",
    signer
  );

  const exitPoolCallArgs = makeExitPoolCallArgs(
    poolId,
    account,
    poolTokens,
    poolTokenReserves,
    poolTokenDecimals,
    totalSupply,
    lpBalanceOf
  );
  const onExitPool = useCallback(() => {
    if (!exitPoolCallArgs) {
      return;
    }
    exitPool(exitPoolCallArgs);
  }, [exitPool, exitPoolCallArgs]);

  return onExitPool;
}

function makeExitPoolCallArgs(
  poolId: string | undefined,
  account: string | null | undefined,
  poolTokens: string[] | undefined,
  poolTokenReserves: BigNumber[] | undefined,
  poolTokenDecimals: (number | undefined)[],
  totalSupply: BigNumber | undefined,
  lpBalanceOf: BigNumber | undefined
): ContractMethodArgs<Vault, "exitPool"> | undefined {
  if (
    !poolId ||
    !account ||
    !poolTokens ||
    !poolTokenReserves ||
    !lpBalanceOf ||
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
    lpBalanceOf,
    totalSupply,
    poolTokenReserves,
    poolTokenDecimals
  ) as BigNumber[];

  // weighted pools take a exit kind and amount of bpt token in the user dataV
  const userData = defaultAbiCoder.encode(
    ["uint8", "uint256"],
    [WeightedPoolExitKind.EXACT_BPT_IN_FOR_TOKENS_OUT, lpBalanceOf]
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
  lpBalanceOf: BigNumber,
  totalSupply: BigNumber,
  poolTokenReserves: BigNumber[],
  poolTokenDecimals: (number | undefined)[]
) {
  const lpIn = formatUnits(lpBalanceOf, BALANCER_POOL_LP_TOKEN_DECIMALS);
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
