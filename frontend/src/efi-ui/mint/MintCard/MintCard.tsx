import React, { Fragment, ReactElement, useCallback, useState } from "react";

import { Button, Callout, Intent } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { Link } from "@reach/router";
import { AbstractConnector } from "@web3-react/abstract-connector";
import classNames from "classnames";
import { parseUnits } from "ethers/lib/utils";
import { PrincipalTokenInfo as TrancheInfo } from "tokenlists/types";
import { jt, t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { useNumericInput } from "efi-ui/base/hooks/useNumericInput/useNumericInput";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { useCryptoBalanceOf } from "efi-ui/crypto/hooks/useCryptoBalance/useCryptoBalance";
import { useMintPreview } from "efi-ui/mint/hooks/useMintPreview";
import { MintInput } from "efi-ui/mint/MintInput/MintInput";
import { MintTransactionConfirmationDrawer } from "efi-ui/mint/MintTransactionConfirmationDrawer/MintTransactionConfirmationDrawer";
import { TokenIcon } from "efi-ui/token/TokenIcon";
import { ConnectWalletDialog } from "efi-ui/wallets/ConnectWalletDialog/ConnectWalletDialog";
import { formatBalance } from "efi/base/formatBalance";
import { CryptoAsset } from "efi/crypto/CryptoAsset";
import { getCryptoDecimals } from "efi/crypto/getCryptoDecimals";

import styles from "./MintCard.module.css";

interface MintCardProps {
  library: Web3Provider | undefined;
  account: string | null | undefined;
  chainId: number | undefined;
  walletConnectionActive: boolean;
  connector: AbstractConnector | undefined;
  baseAsset: CryptoAsset;
  baseAssetIcon: TokenIcon;
  baseAssetSymbol: string;

  principalTokenSymbol: string;
  yieldTokenSymbol: string;
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
  const {
    library,
    account,
    baseAsset,
    baseAssetSymbol,
    baseAssetIcon,
    principalTokenSymbol,
    yieldTokenSymbol,
    trancheInfo: tranche,
  } = props;

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
    tranche,
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

  const link = (
    <Link key="porfolioLink" to={`/portfolio`}>
      {t`Portfolio Page`}
    </Link>
  );

  const portfolioLink = jt`Go to the ${link}.`;

  return (
    <Fragment>
      <div className={styles.lineBreak} />
      <div className={tw("pl-24", "pt-4", "-ml-1")}>
        <div className={styles.mintInput}>
          <MintInput
            cryptoDecimals={baseAssetDecimals}
            cryptoBalanceOf={baseAssetBalance}
            cryptoDisplayBalance={activeBaseAssetDisplayBalance || ""}
            cryptoSymbol={baseAssetSymbol}
            cryptoIcon={baseAssetIcon}
            disabled={false}
            onChange={setAmountIn}
            value={amountInString}
            onPreviewUpdate={() => {}}
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
      <div className={classNames(styles.lineBreak, tw("mt-4"))} />
      <div className={tw("flex", "pl-12", "pt-4", "items-center")}>
        <div
          className={tw("text-lg")}
        >{t`Stake Your Tokens or Sell Principal`}</div>
      </div>
      <div className={tw("flex", "pl-12", "pt-2", "mb-6", "items-center")}>
        <div className={"flex flex-col ml-10 text-sm"}>
          <span>{portfolioLink}</span>
          <span>{t`Stake your tokens for additional APY.`}</span>
          <span>{t`Or sell your principal to re-invest.`}</span>
        </div>
      </div>
      <MintTransactionConfirmationDrawer
        baseAsset={baseAsset}
        baseAssetIcon={baseAssetIcon}
        principalTokenSymbol={principalTokenSymbol}
        yieldTokenSymbol={yieldTokenSymbol}
        trancheInfo={tranche}
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
