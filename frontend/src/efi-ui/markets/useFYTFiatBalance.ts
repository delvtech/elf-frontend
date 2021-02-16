import { usePairedAssetFiatPrice } from "efi-ui/markets/usePairedAssetFiatPrice";
import { useTrancheBalance } from "efi-ui/tranche/useFYTBalance";

export function useTrancheFiatBalance(
  account: string | null | undefined,
  trancheAddress: string | undefined,
  bPoolAddress: string | undefined,
  baseAssetAddress: string | undefined
) {
  const trancheBalance = useTrancheBalance(account, trancheAddress);
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
