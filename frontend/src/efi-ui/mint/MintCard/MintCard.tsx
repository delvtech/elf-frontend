import React, { Fragment, ReactElement, useState } from "react";

import { Button, Card, Callout } from "@blueprintjs/core";
import classNames from "classnames";
import { Web3Provider } from "@ethersproject/providers";
import { AbstractConnector } from "@web3-react/abstract-connector";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { useCryptoBalance } from "efi-ui/crypto/hooks/useCryptoBalance/useCryptoBalance";
import { useCryptoDecimals } from "efi-ui/crypto/hooks/useCryptoDecimals/useCryptoDecimals";
import { ERC20 } from "elf-contracts/types/ERC20";
import { parseUnits } from "ethers/lib/utils";
import { useMintPreview } from "efi-ui/mint/hooks/useMintPreview";
import { MintTransactionConfirmationDrawer } from "efi-ui/mint/MintTransactionConfirmationDrawer/MintTransactionConfirmationDrawer";
import { PrincipalTokenPreview } from "efi-ui/mint/MintCard/PrincipalTokenPreview";
import { YieldTokenPreview } from "efi-ui/mint/MintCard/YieldTokenPreview";
import { MintInput } from "efi-ui/mint/MintInput/MintInput";
import { formatBalance } from "efi/base/formatBalance";
import { useNumericInput } from "efi-ui/base/hooks/useNumericInput/useNumericInput";
import { CryptoAsset } from "efi/crypto/CryptoAsset";
import { PoolContract } from "efi/pools/PoolContract";
import { TokenIcon } from "efi-ui/token/TokenIcon";
import { Tranche } from "elf-contracts/types/Tranche";

import styles from "./MintCard.module.css";

interface MintCardProps {
  baseAsset: CryptoAsset | undefined;
  baseAssetIcon: TokenIcon | undefined;
  baseAssetContract: ERC20 | undefined;
  baseAssetSymbol: string | undefined;
  tranche: Tranche | undefined;
  pool: PoolContract | undefined;
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
  const numPrincipalTokensOut = useMintPreview(activeTranche, amountIn);

  // You will always receive the same amount of yield tokens as the amount of
  // base asset you put in
  const numYieldTokensOut = amountIn;

  return { numPrincipalTokensOut, numYieldTokensOut };
}

export function MintCard(props: MintCardProps): ReactElement | null {
  const {
    pool,
    library,
    account,
    chainId,
    walletConnectionActive,
    connector,
    baseAsset,
    baseAssetContract,
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
    amountInString ?? "0",
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
            labelTopLeft={t`Mint`}
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
              text={`${numPrincipalTokensOut || 0} eP:yETH`}
              label={`Principal Tokens`}
            />
          </Callout>
          <Callout
            className={classNames(
              styles.callOut,
              tw("flex", "flex-col", "h-full", "items-center", "justify-center")
            )}
          >
            <LabeledText
              text={`${numYieldTokensOut || 0} eP:yETH`}
              label={`Yield Tokens`}
            />
          </Callout>
        </div>
        <div className={tw("mt-4")}>
          <Button
            minimal
            outlined
            disabled={mintButtonDisabled}
            intent={mintButtonError ? "danger" : "primary"}
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
        <div className={"ml-10 bp3-text-muted text-sm"}>
          Go to the <a>Portfolio Page</a>. <br />
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
        chainId={chainId}
        walletConnectionActive={walletConnectionActive}
        connector={connector}
        amountIn={amountInString}
        isOpen={isDrawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </Fragment>
  );
}
