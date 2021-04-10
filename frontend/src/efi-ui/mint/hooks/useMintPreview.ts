import { parseUnits } from "@ethersproject/units";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { useCryptoDecimals } from "efi-ui/crypto/hooks/useCryptoDecimals/useCryptoDecimals";
import { useUserProxy } from "efi-ui/mint/hooks/userProxy";
import { ContractMethodArgs } from "efi/contracts/types";
import { CryptoAsset } from "efi/crypto/CryptoAsset";
import {
  getTokenAddressForUserProxy,
  USER_PROXY_ETH_SENTINEL,
} from "efi/userProxy";
import { Tranche } from "elf-contracts/types/Tranche";
import { UserProxy } from "elf-contracts/types/UserProxy";
import { BigNumber, CallOverrides } from "ethers";
import { QueryObserverResult } from "react-query";

/**
 * Returns the number of Principal Tokens you'd get for minting into a tranche.
 * This is useful because in order to mint into a tranche, some amount of
 * principal must be used to cover the current earnings of the YT. This results
 * in less than 1 to 1 principal tokens for your deposit.
 */
export function useMintPreview(
  baseAsset: CryptoAsset | undefined,
  tranche: Tranche | undefined,
  amountIn: number | undefined
): QueryObserverResult<BigNumber> {
  const userProxy = useUserProxy();
  const baseAssetDecimals = useCryptoDecimals(baseAsset);
  const amountInBigNumber = parseUnits(
    amountIn?.toString() || "0",
    baseAssetDecimals
  );

  const mintCallArgs = useMintCallArgs(tranche, baseAsset, amountInBigNumber);
  const mintPreviewResult = useSmartContractReadCall(userProxy, "mint", {
    enabled: !!mintCallArgs,
    callArgs: mintCallArgs,
  });

  return mintPreviewResult;
}

// TODO: export this so it can be shared with the non-preview mint call
function useMintCallArgs(
  tranche: Tranche | undefined,
  baseAsset: CryptoAsset | undefined,
  amount: BigNumber | undefined
) {
  const { data: trancheUnlockTimestamp } = useSmartContractReadCall(
    tranche,
    "unlockTimestamp"
  );
  const { data: position } = useSmartContractReadCall(tranche, "position");

  const baseAssetAddress = getTokenAddressForUserProxy(baseAsset);
  const callArgs = makeMintCallArgs(
    amount,
    baseAssetAddress,
    trancheUnlockTimestamp,
    position
  );

  return callArgs;
}

function makeMintCallArgs(
  amount: BigNumber | undefined,
  baseAssetAddress: string | undefined,
  trancheUnlockTimestamp: BigNumber | undefined,
  positionAddress: string | undefined
): ContractMethodArgs<UserProxy, "mint"> | undefined {
  if (
    !amount?.gt(0) ||
    !baseAssetAddress ||
    !trancheUnlockTimestamp ||
    !positionAddress
  ) {
    return undefined;
  }

  const ethValueOverride = getMintOverrides(baseAssetAddress, amount);

  const callArgs: ContractMethodArgs<UserProxy, "mint"> = [
    amount,
    baseAssetAddress,
    trancheUnlockTimestamp,
    positionAddress,
    [],

    ethValueOverride,
  ];

  return callArgs;
}

function getMintOverrides(
  baseAssetAddress: string,
  amount: BigNumber
): CallOverrides {
  // Don't send any eth in this transaction if the base asset is a different token.
  const value =
    baseAssetAddress === USER_PROXY_ETH_SENTINEL ? amount : BigNumber.from(0);

  return { value };
}
