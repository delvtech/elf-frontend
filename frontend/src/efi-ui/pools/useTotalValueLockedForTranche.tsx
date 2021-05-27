import { ERC20 } from "elf-contracts/types/ERC20";
import { formatUnits } from "ethers/lib/utils";
import { PrincipalTokenInfo } from "tokenlists/types";
import { Money } from "ts-money";

import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { useCurrencyPref } from "efi-ui/prefs/useCurrency/useCurencyPref";
import { useTokenPrice } from "efi-ui/token/hooks/useTokenPrice";
import { trancheContractsByAddress } from "efi/tranche/tranches";

export function useTotalValueLockedForTranche(
  trancheInfo: PrincipalTokenInfo,
  baseAssetContract: ERC20 | undefined
): Money | undefined {
  const { address, decimals } = trancheInfo;
  const tranche = trancheContractsByAddress[address];

  const { data: baseAssetLockedBN } = useSmartContractReadCall(
    tranche,
    "valueSupplied"
  );
  const { currency } = useCurrencyPref();
  const [baseAssetPrice] = useTokenPrice(baseAssetContract, currency);

  if (!baseAssetLockedBN) {
    return undefined;
  }

  const baseAssetLocked = +formatUnits(baseAssetLockedBN, decimals);
  const totalValueLocked = baseAssetPrice?.multiply(
    baseAssetLocked,
    Math.round
  );

  return totalValueLocked;
}
