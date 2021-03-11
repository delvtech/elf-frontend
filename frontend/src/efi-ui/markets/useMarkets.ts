import { QueryObserverResult, QueryStatus } from "react-query";

import { formatEther } from "@ethersproject/units";
import { BPool } from "elf-contracts/types/BPool";
import { ERC20 } from "elf-contracts/types/ERC20";
import { BigNumber } from "ethers";
import zip from "lodash.zip";
import { t } from "ttag";

import { useSmartContractReadCalls } from "efi-ui/contracts/useSmartContractReadCalls/useSmartContractReadCalls";
import { getQueryCombinedStatus } from "efi-ui/query/getQueryCombinedStatus";
import { getQueryCombinedSuccessState } from "efi-ui/query/getQueryCombinedSuccessState";
import { ONE_WEEK_IN_MILLISECONDS } from "efi/base/time";
import { getERC20Contract } from "efi/contracts/getERC20Contract";
import { Market } from "efi/markets/Market";

/**
 * returns details about a market.
 * @param { BPool[] } marketContracts
 * @deprecated BPool is deprecated. useMarketInfos instead
 */
export function useMarketsOld(
  marketContracts: BPool[]
): [Market | undefined, QueryStatus][] {
  const nameResults = useSmartContractReadCalls(marketContracts, "name");
  const tokensResults = useSmartContractReadCalls(
    marketContracts,
    "getFinalTokens"
  );
  const swapFeeResults = useSmartContractReadCalls(
    marketContracts,
    "getSwapFee"
  );

  const baseAssetContracts = tokensResults.map<ERC20 | undefined>((result) => {
    const { data: tokensData } = result;
    const tokens = tokensData ?? [undefined, undefined];
    const baseAssetAddress = tokens[0];
    const baseAssetContract = getERC20Contract(baseAssetAddress);
    return baseAssetContract;
  });
  const yieldAssetContracts = tokensResults.map<ERC20 | undefined>((result) => {
    const { data: tokensData } = result;
    const tokens = tokensData ?? [undefined, undefined];
    const yieldAssetAddress = tokens[1];
    const yieldAssetContract = getERC20Contract(yieldAssetAddress);
    return yieldAssetContract;
  });

  const baseAssetNameResults = useSmartContractReadCalls(
    baseAssetContracts,
    "name"
  );
  const baseAssetSymbolResults = useSmartContractReadCalls(
    baseAssetContracts,
    "symbol"
  );

  const yieldAssetNameResults = useSmartContractReadCalls(
    yieldAssetContracts,
    "name"
  );
  const yieldAssetSymbolResults = useSmartContractReadCalls(
    yieldAssetContracts,
    "symbol"
  );

  const zippedMarketInfo = zip<MarketInfoTypes>(
    marketContracts,
    baseAssetContracts,
    yieldAssetContracts,
    nameResults,
    swapFeeResults,
    tokensResults,
    baseAssetNameResults,
    yieldAssetNameResults,
    baseAssetSymbolResults,
    yieldAssetSymbolResults
  ) as MarketInfo[];

  const markets = zippedMarketInfo.map((marketInfo) => {
    const [
      marketContract,
      baseAssetContract,
      yieldAssetContract,
      ...results
    ] = marketInfo;
    const [
      nameResult,
      swapFeeResult,
      tokensResult,
      baseAssetNameResult,
      baseAssetSymbolResult,
      yieldAssetNameResult,
      yieldAssetSymbolResult,
    ] = results;
    const status = getQueryCombinedStatus(results);
    if (
      !baseAssetContract ||
      !yieldAssetContract ||
      !getQueryCombinedSuccessState(results)
    ) {
      return [undefined, status];
    }
    const market: Market = getMarketFromResultsOld(
      marketContract,
      baseAssetContract,
      yieldAssetContract,
      nameResult,
      swapFeeResult,
      tokensResult,
      baseAssetNameResult,
      baseAssetSymbolResult,
      yieldAssetNameResult,
      yieldAssetSymbolResult
    );
    return [market, status];
  }) as [Market | undefined, QueryStatus][];

  return markets;
}

/**
 * @deprecated
 */
function getMarketFromResultsOld(
  marketContract: BPool,
  baseAssetContract: ERC20 | undefined,
  yieldAssetContract: ERC20 | undefined,
  nameResult: QueryObserverResult<string>,
  swapFeeResult: QueryObserverResult<BigNumber>,
  tokensResult: QueryObserverResult<string[]>,
  baseAssetNameResult: QueryObserverResult<string>,
  baseAssetSymbolResult: QueryObserverResult<string>,
  yieldAssetNameResult: QueryObserverResult<string>,
  yieldAssetSymbolResult: QueryObserverResult<string>
) {
  const { data: baseAssetName } = baseAssetNameResult;
  const { data: baseAssetSymbol } = baseAssetSymbolResult;
  const { data: yieldAssetName } = yieldAssetNameResult;
  const { data: yieldAssetSymbol } = yieldAssetSymbolResult;
  const { data: swapFeeBigNumber } = swapFeeResult;
  const swapFee = swapFeeBigNumber && +formatEther(swapFeeBigNumber);
  const id = `${baseAssetSymbol}-${yieldAssetName}-2020-6-1`.toLowerCase();
  const name = `${baseAssetName} - ${yieldAssetName} AMM`;
  const description = t`An automated market for ${baseAssetName} and ${yieldAssetName}`;

  const market: Market = {
    contract: marketContract,
    contractAddress: marketContract.address,
    // TODO: figure this out better, right now assumes fyt
    trancheContractAddress: yieldAssetContract?.address,
    id,
    name,
    description,
    totalSupply: "1,234,567",
    swapFee,
    assets: [
      {
        name: baseAssetName,
        symbol: baseAssetSymbol,
        address: baseAssetContract?.address,
        contract: baseAssetContract,
      },
      {
        name: yieldAssetName,
        symbol: yieldAssetSymbol,
        address: yieldAssetContract?.address,
        contract: yieldAssetContract,
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
  return market;
}

/**
 * @deprecated BPool is deprecated. use PoolInfo instead
 */
type MarketInfo = [
  BPool, // market
  ERC20 | undefined, // base asset
  ERC20 | undefined, // yield asset
  QueryObserverResult<string>, // nameResult
  QueryObserverResult<BigNumber>, // swapFeeResult
  QueryObserverResult<string[]>, // tokensResult
  QueryObserverResult<string>, // baseAssetNameResult
  QueryObserverResult<string>, // yieldAssetNameResult
  QueryObserverResult<string>, // baseAssetSymbolResult
  QueryObserverResult<string> // yieldAssetSymbolResults
];

/**
 * @deprecated BPool is deprecated. use PoolInfoTypes instead.
 */
type MarketInfoTypes = MarketInfo[number];
