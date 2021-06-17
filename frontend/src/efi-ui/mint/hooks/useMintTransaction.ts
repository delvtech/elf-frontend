import { useCallback } from "react";
import { UseMutationResult } from "react-query";

import { ERC20Permit, InterestToken, Tranche } from "elf-contracts/types";
import { UserProxy } from "elf-contracts/types/UserProxy";
import { ContractTransaction, ethers, Signer } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import {
  PrincipalTokenInfo as TrancheInfo,
  YieldTokenInfo,
} from "tokenlists/types";

import { fetchPermitData, PermitCallData } from "efi-ui/base/fetchPermitData";
import { getUserProxy } from "efi-ui/mint/hooks/userProxy";
import { useTokenApprovedForAmount } from "efi-ui/token/hooks/useTokenApprovedForAmount";
import { useSmartContractTransactionPersisted } from "efi-ui/transactions/useSmartContractTransactionPersisted/useSmartContractTransactionPersisted";
import ContractAddresses from "efi/addresses";
import { CryptoAsset } from "efi/crypto/CryptoAsset";
import { getCryptoDecimals } from "efi/crypto/getCryptoDecimals";
import { interestTokenContractsByAddress } from "efi/interestToken/interestToken";
import { makeMintCallArgs } from "efi/mint/makeMintCallArgs";
import { trancheContractsByAddress } from "efi/tranche/tranches";
import {
  isERC20PermitAddress,
  underlyingContractsByAddress,
} from "efi/underlying/underlying";
import { getTokenAddressForUserProxy } from "efi/userProxy";

/**
 * Returns the number of Principal Tokens you'd get for minting into a tranche.
 * This is useful because in order to mint into a tranche, some amount of
 * principal must be used to cover the current earnings of the YT. This results
 * in less than 1 to 1 principal tokens for your deposit.
 */
export function useMintTransaction(
  signer: Signer | undefined,
  account: string | undefined | null,
  baseAsset: CryptoAsset,
  trancheInfo: TrancheInfo,
  yieldTokenInfo: YieldTokenInfo,
  amountIn: number,
  onTransactionStarted: () => void
): {
  mint: () => void;
  mutationResult: UseMutationResult<
    ContractReceipt | undefined,
    unknown,
    Parameters<UserProxy["mint"]>
  >;
} {
  const { balancerVaultAddress, userProxyContractAddress } = ContractAddresses;
  const userProxy = getUserProxy(signer);
  const baseAssetDecimals = getCryptoDecimals(baseAsset) ?? 18;
  const amountInBigNumber = parseUnits(amountIn.toString(), baseAssetDecimals);
  const baseAssetContract = underlyingContractsByAddress[
    trancheInfo.extensions.underlying
  ] as unknown as ERC20Permit;
  const yieldTokenContract =
    interestTokenContractsByAddress[yieldTokenInfo.address];
  const principalTokenContract = trancheContractsByAddress[trancheInfo.address];
  const { decimals: principalTokenDecimals } = trancheInfo;
  const { decimals: yieldTokenDecimals } = yieldTokenInfo;

  const mutationResult = useSmartContractTransactionPersisted(
    userProxy,
    "mint",
    signer,
    {
      onTransactionSubmitted: () => {
        onTransactionStarted();
      },
    }
  );
  const { mutate: mint } = mutationResult;

  const approvals = useApprovalsForMint(
    account,
    userProxyContractAddress,
    balancerVaultAddress,
    baseAssetContract,
    principalTokenContract,
    yieldTokenContract,
    baseAssetDecimals,
    principalTokenDecimals,
    yieldTokenDecimals
  );

  const onMintTransaction = useCallback(async () => {
    const permitCallData = await getPermitCallData(
      signer,
      account,
      approvals,
      baseAssetContract,
      principalTokenContract,
      yieldTokenContract
    );

    const baseAssetAddress = getTokenAddressForUserProxy(baseAsset) as string;
    const { unlockTimestamp, position } = trancheInfo.extensions;

    const mintCallArgs = makeMintCallArgs(
      amountInBigNumber,
      baseAssetAddress,
      unlockTimestamp,
      position,
      permitCallData
    );

    if (mintCallArgs) {
      mint(mintCallArgs);
    }
  }, [
    account,
    amountInBigNumber,
    approvals,
    baseAsset,
    baseAssetContract,
    mint,
    principalTokenContract,
    signer,
    trancheInfo.extensions,
    yieldTokenContract,
  ]);

  return { mint: onMintTransaction, mutationResult };
}

