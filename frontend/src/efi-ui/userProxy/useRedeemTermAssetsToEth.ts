import { useCallback } from "react";

import { Tranche } from "elf-contracts/types/Tranche";
import { UserProxy } from "elf-contracts/types/UserProxy";
import { BigNumber, ethers, Signer } from "ethers";
import { PrincipalTokenInfo } from "tokenlists/types";

import { fetchPermitData, PermitCallData } from "efi/base/fetchPermitData";
import { getUserProxy } from "efi-ui/mint/hooks/userProxy";
import { useTokenAllowance } from "efi-ui/token/hooks/useTokenAllowance";
import { useSmartContractTransactionPersisted } from "efi-ui/transactions/useSmartContractTransactionPersisted/useSmartContractTransactionPersisted";
import { flushPromises } from "efi/base/flush";
import { ContractMethodArgs } from "efi/contracts/types";
import { interestTokenContractsByAddress } from "efi/interestToken/interestToken";
import { getTokenInfo } from "efi/tokenlists";

// list of shitty principal and yield token contracts whose names are messed up.  they change their
// name after the constructor uses them to create their PERMIT_HASH's, which breaks permit calls.
// So, we have to look up these fuckers, and use 'Principal Token ', or 'Element Yield Token '
// instead of the actual token name.  Once these terms close out we can kill this list.
const shittyGoerliAddresses: string[] = [
  "0x89d66Ad25F3A723D606B78170366d8da9870A879",
  "0xBf4B5cB5ca49B1eF6B02615a94980723f6484899",
  "0x80272c960b862B4d6542CDB7338Ad1f727E0D18d",
  "0x2c637c5142eE4F31A1a78Ad3DF012fc242F6CAe6",
];

export function useRedeemTermAssetsToEth(
  signer: Signer | undefined,
  tranche: Tranche | undefined,
  account: string | null | undefined,
  // note both are required.  set to BigNumber.from(0) if you don't want that one.
  amountPrinicpalToken: BigNumber,
  amountYieldToken: BigNumber,
  onTransactionSubmitted?: () => void
): {
  withdraw: () => void;
  reset: () => void;
  isError: boolean;
  isLoading: boolean;
} {
  const principalTokenInfo = tranche
    ? getTokenInfo<PrincipalTokenInfo>(tranche.address)
    : undefined;
  const expiration = principalTokenInfo?.extensions.unlockTimestamp;
  const position = principalTokenInfo?.extensions.position;
  const interestTokenAddress = principalTokenInfo?.extensions.interestToken;
  const interestTokenContract = interestTokenAddress
    ? interestTokenContractsByAddress[interestTokenAddress]
    : undefined;

  const userProxy = getUserProxy(signer);
  const {
    mutate: withdrawToEth,
    isError,
    isLoading,
    reset,
  } = useSmartContractTransactionPersisted(userProxy, "withdrawWeth", signer, {
    onTransactionSubmitted,
  });

  const { data: ptApproval } = useTokenAllowance(
    tranche,
    account,
    userProxy?.address
  );

  const { data: ytApproval } = useTokenAllowance(
    interestTokenContract,
    account,
    userProxy?.address
  );

  const withdraw = useCallback(async () => {
    if (
      !signer ||
      !account ||
      !userProxy ||
      !expiration ||
      !position ||
      !tranche ||
      !interestTokenContract ||
      !ptApproval ||
      !ytApproval
    ) {
      return;
    }
    // we need an amount from at least one
    if (!amountPrinicpalToken.gt(0) && !amountYieldToken.gt(0)) {
      return;
    }

    // Note that the name in the TokenInfo is incorrect
    let ptName = await tranche.name();
    if (shittyGoerliAddresses.includes(tranche.address)) {
      ptName = "Principal Token ";
    }
    const permits: PermitCallData[] = [];

    if (ptApproval.lt(amountPrinicpalToken)) {
      const nonce = await interestTokenContract.nonces(account);
      const ptPermitData = await fetchPermitData(
        signer,
        tranche,
        ptName,
        account,
        userProxy.address,
        ethers.constants.MaxUint256,
        nonce.toNumber(),
        "1"
      );
      if (ptPermitData) {
        permits.push(ptPermitData);
      }
    }

    // wait before bringing up MM again, otherwise the pop-up can get hidden sometimes.
    await flushPromises(100);

    // Note that the name in the TokenInfo is incorrect
    let ytName = await interestTokenContract.name();
    if (shittyGoerliAddresses.includes(interestTokenContract.address)) {
      ytName = "Element Yield Token ";
    }

    if (ytApproval.lt(amountYieldToken)) {
      const nonce = await interestTokenContract.nonces(account);
      const ytPermitData = await fetchPermitData(
        signer,
        interestTokenContract,
        ytName,
        account,
        userProxy.address,
        ethers.constants.MaxUint256,
        nonce.toNumber(),
        "1"
      );
      if (ytPermitData) {
        permits.push(ytPermitData);
      }
    }

    // wait before bringing up MM again, otherwise the pop-up can get hidden sometimes.
    await flushPromises(100);

    const withdrawInterestToEthCallArgs = makeWithdrawInterestToEthCallArgs(
      expiration,
      position,
      amountPrinicpalToken,
      amountYieldToken,
      permits
    );

    withdrawToEth(withdrawInterestToEthCallArgs);
  }, [
    account,
    amountPrinicpalToken,
    amountYieldToken,
    expiration,
    interestTokenContract,
    position,
    ptApproval,
    signer,
    tranche,
    userProxy,
    withdrawToEth,
    ytApproval,
  ]);

  return {
    withdraw,
    reset,
    isError,
    isLoading,
  };
}
export function makeWithdrawInterestToEthCallArgs(
  expiration: number,
  position: string,
  amountPT: BigNumber,
  amountYT: BigNumber,
  permitCallData: PermitCallData[]
): ContractMethodArgs<UserProxy, "withdrawWeth"> {
  const callArgs: ContractMethodArgs<UserProxy, "withdrawWeth"> = [
    expiration,
    position,
    amountPT,
    amountYT,
    permitCallData,
  ];

  return callArgs;
}
