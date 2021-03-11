import { formatUnits } from "@ethersproject/units";
import { Tranche } from "elf-contracts/types/Tranche";
import { Currency, Money } from "ts-money";

import { getCoinGeckoId } from "efi-coingecko";
import { getQueryData } from "efi-ui/base/queryResults";
import { useCoinGeckoPrice } from "efi-ui/coingecko/useCoinGeckoPrice";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { usePairedAssetFiatPrice } from "efi-ui/markets/usePairedAssetFiatPrice";
import { useOnSwapGivenIn } from "efi-ui/pools/useOnSwapGivenIn/useOnSwapGivenIn";
import { usePoolForToken } from "efi-ui/pools/usePoolForToken/usePoolForToken";
import { usePoolPairedToken } from "efi-ui/pools/usePoolPairedToken/usePoolPairedToken";
import { useTrancheBalanceOld } from "efi-ui/tranche/useFYTBalance";

/**
 * @deprecated BPool is deprecated. use useTrancheFiatBalance instead
 */
export function useTrancheFiatBalanceOld(
  account: string | null | undefined,
  trancheAddress: string | undefined,
  bPoolAddress: string | undefined,
  baseAssetAddress: string | undefined
): Money | undefined {
  const trancheBalance = useTrancheBalanceOld(account, trancheAddress);
  const trancheFiatPrice = usePairedAssetFiatPrice(
    bPoolAddress,
    baseAssetAddress
  );

  let fiatBalance;
  if (trancheFiatPrice) {
    fiatBalance = trancheFiatPrice.multiply(trancheBalance);
  }

  return fiatBalance;
}

export function useTrancheFiatBalance(
  account: string | null | undefined,
  tranche: Tranche | undefined,
  currency: Currency
): Money | undefined {
  const trancheBalance = useSmartContractReadCall(tranche, "balanceOf", {
    enabled: !!account,
    callArgs: [account as string],
  });
  const pool = usePoolForToken(tranche);
  const baseAssetToken = usePoolPairedToken(pool, tranche);
  const { data: baseAssetDecimals } = useSmartContractReadCall(
    baseAssetToken,
    "decimals"
  );
  const baseAssetTotalValueResult = useOnSwapGivenIn(
    pool,
    tranche,
    getQueryData(trancheBalance)
  );
  const totalValueInBaseAsset = getQueryData(baseAssetTotalValueResult);

  const baseAssetSymbolResult = useSmartContractReadCall(
    baseAssetToken,
    "symbol"
  );
  const coinGeckoId = getCoinGeckoId(getQueryData(baseAssetSymbolResult));
  const priceResult = useCoinGeckoPrice(coinGeckoId, currency);
  const baseAssetCoinGeckoPrice = getQueryData(priceResult);

  if (baseAssetCoinGeckoPrice && totalValueInBaseAsset) {
    const trancheFiatBalance = baseAssetCoinGeckoPrice.multiply(
      +formatUnits(totalValueInBaseAsset, baseAssetDecimals)
    );
    return trancheFiatBalance;
  }
}
