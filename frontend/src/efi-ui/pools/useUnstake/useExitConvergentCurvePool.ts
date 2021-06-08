import { useCallback } from "react";

import { ConvergentCurvePool } from "elf-contracts/types/ConvergentCurvePool";
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
import { useTokenDecimalsMulti } from "efi-ui/token/hooks/useTokenDecimalsMulti";
import { useSmartContractTransactionPersisted } from "efi-ui/transactions/useSmartContractTransactionPersisted/useSmartContractTransactionPersisted";
import ContractAddresses from "efi/addresses";
import { BALANCER_ETH_SENTINEL } from "efi/balancer";
import { getSmartContractFromRegistryMulti } from "efi/contracts/SmartContractsRegistry";
import { ContractMethodArgs } from "efi/contracts/types";
import { clipStringValueToDecimals } from "efi/base/math/fixedPoint";
import { calculateTokensOutForLPInFixed } from "efi/pools/calculateTokensOutForLPIn";

export function useExitConvergentCurvePool(
  signer: Signer | undefined,
  account: string | null | undefined,
  pool: ConvergentCurvePool | undefined,
  lpIn: string
): () => void {
  const balancerVault = useBalancerVault();
  const { data: poolId } = useSmartContractReadCall(pool, "getPoolId");
  const { data: [poolTokens = [], poolTokenReserves = []] = [] } =
    usePoolTokens(pool);
  const poolTokenContracts = getSmartContractFromRegistryMulti(
    poolTokens,
    ERC20__factory.connect
  );

  const poolTokenDecimalsResults = useTokenDecimalsMulti(poolTokenContracts);
  const poolTokenDecimals = getQueriesData(poolTokenDecimalsResults);

  const { data: totalSupply } = useSmartContractReadCall(pool, "totalSupply");

  const { mutate: exitPool } = useSmartContractTransactionPersisted(
    balancerVault,
    "exitPool",
    signer
  );

  const onExitPool = useCallback(() => {
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
  }, [
    account,
    exitPool,
    lpIn,
    poolId,
    poolTokenDecimals,
    poolTokenReserves,
    poolTokens,
    totalSupply,
  ]);

  return onExitPool;
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
