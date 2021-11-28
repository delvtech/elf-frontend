import { useEffect } from "react";

import { t } from "ttag";

import {
  AppToaster,
  makeErrorToast,
  makeSuccessToast,
} from "efi-ui/toaster/AppToaster/AppToaster";
import { AddressesJson } from "efi/addresses";
import { ChainId, ChainNames } from "efi/ethereum";
import { usePrevious } from "react-use";

export function useToastWrongChain(connectedChainId: number | undefined): void {
  useEffect(() => {
    if (connectedChainId === undefined) {
      return;
    }
    if (AddressesJson.chainId !== connectedChainId) {
      const chainName = ChainNames[AddressesJson.chainId as ChainId];
      AppToaster?.show(
        makeErrorToast(
          t`Wrong chain detected! Please connect to ${chainName}`,
          undefined,
          undefined,
          0
        )
      );
    }
  }, [connectedChainId]);

  const prevChainId = usePrevious(connectedChainId);
  useEffect(() => {
    if (
      prevChainId !== undefined &&
      AddressesJson.chainId !== prevChainId &&
      AddressesJson.chainId === connectedChainId
    ) {
      const chainName = ChainNames[AddressesJson.chainId as ChainId];
      AppToaster?.show(
        makeSuccessToast(t`Connected to ${chainName}!`, undefined, 0)
      );
    }
  }, [connectedChainId, prevChainId]);
}
