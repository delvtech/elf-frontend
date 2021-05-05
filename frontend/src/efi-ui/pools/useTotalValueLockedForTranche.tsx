import { ERC20 } from "elf-contracts/types/ERC20";
import { Tranche } from "elf-contracts/types/Tranche";
import { formatUnits } from "ethers/lib/utils";
import { Money } from "ts-money";

import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { useCurrencyPref } from "efi-ui/prefs/useCurrency/useCurencyPref";
import { useTokenDecimals } from "efi-ui/token/hooks/useTokenDecimals";
import { useTokenPrice } from "efi-ui/token/hooks/useTokenPrice";

export function useTotalValueLockedForTranche(
  tranche: Tranche | undefined,
  baseAssetContract: ERC20 | undefined
): Money | undefined {
  const { data: baseAssetLockedBN } = useSmartContractReadCall(
    tranche,
    "valueSupplied"
  );
  const { data: trancheDecimals } = useTokenDecimals(tranche);
  const { currency } = useCurrencyPref();
  const [baseAssetPrice] = useTokenPrice(baseAssetContract, currency);

  if (!baseAssetLockedBN || !trancheDecimals) {
    return undefined;
  }

  const baseAssetLocked = +formatUnits(baseAssetLockedBN, trancheDecimals);
  const totalValueLocked = baseAssetPrice?.multiply(
    baseAssetLocked,
    Math.round
  );

  return totalValueLocked;
}
