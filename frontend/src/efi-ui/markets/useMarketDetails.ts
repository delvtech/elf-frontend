import { QueryObserverResult } from "react-query";

import { BPool } from "elf-contracts/types/BPool";
import { t } from "ttag";

import { useERC20Contract } from "efi-ui/contracts/useERC20Contract/useERC20Contract";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { getQueryCombinedSuccessState } from "efi-ui/query/getQueryCombinedSuccessState";
import { ONE_WEEK_IN_MILLISECONDS } from "efi/base/time";
import { formatEth } from "efi/coins/ether/formatEth";
import { Market } from "efi/markets/Market";

/**
 * returns details about a market.
 * @param { BPool } marketContract
 */
export function useMarketDetails(
  marketContract: BPool | undefined
): [Market | undefined, QueryObserverResult[]] {
  const marketAddress = marketContract?.address;

  const nameResult = useSmartContractReadCall(marketContract, "name");
  const totalSupplyResult = useSmartContractReadCall(
    marketContract,
    "totalSupply"
  );
  const tokensResult = useSmartContractReadCall(
    marketContract,
    "getFinalTokens"
  );

  const { data: tokensData } = tokensResult;
  const tokens = tokensData ?? [undefined, undefined];
  const baseAssetAddress = tokens[0];
  const yieldAssetAddress = tokens[1];

  const baseAssetContract = useERC20Contract(baseAssetAddress);
  const baseAssetNameResult = useSmartContractReadCall(
    baseAssetContract,
    "name"
  );
  const baseAssetSymbolResult = useSmartContractReadCall(
    baseAssetContract,
    "symbol"
  );

  const yieldAssetContract = useERC20Contract(yieldAssetAddress);
  const yieldAssetNameResult = useSmartContractReadCall(
    yieldAssetContract,
    "name"
  );
  const yieldAssetSymbolResult = useSmartContractReadCall(
    yieldAssetContract,
    "symbol"
  );
  const results = [
    nameResult,
    totalSupplyResult,
    tokensResult,
    baseAssetNameResult,
    yieldAssetNameResult,
    baseAssetSymbolResult,
    yieldAssetSymbolResult,
  ];

  if (
    !getQueryCombinedSuccessState(results) ||
    !yieldAssetAddress ||
    !marketAddress
  ) {
    return [undefined, results];
  }
  const { data: totalSupplyBigNumber } = totalSupplyResult;
  const totalSupply = formatEth(totalSupplyBigNumber, 0);
  const { data: baseAssetName } = baseAssetNameResult;
  const { data: baseAssetSymbol } = baseAssetSymbolResult;
  const { data: yieldAssetName } = yieldAssetNameResult;
  const { data: yieldAssetSymbol } = yieldAssetSymbolResult;
  const id = `${baseAssetSymbol}-${yieldAssetName}-2020-6-1`.toLowerCase();
  const name = `${baseAssetName} - ${yieldAssetName} AMM`;
  const description = t`An automated market for ${baseAssetName} and ${yieldAssetName}`;

  const market: Market = {
    contractAddress: marketAddress,
    trancheContractAddress: yieldAssetAddress,
    id,
    name,
    description,
    totalSupply,
    assets: [
      {
        name: baseAssetName,
        symbol: baseAssetSymbol,
        address: baseAssetContract?.address,
      },
      {
        name: yieldAssetName,
        symbol: yieldAssetSymbol,
        address: yieldAssetContract?.address,
      },
    ],

    yieldAssetType: "FYT",

    maturityDate: Date.now() + ONE_WEEK_IN_MILLISECONDS,

    /**
     * When the trance started.  Value is a unix timestamp in milliseconds.
     */
    startDate: Date.now(),

    state: "running",
  };
  return [market, results];
}
