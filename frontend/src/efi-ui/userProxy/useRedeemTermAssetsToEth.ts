import { useCallback } from "react";

import { ERC20Permit } from "elf-contracts/types/ERC20Permit";
import { ERC20Permit__factory } from "elf-contracts/types/factories/ERC20Permit__factory";
import { Tranche } from "elf-contracts/types/Tranche";
import { UserProxy } from "elf-contracts/types/UserProxy";
import { BigNumber, ethers, Signer } from "ethers";

import { fetchPermitData, PermitCallData } from "efi-ui/base/fetchPermitData";
import { getSmartContractFromRegistry } from "efi/contracts/SmartContractsRegistry";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { useUserProxy } from "efi-ui/mint/hooks/userProxy";
import { useTranchePosition } from "efi-ui/tranche/useTranchePosition";
import { useTrancheUnlockTimestamp } from "efi-ui/tranche/useTrancheUnlockTimestamp";
import { useSmartContractTransactionPersisted } from "efi-ui/transactions/useSmartContractTransactionPersisted/useSmartContractTransactionPersisted";
import { ContractMethodArgs } from "efi/contracts/types";
import { flushPromises } from "efi/base/flush";

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

  return useCallback(async () => {
    if (
      !signer ||
      !account ||
      !userProxy ||
      !expiration ||
      !position ||
      !principalTokenContract ||
      !yieldTokenContract
    ) {
      return;
    }
    // we need an amount from at least one
    if (!amountPrinicpalToken.gt(0) && !amountYieldToken.gt(0)) {
      return;
    }

    // TODO: check approval for this token first
    const ptPermitData = await fetchPermitData(
      signer,
      principalTokenContract,
      account,
      userProxy.address,
      ethers.constants.MaxUint256,
      "1"
    );

    await flushPromises(100);

    // TODO: check approval for this token first
    const ytPermitData = await fetchPermitData(
      signer,
      yieldTokenContract,
      account,
      userProxy.address,
      ethers.constants.MaxUint256,
      "1"
    );

    await flushPromises(100);

    if (!ptPermitData || !ytPermitData) {
      return;
    }

    const withdrawInterestToEthCallArgs = makeWithdrawInterestToEthCallArgs(
      expiration,
      position,
      amountPrinicpalToken,
      amountYieldToken,
      [ptPermitData, ytPermitData]
    );

    withdrawToEth(withdrawInterestToEthCallArgs);
  }, [
    account,
    amountPrinicpalToken,
    amountYieldToken,
    expiration,
    position,
    principalTokenContract,
    signer,
    userProxy,
    withdrawToEth,
    yieldTokenContract,
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
