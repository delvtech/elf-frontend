import { Web3Provider } from "@ethersproject/providers";
import { Currency, Money } from "ts-money";

import { ComputedQueryResult } from "efi-ui/base/ComputedQueryResult";
import { useEthPrice } from "efi-ui/ethereum/hooks/useEthPrice";
import { useConvertToFiat } from "efi-ui/money/hooks/useConvertToFiat";
import { useEthBalance } from "efi-ui/wallets/hooks/useEthBalance/useEthBalance";
import { NUM_ETH_DECIMALS } from "efi/ethereum";

export function useEthFiatBalance(
  library: Web3Provider | undefined,
  account: string | null | undefined,
  currency: Currency
): ComputedQueryResult<Money> {
  const { data: ethBalance } = useEthBalance(library, account);

  const ethPriceQueryResult = useEthPrice(currency);
  const { data: ethPrice } = ethPriceQueryResult;

  const fiatBalance = useConvertToFiat(ethPrice, ethBalance, NUM_ETH_DECIMALS);

  return [fiatBalance, [ethPriceQueryResult]];
}
