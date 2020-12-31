import { Web3Provider } from "@ethersproject/providers";
import { Money } from "ts-money";

import { ComputedQueryResult } from "efi-ui/base/ComputedQueryResult";
import { useEthBalance } from "efi-ui/coins/ether/hooks/useEthBalance/useEthBalance";
import { useEthPrice } from "efi-ui/coins/ether/hooks/useEthBalance/useEthPrice";
import { useConvertToFiat } from "efi-ui/money/hooks/useConvertToFiat";
import { NUM_ETH_DECIMALS } from "efi/crypto/ethereum";

export function useEthFiatBalance(
  library: Web3Provider | undefined,
  account: string | null | undefined,
  currencyCode: string
): ComputedQueryResult<Money> {
  const { data: ethBalance } = useEthBalance(library, account);

  const ethPriceQueryResult = useEthPrice(currencyCode);
  const { data: ethPrice } = ethPriceQueryResult;

  const fiatBalance = useConvertToFiat(
    ethPrice,
    ethBalance,
    NUM_ETH_DECIMALS,
    currencyCode
  );

  return [fiatBalance, [ethPriceQueryResult]];
}
