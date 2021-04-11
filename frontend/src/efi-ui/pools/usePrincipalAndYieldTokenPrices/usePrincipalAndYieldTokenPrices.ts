import { Tranche } from "elf-contracts/types/Tranche";
import { ERC20Shim } from "efi-ui/contracts/ERC20Shim";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { usePoolForToken } from "efi-ui/pools/usePoolForToken/usePoolForToken";
import { usePoolTokenPrices } from "efi-ui/pools/usePoolTokenPrices/usePoolTokenPrices";
import { usePoolPairedToken } from "efi-ui/pools/usePoolPairedToken/usePoolPairedToken";
import { useSmartContractFromFactory } from "efi-ui/contracts/useSmartContractFromFactory/useSmartContractFromFactory";
import { InterestToken__factory } from "elf-contracts/types/factories/InterestToken__factory";

interface PrincipalAndYieldTokenPrices {
  amountOfBaseAssetForOneTranche: number | undefined;
  amountOfBaseAssetForOneYieldToken: number | undefined;
}

export function usePrincipalAndYieldTokenPrices(
  tranche: Tranche | undefined
): PrincipalAndYieldTokenPrices {
  const tranchePool = usePoolForToken(tranche as ERC20Shim);
  const baseAssetPoolToken = usePoolPairedToken(
    tranchePool,
    tranche as ERC20Shim
  );
  const {
    spotPriceBaseAssetForOneToken: amountOfBaseAssetForOneTranche,
  } = usePoolTokenPrices(tranchePool, baseAssetPoolToken);

  const { data: yieldTokenAddress } = useSmartContractReadCall(
    tranche,
    "interestToken"
  );
  const yieldToken = useSmartContractFromFactory(
    yieldTokenAddress,
    InterestToken__factory.connect
  );
  const yieldTokenPool = usePoolForToken(yieldToken as ERC20Shim);
  const {
    spotPriceBaseAssetForOneToken: amountOfBaseAssetForOneYieldToken,
  } = usePoolTokenPrices(yieldTokenPool, baseAssetPoolToken);
  return {
    amountOfBaseAssetForOneTranche,
    amountOfBaseAssetForOneYieldToken,
  };
}
