import { useQuery } from "react-query";

import { Money } from "ts-money";

import { useCurrencyPref } from "efi-ui/prefs/useCurrency/useCurencyPref";
import { useOpenPrincipalTokenInfos } from "efi-ui/tranche/useOpenPrincipaltokenInfos";
import { fetchTokenPrice } from "efi/token/fetchTokenPrice";
import { fetchTotalValueLockedForTerm } from "efi/tranche/fetchTotalValueLockedForTerm";
import { underlyingContractsByAddress } from "efi/underlying/underlying";
import { ERC20 } from "elf-contracts-typechain/dist/types/ERC20";

export function useTotalValueLockedForPlatform(): Money {
  const { currency } = useCurrencyPref();
  const termInfos = useOpenPrincipalTokenInfos();

  const { data: results = [] } = useQuery({
    queryFn: async () => {
      const results = await Promise.all(
        termInfos.map(async (termInfo) => {
          const baseAssetContract =
            underlyingContractsByAddress[termInfo.extensions.underlying];
          const baseAssetPrice = await fetchTokenPrice(
            baseAssetContract as ERC20,
            currency
          );
          return fetchTotalValueLockedForTerm(termInfo, baseAssetPrice);
        })
      );
      return results;
    },
  });

  let totalValueLocked = Money.fromDecimal(0, currency);
  results.forEach(
    (result) => (totalValueLocked = totalValueLocked.add(result))
  );

  return totalValueLocked;
}
