import { Tranche } from "elf-contracts/types/Tranche";
import { UserProxy } from "elf-contracts/types/UserProxy";
import { BigNumber, CallOverrides } from "ethers";

import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import {
  ContractMethodArgs,
  StaticContractMethodArgs,
} from "efi/contracts/types";
import { CryptoAsset } from "efi/crypto/CryptoAsset";
import {
  getTokenAddressForUserProxy,
  USER_PROXY_ETH_SENTINEL,
} from "efi/userProxy";

export function useMintCallArgs(
  tranche: Tranche | undefined,
  baseAsset: CryptoAsset | undefined,
  amount: BigNumber | undefined
): StaticContractMethodArgs<UserProxy, "mint"> | undefined {
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
): StaticContractMethodArgs<UserProxy, "mint"> | undefined {
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