// all the approvals that we need to check before including permit data with the mint call.  to do
// the actual mint we just need to permit the user proxy to take the user's base asset.  for staking
// we need to allow balancer to take the base asset/pt/yt.  for now we are just doing a simple check
// to see if there is any approval amount.
function useApprovalsForMint(
  ownerAddress: string | null | undefined,
  userProxyAddress: string,
  balancerVaultAddress: string,
  baseAssetContract: ERC20Permit,
  principalTokenContract: Tranche,
  yieldTokenContract: InterestToken,
  baseAssetDecimals: number,
  principalTokenDecimals: number,
  yieldTokenDecimals: number
) {
  const userProxyApprovedForBaseAsset = useTokenApprovedForAmount(
    ownerAddress,
    userProxyAddress,
    baseAssetContract,
    baseAssetDecimals,
    "0" // just check for any approval amount above zero
  );

  const balancerApprovedForBaseAsset = useTokenApprovedForAmount(
    ownerAddress,
    balancerVaultAddress,
    baseAssetContract,
    baseAssetDecimals,
    "0" // just check for any approval amount above zero
  );

  const balancerApprovedForPrincipalToken = useTokenApprovedForAmount(
    ownerAddress,
    balancerVaultAddress,
    principalTokenContract,
    principalTokenDecimals,
    "0" // just check for any approval amount above zero
  );

  const balancerApprovedForYieldToken = useTokenApprovedForAmount(
    ownerAddress,
    balancerVaultAddress,
    yieldTokenContract,
    yieldTokenDecimals,
    "0" // just check for any approval amount above zero
  );

  return {
    userProxyApprovedForBaseAsset,
    balancerApprovedForBaseAsset,
    balancerApprovedForPrincipalToken,
    balancerApprovedForYieldToken,
  };
}

async function getPermitCallData(
  signer: Signer | undefined,
  account: string | null | undefined,
  approvals: Record<string, boolean>,
  baseAssetContract: ERC20Permit,
  principalTokenContract: Tranche,
  yieldTokenContract: InterestToken
): Promise<PermitCallData[]> {
  const {
    userProxyApprovedForBaseAsset,
    balancerApprovedForBaseAsset,
    balancerApprovedForPrincipalToken,
    balancerApprovedForYieldToken,
  } = approvals;

  const { usdcAddress, balancerVaultAddress, userProxyContractAddress } =
    ContractAddresses;
  const { address: baseAssetAddress } = baseAssetContract;

  const permitCallData: PermitCallData[] = [];
  if (!signer || !account) {
    return permitCallData;
  }
  if (
    !userProxyApprovedForBaseAsset &&
    isERC20PermitAddress(baseAssetAddress)
  ) {
    const tokenName = await baseAssetContract.name();
    const version = baseAssetAddress === usdcAddress ? "2" : "1";
    const permitData = await fetchPermitData(
      signer,
      baseAssetContract,
      tokenName,
      account,
      userProxyContractAddress,
      ethers.constants.MaxUint256,
      version
    );
    permitData && permitCallData.push(permitData);
  }

  if (!balancerApprovedForBaseAsset) {
    const tokenName = await baseAssetContract.name();
    const version = baseAssetAddress === usdcAddress ? "2" : "1";
    const permitData = await fetchPermitData(
      signer,
      baseAssetContract,
      tokenName,
      account,
      balancerVaultAddress,
      ethers.constants.MaxUint256,
      version
    );
    permitData && permitCallData.push(permitData);
  }

  if (!balancerApprovedForPrincipalToken) {
    const tokenName = await principalTokenContract.name();
    const version = "1";
    const permitData = await fetchPermitData(
      signer,
      principalTokenContract,
      tokenName,
      account,
      balancerVaultAddress,
      ethers.constants.MaxUint256,
      version
    );
    permitData && permitCallData.push(permitData);
  }

  if (!balancerApprovedForYieldToken) {
    const tokenName = await yieldTokenContract.name();
    const version = "1";
    const permitData = await fetchPermitData(
      signer,
      yieldTokenContract,
      tokenName,
      account,
      balancerVaultAddress,
      ethers.constants.MaxUint256,
      version
    );
    permitData && permitCallData.push(permitData);
  }
  return permitCallData;
}
