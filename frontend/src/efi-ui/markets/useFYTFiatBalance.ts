import { usePairedAssetFiatPrice } from "efi-ui/markets/usePairedAssetFiatPrice";
import { useFYTBalance } from "efi-ui/tranche/useFYTBalance";

export function useFYTFiatBalance(
  account: string | null | undefined,
  trancheAddress: string | undefined,
  bPoolAddress: string | undefined,
  baseAssetAddress: string | undefined
) {
  const fytBalance = useFYTBalance(account, trancheAddress);
  const fytFiatPrice = usePairedAssetFiatPrice(bPoolAddress, baseAssetAddress);

  let fiatBalance;
  if (fytFiatPrice) {
    fiatBalance = fytBalance * fytFiatPrice;
  }

  return fiatBalance;
}
