import React, { Fragment, ReactElement, useCallback, useState } from "react";

import { Button, Callout, Intent } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import classNames from "classnames";
import { parseUnits } from "ethers/lib/utils";
import { PrincipalTokenInfo as TrancheInfo } from "tokenlists/types";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { useNumericInput } from "efi-ui/base/hooks/useNumericInput/useNumericInput";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { findAssetIcon2 } from "efi-ui/crypto/CryptoIcon";
import { useCryptoBalanceOf } from "efi-ui/crypto/hooks/useCryptoBalance/useCryptoBalance";
import { useMintPreview } from "efi-ui/mint/hooks/useMintPreview";
import { MintInput } from "efi-ui/mint/MintInput/MintInput";
import { MintTransactionConfirmationDrawer } from "efi-ui/mint/MintTransactionConfirmationDrawer/MintTransactionConfirmationDrawer";
import { TokenIcon } from "efi-ui/token/TokenIcon";
import { ConnectWalletDialog } from "efi-ui/wallets/ConnectWalletDialog/ConnectWalletDialog";
import { formatBalance } from "efi/base/formatBalance";
import { getCryptoAssetForToken } from "efi/crypto/getCryptoAssetForToken";
import { getCryptoDecimals } from "efi/crypto/getCryptoDecimals";
import { getCryptoSymbol } from "efi/crypto/getCryptoSymbol";
import { interestTokenContractsByAddress } from "efi/interestToken/interestToken";
import { getTermAssetSymbol } from "efi/tranche/getTermAssetSymbol";
import { trancheContractsByAddress } from "efi/tranche/tranches";
import { getVaultSymbol } from "efi/vaults/getVaultSymbol";

import styles from "./MintCard.module.css";

interface MintCardProps {
  library: Web3Provider | undefined;
  account: string | null | undefined;
  trancheInfo: TrancheInfo;
}

function useActiveMintPreview(
  activeTrancheInfo: TrancheInfo,
  amountIn: number
) {
  const numPrincipalTokensOut = useMintPreview(
    activeTrancheInfo,
    amountIn
  )?.toFixed(4);

  // You will always receive the same amount of yield tokens as the amount of
  // base asset you put in
  const numYieldTokensOut = amountIn?.toFixed(4);

  return { numPrincipalTokensOut, numYieldTokensOut };
}

export function MintCard(props: MintCardProps): ReactElement | null {
  const { library, account, trancheInfo } = props;

  const { interestToken, underlying } = trancheInfo.extensions;

  const baseAsset = getCryptoAssetForToken(underlying);
  const baseAssetSymbol = getCryptoSymbol(baseAsset) as string;
  const BaseAssetIcon = findAssetIcon2(baseAsset);
  const vaultSymbol = getVaultSymbol(baseAsset) as string;

  const principalTokenContract = trancheContractsByAddress[trancheInfo.address];
  const yieldTokenContract = interestTokenContractsByAddress[interestToken];

  const { symbol: yieldTokenSymbol = "" } = getTermAssetSymbol(
    yieldTokenContract.address,
    vaultSymbol
  );
  const { symbol: principalTokenSymbol = "" } = getTermAssetSymbol(
    principalTokenContract.address,
    vaultSymbol
  );

  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [isWalletDialogOpen, setWalletDialogOpen] = useState(false);

  const { stringValue: amountInString, setValue: setAmountIn } =
    useNumericInput();

  const amountIn = +(amountInString || 0);

  const baseAssetDecimals = getCryptoDecimals(baseAsset);
  const baseAssetBalance = useCryptoBalanceOf(library, account, baseAsset);

  const activeBaseAssetDisplayBalance = formatBalance(
    baseAssetBalance,
    baseAssetDecimals
  );

  const { numPrincipalTokensOut, numYieldTokensOut } = useActiveMintPreview(
    trancheInfo,
    amountIn
  );

  const insufficientBalance = parseUnits(
    amountInString || t`0`,
    baseAssetDecimals
  ).gt(baseAssetBalance ?? 0);

  const mintButtonDisabled = !!account && (insufficientBalance || !amountIn);

  let mintButtonLabel = t`Mint tokens`;
  let mintButtonError = false;

  if (!amountIn) {
    mintButtonLabel = t`Enter an amount`;
  }
  if (insufficientBalance && account) {
    mintButtonError = true;
    mintButtonLabel = t`Insufficient balance`;
  }
  if (!account) {
    mintButtonLabel = t`Connect wallet`;
  }

  const onClose = useCallback(() => {
    setDrawerOpen(false);
    setAmountIn("");
  }, [setAmountIn]);

  const onClick = useCallback(
    (event) => {
      if (!account) {
        return setWalletDialogOpen(true);
      }

      setDrawerOpen(true);
    },
    [account, setDrawerOpen]
  );

  return (
    <Fragment>
      <div className={tw("pl-24", "pt-4", "-ml-1")}>
        <div className={styles.mintInput}>
          <MintInput
            cryptoDecimals={baseAssetDecimals}
            cryptoBalanceOf={baseAssetBalance}
            cryptoDisplayBalance={activeBaseAssetDisplayBalance || ""}
            cryptoSymbol={baseAssetSymbol}
            cryptoIcon={BaseAssetIcon}
            disabled={false}
            onChange={setAmountIn}
            value={amountInString}
            onPreviewUpdate={emptyHandler}
            validValue={!mintButtonError}
          />
        </div>
        <div className={tw("flex", "mt-4")}>
          <Callout
            className={classNames(
              styles.callOut,
              tw("flex", "flex-col", "h-full", "items-center", "justify-center")
            )}
          >
            <LabeledText
              text={
                <Fragment>
                  <span>{`${numPrincipalTokensOut || (0).toFixed(4)}`}</span>
                  <span>{principalTokenSymbol}</span>
                </Fragment>
              }
              textClassName={tw("flex", "flex-col")}
              label={t`Principal Tokens`}
            />
          </Callout>
          <Callout
            className={classNames(
              styles.callOut,
              tw("flex", "flex-col", "h-full", "items-center", "justify-center")
            )}
          >
            <LabeledText
              text={
                <Fragment>
                  <span>{`${numYieldTokensOut || (0).toFixed(4)}`}</span>
                  <span>{yieldTokenSymbol}</span>
                </Fragment>
              }
              textClassName={tw("flex", "flex-col")}
              label={t`Yield Tokens`}
            />
          </Callout>
        </div>
        <div className={tw("mt-4")}>
          <Button
            minimal
            outlined
            disabled={mintButtonDisabled}
            intent={mintButtonError ? Intent.DANGER : Intent.PRIMARY}
            onClick={onClick}
          >
            {mintButtonLabel}
          </Button>
        </div>
      </div>
      <MintTransactionConfirmationDrawer
        baseAsset={baseAsset}
        baseAssetIcon={BaseAssetIcon as TokenIcon}
        principalTokenSymbol={principalTokenSymbol}
        yieldTokenSymbol={yieldTokenSymbol}
        trancheInfo={trancheInfo}
        account={account}
        library={library}
        amountIn={amountInString}
        isOpen={isDrawerOpen}
        onClose={onClose}
      />
      <ConnectWalletDialog
        isOpen={isWalletDialogOpen}
        onClose={() => setWalletDialogOpen(false)}
      />
    </Fragment>
  );
}

const emptyHandler = () => {};
