import React, { ReactElement } from "react";

import { Button, Intent } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { AbstractConnector } from "@web3-react/abstract-connector";
import { ERC20 } from "elf-contracts/types/ERC20";
import { BigNumber, Signer } from "ethers";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { SvgIcon } from "efi-ui/base/SvgIcon";
import { ERC20Shim } from "efi-ui/contracts/ERC20Shim";
import { ERC20ApproveButton } from "efi-ui/token/ERC20ApproveButton/ERC20ApproveButton";
import { useTokenAllowance } from "efi-ui/token/hooks/useTokenAllowance";
import {
  CryptoAsset,
  CryptoAssetType,
  findTokenContract,
} from "efi/crypto/CryptoAsset";

import { WalletApprovalCallout } from "./WalletApprovalCallout";
import { WalletDrawer } from "efi-ui/wallets/WalletDrawer/WalletDrawer";

interface TransactionDrawerProps {
  account: string | null | undefined;
  amountIn: BigNumber | undefined;
  assetIn: CryptoAsset | undefined;
  assetInIcon: SvgIcon | undefined;
  assetInSymbol?: string;
  chainId: number | undefined;
  connector: AbstractConnector | undefined;
  isOpen: boolean;
  library: Web3Provider | undefined;
  onClose: () => void;
  onConfirmTransaction: () => void;
  transactionDetails?: ReactElement | null;
  walletConnectionActive: boolean;
  walletApprovalMessageRenderer: (assetSymbol: string) => string;
  approvalSpenderAddress: string | undefined;
}

export function TransactionDrawer({
  account,
  amountIn,
  assetInIcon,
  assetInSymbol,
  assetIn,
  isOpen,
  library,
  onClose,
  onConfirmTransaction,
  transactionDetails,
  approvalSpenderAddress,
  walletApprovalMessageRenderer,
}: TransactionDrawerProps): ReactElement {
  const signer = account ? (library?.getSigner(account) as Signer) : undefined;

  // base asset calls
  const baseAssetContract = findTokenContract(assetIn);

  const { data: allowance } = useTokenAllowance(
    baseAssetContract as ERC20,
    account,
    approvalSpenderAddress
  );

  const confirmButtonLabel = getConfirmButtonLabel(account);
  const confirmButtonDisabled = getConfirmButtonDisabled(
    account,
    assetIn,
    amountIn,
    allowance
  );

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
              message={message}
              signer={signer}
              account={account}
              cryptoAsset={assetIn}
              approvalAmount={amountIn}
            />
          ) : null
        }

        <div className={tw("flex", "space-x-2")}>
          {
            // we can't pull this out to a new variable because typescript can't
            // narrow the type of baseAssetContract when referencing a variable
            account && assetIn?.type !== CryptoAssetType.ETHEREUM ? (
              <ERC20ApproveButton
                className={tw("h-16")}
                owner={account}
                spender={approvalSpenderAddress}
                approvalAmount={amountIn}
                contract={baseAssetContract as ERC20Shim}
                tokenSymbol={assetInSymbol}
                signer={signer}
              />
            ) : null
          }

          <Button
            fill
            disabled={confirmButtonDisabled}
            intent={Intent.PRIMARY}
            className={tw("h-16")}
            large
            outlined
            onClick={onConfirmTransaction}
          >
            {confirmButtonLabel}
          </Button>
        </div>
      </div>
    </WalletDrawer>
  );
}

function getConfirmButtonLabel(account: string | null | undefined) {
  if (!account) {
    return t`Connect your wallet to continue`;
  }

  return t`Confirm transaction`;
}
function getConfirmButtonDisabled(
  account: string | null | undefined,
  baseAsset: CryptoAsset | undefined,
  amountIn: BigNumber | undefined,
  marketAllowance: BigNumber | undefined
) {
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
