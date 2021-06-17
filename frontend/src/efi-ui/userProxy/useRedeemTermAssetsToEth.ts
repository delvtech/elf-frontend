import { useCallback } from "react";

import { Tranche } from "elf-contracts/types/Tranche";
import { UserProxy } from "elf-contracts/types/UserProxy";
import { BigNumber, ethers, Signer } from "ethers";
import { PrincipalTokenInfo } from "tokenlists/types";

import { fetchPermitData, PermitCallData } from "efi-ui/base/fetchPermitData";
import { getUserProxy } from "efi-ui/mint/hooks/userProxy";
import { useTokenAllowance } from "efi-ui/token/hooks/useTokenAllowance";
import { useSmartContractTransactionPersisted } from "efi-ui/transactions/useSmartContractTransactionPersisted/useSmartContractTransactionPersisted";
import { flushPromises } from "efi/base/flush";
import { ContractMethodArgs } from "efi/contracts/types";
import { interestTokenContractsByAddress } from "efi/interestToken/interestToken";
import { getTokenInfo } from "efi/tokenlists";

export function useRedeemTermAssetsToEth(
  signer: Signer | undefined,
  tranche: Tranche | undefined,
  account: string | null | undefined,
  // note both are required.  set to BigNumber.from(0) if you don't want that one.
  amountPrinicpalToken: BigNumber,
  amountYieldToken: BigNumber
): () => void {
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
  const { mutate: withdrawToEth } = useSmartContractTransactionPersisted(
    userProxy,
    "withdrawWeth",
    signer
  );

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

  return useCallback(async () => {
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
    const ptName = await tranche.name();
    const permits: PermitCallData[] = [];

    if (ptApproval.lt(amountPrinicpalToken)) {
      const ptPermitData = await fetchPermitData(
        signer,
        tranche,
        ptName,
        account,
        userProxy.address,
        ethers.constants.MaxUint256,
        "1"
      );
      if (ptPermitData) {
        permits.push(ptPermitData);
      }
    }

    // wait before bringing up MM again, otherwise the pop-up can get hidden sometimes.
    await flushPromises(100);

    // Note that the name in the TokenInfo is incorrect
    const ytName = await interestTokenContract.name();

    if (ytApproval.lt(amountYieldToken)) {
      const ytPermitData = await fetchPermitData(
        signer,
        interestTokenContract,
        ytName,
        account,
        userProxy.address,
        ethers.constants.MaxUint256,
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
