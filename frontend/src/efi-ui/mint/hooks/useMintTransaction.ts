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
import { EMPTY_ARRAY } from "efi/base/emptyArray";

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
    "1" // just check for any approval amount above zero
  );

  const balancerApprovedForBaseAsset = useTokenApprovedForAmount(
    ownerAddress,
    balancerVaultAddress,
    baseAssetContract,
    baseAssetDecimals,
    "1" // just check for any approval amount above zero
  );

  const balancerApprovedForPrincipalToken = useTokenApprovedForAmount(
    ownerAddress,
    balancerVaultAddress,
    principalTokenContract,
    principalTokenDecimals,
    "1" // just check for any approval amount above zero
  );

  const balancerApprovedForYieldToken = useTokenApprovedForAmount(
    ownerAddress,
    balancerVaultAddress,
    yieldTokenContract,
    yieldTokenDecimals,
    "1" // just check for any approval amount above zero
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

  const { balancerVaultAddress, userProxyContractAddress } = ContractAddresses;
  const { address: baseAssetAddress } = baseAssetContract;

  const spenders: string[] = [];
  const tokenContracts: ERC20Permit[] = [];
  const tokenNames: string[] = [];

  if (!signer || !account) {
    return EMPTY_ARRAY as PermitCallData[];
  }

  if (
    !userProxyApprovedForBaseAsset &&
    isERC20PermitAddress(baseAssetAddress)
  ) {
    const tokenName = await baseAssetContract.name();
    spenders.push(userProxyContractAddress);
    tokenContracts.push(baseAssetContract);
    tokenNames.push(tokenName);
  }

  if (!balancerApprovedForBaseAsset) {
    const tokenName = await baseAssetContract.name();
    spenders.push(userProxyContractAddress);
    tokenContracts.push(baseAssetContract);
    tokenNames.push(tokenName);
  }

  if (!balancerApprovedForPrincipalToken) {
    const tokenName = await principalTokenContract.name();
    spenders.push(balancerVaultAddress);
    tokenContracts.push(principalTokenContract);
    tokenNames.push(tokenName);
  }

  if (!balancerApprovedForYieldToken) {
    const tokenName = await yieldTokenContract.name();
    spenders.push(balancerVaultAddress);
    tokenContracts.push(yieldTokenContract);
    tokenNames.push(tokenName);
  }

  const permitCallData = await fetchPermitDataMulti(
    signer,
    account,
    spenders,
    tokenContracts,
    tokenNames
  );
  return permitCallData;
}

async function fetchPermitDataMulti(
  signer: Signer,
  owner: string,
  spenders: string[],
  tokenContracts: ERC20Permit[],
  tokenNames: string[]
): Promise<PermitCallData[]> {
  const { usdcAddress } = ContractAddresses;
  const promises = tokenContracts.map(async (tokenContract, i) => {
    const tokenName = tokenNames[i];
    const spender = spenders[i];

    const nonce = await tokenContract.nonces(owner);
    const version = tokenContract.address === usdcAddress ? "2" : "1";
    const permitData = await fetchPermitData(
      signer,
      tokenContract,
      tokenName,
      owner,
      spender,
      ethers.constants.MaxUint256,
      nonce.toNumber(),
      version
    );
    if (permitData) {
      return permitData;
    }
  });

  const permitsOrUndefined = await Promise.all(promises);

  const permits = permitsOrUndefined.filter(
    (permit): permit is PermitCallData => !!permit
  );
  return permits;
}
