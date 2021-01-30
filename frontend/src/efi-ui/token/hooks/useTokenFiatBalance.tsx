import { ERC20 } from "elf-contracts/types/ERC20";
import { Money } from "ts-money";

import { ComputedQueryResult } from "efi-ui/base/ComputedQueryResult";
import { useConvertToFiat } from "efi-ui/money/hooks/useConvertToFiat";
import { useTokenBalanceOf } from "efi-ui/token/hooks/useTokenBalanceOf";
import { useTokenDecimals } from "efi-ui/token/hooks/useTokenDecimals";
import { useTokenPrice } from "efi-ui/token/hooks/useTokenPrice";

export function useTokenFiatBalance(
  tokenContract: Erc20,
  account: string | null | undefined,
  currencyCode: string
): ComputedQueryResult<Money> {
  // Token Price (per base unit, eg: per ETH)
  const [tokenPrice, tokenPriceQueryResults] = useTokenPrice(
    tokenContract,
    currencyCode
  );

  // Token Balance (in fractional unit, eg: wei)
  const [tokenBalance, tokenBalanceQueryResults] = useTokenBalanceOf(
    tokenContract,
    account
  );

  // Token Decimals (for converting base unit)
  const [tokenDecimals, tokenDecimalsQueryResults] = useTokenDecimals(
    tokenContract
  );

  // Fiat Balance
  const fiatBalance = useConvertToFiat(
    tokenPrice,
    tokenBalance,
    tokenDecimals,
    currencyCode
  );

  return [
    fiatBalance,
    [
      ...tokenPriceQueryResults,
      ...tokenBalanceQueryResults,
      ...tokenDecimalsQueryResults,
    ],
  ];
}
