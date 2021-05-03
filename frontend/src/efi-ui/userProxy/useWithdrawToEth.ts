import { BigNumber, BigNumberish, BytesLike, Signer } from "ethers";
import { ContractMethodArgs } from "efi/contracts/types";
import { UserProxy } from "elf-contracts/types/UserProxy";
import { Tranche } from "elf-contracts/types/Tranche";
import { useTrancheUnlockTimestamp } from "efi-ui/tranche/useTrancheUnlockTimestamp";
import { useTranchePosition } from "efi-ui/tranche/useTranchePosition";
import { useUserProxy } from "efi-ui/mint/hooks/userProxy";
import { useSmartContractTransactionPersisted } from "efi-ui/transactions/useSmartContractTransactionPersisted/useSmartContractTransactionPersisted";
import { useCallback } from "react";

interface PermitCallData {
  tokenContract: string;
  who: string;
  amount: BigNumberish;
  expiration: BigNumberish;
  r: BytesLike;
  s: BytesLike;
  v: BigNumberish;
}
export function useWithdrawInterestToEth(
  signer: Signer | undefined,
  tranche: Tranche | undefined,
  amountPT: BigNumber | undefined,
  amountYT: BigNumber | undefined
): () => void {
  const { data: expiration } = useTrancheUnlockTimestamp(tranche);
  const { data: position } = useTranchePosition(tranche);

  const withdrawInterestToEthCallArgs = makeWithdrawInterestToEthCallArgs(
    expiration,
    position,
    amountPT,
    amountYT,
    // TODO: add permit call data
    []
  );

  const userProxy = useUserProxy();
  const {
    mutate: withdrawInterestToEth,
  } = useSmartContractTransactionPersisted(userProxy, "withdrawWeth", signer);

  return useCallback(() => {
    if (!withdrawInterestToEthCallArgs) {
      return;
    }
    withdrawInterestToEth(withdrawInterestToEthCallArgs);
  }, [withdrawInterestToEth, withdrawInterestToEthCallArgs]);
}
export function makeWithdrawInterestToEthCallArgs(
  expiration: BigNumber | undefined,
  position: string | undefined,
  amountPT: BigNumber | undefined,
  amountYT: BigNumber | undefined,
  permitCallData: PermitCallData[]
): ContractMethodArgs<UserProxy, "withdrawWeth"> | undefined {
  if (!expiration || !position || !amountPT || !amountYT) {
    return undefined;
  }

  const callArgs: ContractMethodArgs<UserProxy, "withdrawWeth"> = [
    expiration,
    position,
    amountPT,
    amountYT,
    permitCallData,
  ];

  return callArgs;
}
