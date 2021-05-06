import React, { ReactElement, useMemo } from "react";

import { Button, Intent, Tag } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { ERC20 } from "elf-contracts/types/ERC20";
import { ERC20Permit } from "elf-contracts/types/ERC20Permit";
import { BigNumber, Signer } from "ethers";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { useTokenAllowance } from "efi-ui/token/hooks/useTokenAllowance";
import { WalletDrawer } from "efi-ui/wallets/WalletDrawer/WalletDrawer";
import {
  CryptoAsset,
  CryptoAssetType,
  findTokenContract,
} from "efi/crypto/CryptoAsset";

import { WalletApprovalCallout } from "./WalletApprovalCallout";
import { IconNames } from "@blueprintjs/icons";

interface TransactionDrawerProps {
  account: string | null | undefined;
  amountIn: BigNumber | undefined;
  assetIn: CryptoAsset | undefined;
  assetInSymbol?: string;
  isOpen: boolean;
  library: Web3Provider | undefined;
  onClose: () => void;
  onConfirmTransaction: () => void;
  transactionDetails?: ReactElement | null;
  buttonLabel: string;
  walletApprovalMessageRenderer: (assetSymbol: string) => string;
  approvalSpenderAddress: string | undefined;
  transactionPending?: boolean;
  transactionSuccess?: boolean;
  transactionFailed?: boolean;
}

export function TransactionDrawer({
  account,
  amountIn,
  assetInSymbol,
  assetIn,
  isOpen,
  library,
  onClose,
  onConfirmTransaction,
  transactionDetails,
  buttonLabel,
  approvalSpenderAddress,
  walletApprovalMessageRenderer,
  transactionPending = false,
  transactionSuccess = false,
  transactionFailed = false,
}: TransactionDrawerProps): ReactElement {
  const signer = account ? (library?.getSigner(account) as Signer) : undefined;

  const assetInContract = useAssetSignedContract(assetIn, signer);

  const { data: allowance } = useTokenAllowance(
    assetInContract as ERC20,
    account,
    approvalSpenderAddress
  );

  const confirmButtonLabel = getConfirmButtonLabel(
    buttonLabel,
    account,
    transactionFailed
  );

  const confirmButtonDisabled = getConfirmButtonDisabled(
    account,
    assetIn,
    amountIn,
    allowance,
    transactionPending
  );
  const buttonIntent = getConfirmButtonIntent(
    transactionSuccess,
    transactionFailed
  );
  const helperText = getHelperText(transactionSuccess, transactionFailed);

  const message = assetInSymbol
    ? walletApprovalMessageRenderer(assetInSymbol)
    : undefined;

  return (
    <WalletDrawer isOpen={isOpen} onClose={onClose}>
      <div
        className={tw(
          "flex",
          "flex-col",
          "flex-1",
          "space-y-10",
          "justify-end"
        )}
      >
        {transactionDetails}
        {
          // we can't pull this out to a new variable because typescript can't
          // narrow the type of baseAssetContract when referencing a variable
          account && message && assetIn?.type !== CryptoAssetType.ETHEREUM ? (
            <WalletApprovalCallout
              spenderAddress={approvalSpenderAddress}
              message={message}
              signer={signer}
              account={account}
              cryptoAsset={assetIn}
              approvalAmount={amountIn}
            />
          ) : null
        }

        <div className={tw("flex", "flex-col", "space-y-2")}>
          <Button
            loading={transactionPending}
            fill
            disabled={confirmButtonDisabled}
            intent={buttonIntent}
            className={tw("h-16")}
            large
            outlined
            onClick={onConfirmTransaction}
          >
            {confirmButtonLabel}
          </Button>
          {helperText && (
            <Tag
              intent={buttonIntent}
              minimal
              large
              fill
              icon={
                transactionSuccess
                  ? IconNames.TICK_CIRCLE
                  : IconNames.WARNING_SIGN
              }
            >
              {helperText}
            </Tag>
          )}
        </div>
      </div>
    </WalletDrawer>
  );
}

function getConfirmButtonIntent(
  transactionSuccess: boolean,
  transactionError: boolean
) {
  let buttonIntent: Intent = Intent.PRIMARY;
  if (transactionSuccess) {
    buttonIntent = Intent.SUCCESS;
  }
  if (transactionError) {
    buttonIntent = Intent.DANGER;
  }
  return buttonIntent;
}

function getHelperText(transactionSuccess: boolean, transactionError: boolean) {
  if (transactionSuccess) {
    return `Transaction succeeded`;
  }
  if (transactionError) {
    return `Transaction failed`;
  }
}

function getConfirmButtonLabel(
  label: string,
  account: string | null | undefined,
  transactionError: boolean
) {
  if (!account) {
    return t`Connect your wallet to continue`;
  }
  if (transactionError) {
    return `Retry ${label}`;
  }

  return label;
}

function getConfirmButtonDisabled(
  account: string | null | undefined,
  baseAsset: CryptoAsset | undefined,
  amountIn: BigNumber | undefined,
  marketAllowance: BigNumber | undefined,
  transactionPending: boolean
) {
  if (transactionPending) {
    return true;
  }

  // can't confirm anything w/out a base asset
  if (!baseAsset) {
    return true;
  }

  // must be connected to click this button
  if (!account) {
    return true;
  }

  // disabled when no amount is entered
  if (!amountIn) {
    return true;
  }

  // disabled if it's an erc20 or erc20permits w/out enough allowance.
  // NOTE: we have to use approvals for erc20permits because balancer does not
  // support that
  if (
    [CryptoAssetType.ERC20, CryptoAssetType.ERC20PERMIT].includes(
      baseAsset.type
    )
  ) {
    const hasEnoughAllowance = marketAllowance?.gte(amountIn);
    if (!hasEnoughAllowance) {
      return true;
    }
  }

  // otherwise the button should not be disabled
  return false;
}

function useAssetSignedContract(
  asset: CryptoAsset | undefined,
  signer: Signer | undefined
): ERC20 | ERC20Permit | undefined {
  const assetContract = useMemo(() => {
    const tokenContract = findTokenContract(asset);
    if (signer && tokenContract) {
      return tokenContract.connect(signer);
    }
  }, [asset, signer]);

  return assetContract;
}
