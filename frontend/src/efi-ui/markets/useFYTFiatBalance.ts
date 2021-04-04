import { Tranche } from "elf-contracts/types/Tranche";
import { Currency, Money } from "ts-money";

import { getCoinGeckoId } from "efi-coingecko";
import { getQueryData } from "efi-ui/base/queryResults";
import { useCoinGeckoPrice } from "efi-ui/coingecko/useCoinGeckoPrice";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { usePoolForToken } from "efi-ui/pools/usePoolForToken/usePoolForToken";
import { Web3Provider } from "@ethersproject/providers";
import { ERC20Shim } from "efi-ui/contracts/ERC20Shim";
import { formatUnits } from "ethers/lib/utils";
import { useQueryBatchSwap } from "efi-ui/balancer/useQueryBatchSwap/useQueryBatchSwap";
import { SwapKind } from "efi-ui/balancer/SwapKind";
import { getTokenAddressForBalancer } from "efi-ui/swaps/getTokenAddressForBalancer";
import { useBaseAssetForTranche } from "efi-ui/tranche/useBaseAssetForTranche";
import { useCryptoDecimals } from "efi-ui/crypto/hooks/useCryptoDecimals/useCryptoDecimals";
import { useCryptoSymbol } from "efi-ui/crypto/hooks/useCryptoSymbol/useCryptoSymbol";
import { parseQueryBatchSwapResult } from "efi-ui/balancer/useQueryBatchSwap/parseQueryBatchSwapResult";

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
  const baseAsset = useBaseAssetForTranche(tranche);
  const baseAssetBalancerAddress = getTokenAddressForBalancer(baseAsset);
  const baseAssetDecimals = useCryptoDecimals(baseAsset);
  const trancheAddress = tranche?.address;
  const { data: queryBatchSwapResult } = useQueryBatchSwap(
    SwapKind.GIVEN_IN,
    pool,
    trancheAddress,
    baseAssetBalancerAddress,
    getQueryData(trancheBalance)
  );
  const { tokenOut: totalValueInBaseAsset } = parseQueryBatchSwapResult(
    trancheAddress,
    baseAssetBalancerAddress,
    queryBatchSwapResult
  );

  const baseAssetSymbol = useCryptoSymbol(baseAsset);
  const coinGeckoId = getCoinGeckoId(baseAssetSymbol);
  const priceResult = useCoinGeckoPrice(coinGeckoId, currency);
  const baseAssetCoinGeckoPrice = getQueryData(priceResult);

  if (baseAssetCoinGeckoPrice && totalValueInBaseAsset) {
    const trancheFiatBalance = baseAssetCoinGeckoPrice.multiply(
      +formatUnits(totalValueInBaseAsset.abs(), baseAssetDecimals)
    );
    return trancheFiatBalance;
  }
}
