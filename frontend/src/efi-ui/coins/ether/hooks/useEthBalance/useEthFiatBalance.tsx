import { Web3Provider } from "@ethersproject/providers";
import { useEthBalance } from "efi-ui/coins/ether/hooks/useEthBalance/useEthBalance";
import { useEthPrice } from "efi-ui/coins/ether/hooks/useEthBalance/useEthPrice";
import { NUM_ETH_DECIMALS } from "efi/crypto/ethereum";
import { useConvertToFiat } from "efi-ui/money/hooks/useConvertToFiat";
import { ComputedQueryResult } from "efi-ui/base/ComputedQueryResult";
import { Money } from "ts-money";

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
