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
import { useMintPreview } from "efi-ui/mint/hooks/useMintPreview";
import { MintTransactionConfirmationDrawer } from "efi-ui/mint/MintTransactionConfirmationDrawer/MintTransactionConfirmationDrawer";
import { PrincipalTokenPreview } from "efi-ui/mint/MintCard/PrincipalTokenPreview";
import { YieldTokenPreview } from "efi-ui/mint/MintCard/YieldTokenPreview";
import { TradeInputAlt } from "efi-ui/trade/TradeInput/TradeInputAlt";
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

  return (
    <Fragment>
      <div className={styles.lineBreak} />
      <div className={tw("flex", "pl-12", "pt-4", "items-center")}>
        <div
          className={tw("mr-4", "text-lg")}
          style={{
            width: "25px",
            height: "25px",
            lineHeight: "25x",
            borderRadius: "50%",
            textAlign: "center",
            background: "rgba(138, 155, 168, 0.2)",
            paddingTop: "2px",
          }}
        >
          1
        </div>
        <div className={tw("text-lg")}>Mint</div>
      </div>
      <div className={tw("pl-24", "pt-4", "-ml-1")}>
        <div className={tw("mb-1")}>
          Available: {activeBaseAssetDisplayBalance}
        </div>
        <div className={tw("flex", "items-center")}>
          <div style={{ maxWidth: "300px" }}>
            <TradeInputAlt
              cryptoAddress={baseAssetContract?.address}
              cryptoDecimals={baseAssetDecimals}
              cryptoBalanceOf={baseAssetBalance}
              cryptoDisplayBalance={activeBaseAssetDisplayBalance || ""}
              cryptoSymbol={baseAssetSymbol}
              cryptoIcon={baseAssetIcon}
              previewCryptoAddress={""}
              previewCryptoPoolIndex={1}
              labelTopLeft={t`Mint`}
              disabled={false}
              swapKind={0}
              pool={pool}
              onChange={setAmountIn}
              onPreviewUpdate={() => {}}
              value={amountInString}
              validValue={true}
            />
          </div>
        </div>
        <div className={tw("flex", "mt-4")}>
          <Callout
            style={{
              width: "145px",
              textAlign: "center",
              marginRight: "10px",
            }}
            className={tw(
              "flex",
              "flex-col",
              "h-full",
              "items-center",
              "justify-center"
            )}
          >
            <LabeledText
              text={`${numPrincipalTokensOut || 0} eP:yETH`}
              label={`Principal Tokens`}
            />
          </Callout>
          <Callout
            style={{ width: "145px", textAlign: "center" }}
            className={tw(
              "flex",
              "flex-col",
              "h-full",
              "items-center",
              "justify-center"
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
            intent="primary"
            onClick={() => setDrawerOpen(true)}
          >
            Mint Tokens
          </Button>
        </div>
      </div>
      <div className={classNames(styles.lineBreak, tw("mt-4"))} />
      <div className={tw("flex", "pl-12", "pt-4", "items-center")}>
        <div
          className={tw("mr-4", "text-lg")}
          style={{
            width: "25px",
            height: "25px",
            lineHeight: "25x",
            borderRadius: "50%",
            textAlign: "center",
            background: "rgba(138, 155, 168, 0.2)",
            paddingTop: "2px",
          }}
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
