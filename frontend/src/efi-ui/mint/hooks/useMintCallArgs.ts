import { UserProxy } from "elf-contracts/types/UserProxy";
import { BigNumber, CallOverrides } from "ethers";
import { PrincipalTokenInfo as TrancheInfo } from "tokenlists/types";

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
  tancheInfo: TrancheInfo,
  baseAsset: CryptoAsset,
  amount: BigNumber
): StaticContractMethodArgs<UserProxy, "mint"> | undefined {
  const { unlockTimestamp, position } = tancheInfo.extensions;

  const baseAssetAddress = getTokenAddressForUserProxy(baseAsset) as string;
  const callArgs = makeMintCallArgs(
    amount,
    baseAssetAddress,
    unlockTimestamp,
    position
  );

  return callArgs;
}
function makeMintCallArgs(
  amount: BigNumber,
  baseAssetAddress: string,
  trancheUnlockTimestamp: number,
  positionAddress: string
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
  ];
  if (ethValueOverride) {
    callArgs.push(ethValueOverride);
  }

  return callArgs;
}
function getMintOverrides(
  baseAssetAddress: string,
  amount: BigNumber
): CallOverrides | undefined {
  // Don't send any eth in this transaction if the base asset is a different token.
  if (baseAssetAddress === USER_PROXY_ETH_SENTINEL) {
    return { value: amount };
  }
}
