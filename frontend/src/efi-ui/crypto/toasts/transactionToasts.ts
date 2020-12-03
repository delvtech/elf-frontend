import { Intent } from "@blueprintjs/core";
import { ContractTransaction } from "ethers";
import { t } from "ttag";

import {
  AppToaster,
  makeErrorToast,
  makeSuccessToast,
} from "efi-ui/toaster/AppToaster/AppToaster";

export function showSuccessfulTransactionToast(
  transaction: ContractTransaction
) {
  AppToaster.show({
    ...makeSuccessToast(t`View transaction on etherscan`),
    intent: Intent.PRIMARY,
    action: {
      href: `https://etherscan.io/tx/${transaction?.hash}`,
      text: "View",
      intent: Intent.SUCCESS,
    },
  });
}

export function showFailedTransactionToast() {
  AppToaster.show({
    ...makeErrorToast(t`Transaction failed`),
    intent: Intent.DANGER,
  });
}
