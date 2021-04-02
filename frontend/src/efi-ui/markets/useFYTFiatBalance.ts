import { Tranche } from "elf-contracts/types/Tranche";
import { Currency, Money } from "ts-money";

import { getCoinGeckoId } from "efi-coingecko";
import { getQueryData } from "efi-ui/base/queryResults";
import { useCoinGeckoPrice } from "efi-ui/coingecko/useCoinGeckoPrice";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { useOnSwapGivenIn } from "efi-ui/pools/useOnSwapGivenIn/useOnSwapGivenIn";
import { usePoolForToken } from "efi-ui/pools/usePoolForToken/usePoolForToken";
import { usePoolPairedToken } from "efi-ui/pools/usePoolPairedToken/usePoolPairedToken";
import { Web3Provider } from "@ethersproject/providers";
import { ERC20Shim } from "efi-ui/contracts/ERC20Shim";
import { formatUnits } from "ethers/lib/utils";

/**
 * @deprecated BPool is deprecated. use useTrancheFiatBalance instead
 */

export function useTrancheFiatBalance(
  library: Web3Provider | undefined,
  account: string | null | undefined,
  tranche: Tranche | undefined,
  currency: Currency
): Money | undefined {
  const trancheBalance = useSmartContractReadCall(tranche, "balanceOf", {
    enabled: !!account,
    callArgs: [account as string],
  });
  const pool = usePoolForToken(tranche as ERC20Shim);
  const baseAssetToken = usePoolPairedToken(pool, tranche as ERC20Shim);
  const { data: baseAssetDecimals } = useSmartContractReadCall(
    baseAssetToken,
    "decimals"
  );
  const baseAssetTotalValueResult = useOnSwapGivenIn(
    pool,
    tranche as ERC20Shim,
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
