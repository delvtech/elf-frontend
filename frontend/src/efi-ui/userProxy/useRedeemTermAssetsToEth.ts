import { useCallback } from "react";

import { ERC20Permit } from "elf-contracts/types/ERC20Permit";
import { ERC20Permit__factory } from "elf-contracts/types/factories/ERC20Permit__factory";
import { Tranche } from "elf-contracts/types/Tranche";
import { UserProxy } from "elf-contracts/types/UserProxy";
import { BigNumber, ethers, Signer } from "ethers";

import { fetchPermitData, PermitCallData } from "efi-ui/base/fetchPermitData";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { useUserProxy } from "efi-ui/mint/hooks/userProxy";
import { useTokenAllowance } from "efi-ui/token/hooks/useTokenAllowance";
import { useTranchePosition } from "efi-ui/tranche/useTranchePosition";
import { useTrancheUnlockTimestamp } from "efi-ui/tranche/useTrancheUnlockTimestamp";
import { useSmartContractTransactionPersisted } from "efi-ui/transactions/useSmartContractTransactionPersisted/useSmartContractTransactionPersisted";
import { flushPromises } from "efi/base/flush";
import { getSmartContractFromRegistry } from "efi/contracts/SmartContractsRegistry";
import { ContractMethodArgs } from "efi/contracts/types";

export function useRedeemTermAssetsToEth(
  signer: Signer | undefined,
  tranche: Tranche | undefined,
  account: string | null | undefined,
  // note both are required.  set to BigNumber.from(0) if you don't want that one.
  amountPrinicpalToken: BigNumber,
  amountYieldToken: BigNumber
): () => void {
  const { data: expiration } = useTrancheUnlockTimestamp(tranche);
  const { data: position } = useTranchePosition(tranche);

  const principalTokenContract = tranche as ERC20Permit;
  const { data: yieldTokenAddress } = useSmartContractReadCall(
    tranche,
    "interestToken"
  );
  const yieldTokenContract = getSmartContractFromRegistry(
    yieldTokenAddress,
    ERC20Permit__factory.connect
  );

  const userProxy = useUserProxy();
  const { mutate: withdrawToEth } = useSmartContractTransactionPersisted(
    userProxy,
    "withdrawWeth",
    signer
  );

  const { data: ptApproval } = useTokenAllowance(
    principalTokenContract,
    account,
    userProxy?.address
  );

  const { data: ytApproval } = useTokenAllowance(
    yieldTokenContract,
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
      !principalTokenContract ||
      !yieldTokenContract ||
      !ptApproval ||
      !ytApproval
    ) {
      return;
    }
    // we need an amount from at least one
    if (!amountPrinicpalToken.gt(0) && !amountYieldToken.gt(0)) {
      return;
    }

    // Note the trailing space is required
    const principalTokenName = "Principal Token ";

    const permits: PermitCallData[] = [];

    if (ptApproval.lt(amountPrinicpalToken)) {
      const ptPermitData = await fetchPermitData(
        signer,
        principalTokenContract,
        principalTokenName,
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

    // Note the trailing space is required
    const yieldTokenName = "Element Yield Token ";

    if (ytApproval.lt(amountYieldToken)) {
      const ytPermitData = await fetchPermitData(
        signer,
        yieldTokenContract,
        yieldTokenName,
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
    position,
    principalTokenContract,
    ptApproval,
    signer,
    userProxy,
    withdrawToEth,
    yieldTokenContract,
    ytApproval,
  ]);
}
export function makeWithdrawInterestToEthCallArgs(
  expiration: BigNumber,
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
