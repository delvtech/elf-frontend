import React, { Fragment, ReactElement, useCallback, useState } from "react";
import { Link } from "@reach/router";

import { Button, Intent, Callout } from "@blueprintjs/core";
import classNames from "classnames";
import { Web3Provider } from "@ethersproject/providers";
import { AbstractConnector } from "@web3-react/abstract-connector";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { useCryptoBalance } from "efi-ui/crypto/hooks/useCryptoBalance/useCryptoBalance";
import { useCryptoDecimals } from "efi-ui/crypto/hooks/useCryptoDecimals/useCryptoDecimals";
import { parseUnits } from "ethers/lib/utils";
import { useMintPreview } from "efi-ui/mint/hooks/useMintPreview";
import { MintTransactionConfirmationDrawer } from "efi-ui/mint/MintTransactionConfirmationDrawer/MintTransactionConfirmationDrawer";
import { MintInput } from "efi-ui/mint/MintInput/MintInput";
import { formatBalance } from "efi/base/formatBalance";
import { useNumericInput } from "efi-ui/base/hooks/useNumericInput/useNumericInput";
import { CryptoAsset } from "efi/crypto/CryptoAsset";
import { TokenIcon } from "efi-ui/token/TokenIcon";
import { Tranche } from "elf-contracts/types/Tranche";

import styles from "./MintCard.module.css";

// Stop propagation of clicks from the card title up to the card itself,
// otherwise you get double routed to /exchange/exchange/0xdeadbeef
const stopPropagationHandler = (e: React.MouseEvent<HTMLAnchorElement>) => {
  e.stopPropagation();
};

interface MintCardProps {
  baseAsset: CryptoAsset | undefined;
  baseAssetIcon: TokenIcon | undefined;
  baseAssetSymbol: string | undefined;
  tranche: Tranche | undefined;
  library: Web3Provider | undefined;
  account: string | null | undefined;
  chainId: number | undefined;
  walletConnectionActive: boolean;
  connector: AbstractConnector | undefined;
}

function useActiveMintPreview(
  activeTranche: Tranche | undefined,
  amountIn: number
) {
  const numPrincipalTokensOut = useMintPreview(
    activeTranche,
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
    tranche,
  } = props;

  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const {
    stringValue: amountInString,
    setValue: setAmountIn,
  } = useNumericInput({
    // no one needs to put in more than a trillion anything
    max: 999_999_999_999,
  });

  const amountIn = +(amountInString || 0);

  const baseAssetDecimals = useCryptoDecimals(baseAsset);
  const baseAssetBalance = useCryptoBalance(library, account, baseAsset);

  const activeBaseAssetDisplayBalance = formatBalance(
    baseAssetBalance,
    baseAssetDecimals
  );

  const { numPrincipalTokensOut, numYieldTokensOut } = useActiveMintPreview(
    tranche,
    amountIn
  );

  const insufficientBalance = parseUnits(
    amountInString ?? t`0`,
    baseAssetDecimals
  ).gt(baseAssetBalance ?? 0);

  const mintButtonDisabled = insufficientBalance || !amountIn || !account;

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
  return (
    <Fragment>
      <div className={styles.lineBreak} />
      <div className={tw("flex", "pl-12", "pt-4", "items-center")}>
        <div
          className={classNames(styles.circledNumber, tw("mr-4", "text-lg"))}
        >
          1
        </div>
        <div className={tw("text-lg")}>Mint</div>
      </div>
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
              text={t`${numPrincipalTokensOut || 0} eP:yETH`}
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
              text={t`${numYieldTokensOut || 0} eP:yETH`}
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
            onClick={() => setDrawerOpen(true)}
          >
            {mintButtonLabel}
          </Button>
        </div>
      </div>
      <div className={classNames(styles.lineBreak, tw("mt-4"))} />
      <div className={tw("flex", "pl-12", "pt-4", "items-center")}>
        <div
          className={classNames(styles.circledNumber, tw("mr-4", "text-lg"))}
        >
          2
        </div>
        <div className={tw("text-lg")}>Stake Your Tokens or Sell Principal</div>
      </div>
      <div className={tw("flex", "pl-12", "pt-2", "mb-6", "items-center")}>
        <div className={"ml-10 text-sm"}>
          Go to the{" "}
          <Link to={`/portfolio`} onClick={stopPropagationHandler}>
            Portfolio Page
          </Link>
          . <br />
          Stake your tokens for additional APY. <br />
          Or sell your principal to re-invest.
        </div>
      </div>
      <MintTransactionConfirmationDrawer
        baseAsset={baseAsset}
        baseAssetIcon={baseAssetIcon}
        tranche={tranche}
        account={account}
        library={library}
        amountIn={amountInString}
        isOpen={isDrawerOpen}
        onClose={onClose}
      />
    </Fragment>
  );
}
