import { ZapSwapCurve } from "@elementfi/core-typechain/dist/v1.1/ZapSwapCurve";
import { zapSwapCurveContract } from "elf/zaps/zapSwapCurve/contracts";
import { ZapSwapCurveBuyInputs } from "elf/zaps/zapSwapCurve/createZapSwapCurveInputs";
import { serializeError } from "eth-rpc-errors";
import { ContractReceipt, Signer } from "ethers";
import { useCallback } from "react";
import { UseMutationResult } from "react-query";
import { AppToaster, makeErrorToast } from "ui/toaster/AppToaster/AppToaster";
import { useSmartContractTransactionPersisted } from "ui/transactions/useSmartContractTransactionPersisted/useSmartContractTransactionPersisted";

export function useZapIn(
  account: string | null | undefined,
  signer: Signer | undefined,
  { info, baseZap, metaZap }: ZapSwapCurveBuyInputs,
  onTransactionSubmitted?: () => void
): {
  zap: () => void;
  mutationResult: UseMutationResult<
    ContractReceipt | undefined,
    unknown,
    Parameters<ZapSwapCurve["zapIn"]>
  >;
} {
  const mutationResult = useSmartContractTransactionPersisted(
    zapSwapCurveContract,
    "zapIn",
    signer,
    {
      onTransactionSubmitted: () => {
        onTransactionSubmitted?.();
      },
      onError: (error) => {
        const serializedError = serializeError(error);
        AppToaster?.show(makeErrorToast(serializedError.message));
      },
    }
  );

  const { mutate: zap } = mutationResult;

  const onZap = useCallback(() => {
    zap([info, baseZap, metaZap, []]);
  }, [zap, info, baseZap, metaZap]);

  return { zap: onZap, mutationResult };
}
