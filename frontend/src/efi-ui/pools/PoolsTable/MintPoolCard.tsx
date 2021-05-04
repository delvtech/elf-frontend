import {
  CSSProperties,
  ReactElement,
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Button,
  Card,
  Callout,
  Classes,
  Colors,
  Collapse,
  Divider,
  Elevation,
  Tag,
} from "@blueprintjs/core";
import { Link, navigate } from "@reach/router";
import classNames from "classnames";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { TimeLeft } from "efi-ui/base/TimeLeft/TimeLeft";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { findAssetIcon } from "efi-ui/crypto/CryptoIcon";
import { useCryptoAssetForToken } from "efi-ui/crypto/hooks/useCryptoAssetForToken";
import { useCryptoSymbol } from "efi-ui/crypto/hooks/useCryptoSymbol/useCryptoSymbol";
import { useBaseAssetForPool } from "efi-ui/pools/useBaseAssetForPool/useBaseAssetForPool";
import { useFeeVolumeForPool } from "efi-ui/pools/useFeeVolumeForPool/useFeeVolumeForPool";
import { usePoolPairedToken } from "efi-ui/pools/usePoolPairedToken/usePoolPairedToken";
import { TradeInputAlt } from "efi-ui/trade/TradeInput/TradeInputAlt";
import { useTrancheForPool } from "efi-ui/pools/useTrancheForPool/useTrancheForPool";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { useTermAssetSymbol } from "efi-ui/tranche/useTermAssetSymbol";
import { useTrancheCreatedAt } from "efi-ui/tranche/useTrancheCreatedAt";
import { formatMoney } from "efi/money/formatMoney";
import { PoolContract } from "efi/pools/PoolContract";

import styles from "./PrincipalPoolCard.module.css";
import { useTotalFiatLiquidityForPool } from "efi-ui/pools/useTotalFiatLiquidityForPool.ts/useTotalFiatLiquidityForPool";

interface MintPoolCardProps {
  pool: PoolContract | undefined;
}

const cellClassName = tw("flex", "mr-4", "items-center", "overflow-hidden");

const poolCardStyle: CSSProperties = {
  maxWidth: 1180,
  minWidth: 560,
  padding: "0px",
};
// Stop propagation of clicks from the card title up to the card itself,
// otherwise you get double routed to /exchange/exchange/0xdeadbeef
const stopPropagationHandler = (e: React.MouseEvent<HTMLAnchorElement>) => {
  e.stopPropagation();
};

export function MintPoolCard(props: MintPoolCardProps): ReactElement | null {
  const { pool } = props;
  const tranche = useTrancheForPool(pool);
  const liquidity = useTotalFiatLiquidityForPool(pool);
  const trancheCreatedAt = useTrancheCreatedAt(tranche);
  const fees = useFeeVolumeForPool(pool) ?? 0;
  const baseAssetContract = useBaseAssetForPool(pool);
  const baseAsset = useCryptoAssetForToken(baseAssetContract?.address);
  const baseAssetSymbol = useCryptoSymbol(baseAsset);
  const BaseAssetIcon = findAssetIcon(baseAssetSymbol);
  const termAssetContract = usePoolPairedToken(pool, baseAssetContract);
  const { symbol: termAssetSymbol } = useTermAssetSymbol(
    termAssetContract?.address,
    baseAssetSymbol
  );
  const { data: unlockBN } = useSmartContractReadCall(
    tranche,
    "unlockTimestamp"
  );
  const unlockTime = unlockBN?.toNumber();

  // TODO: Get this from props
  const goToPoolPage = useCallback(() => {
    navigate(`pools/${pool?.address}`);
  }, [pool?.address]);

  const { isDarkMode } = useDarkMode();

  // TODO: this is a big hammer for loading state.  we should use a more granular technique when we can.
  const dataToLoad = [
    tranche,
    liquidity,
    trancheCreatedAt,
    fees,
    baseAssetContract,
    baseAsset,
    baseAssetSymbol,
    BaseAssetIcon,
    termAssetContract,
    termAssetSymbol,
    unlockBN,
  ];
  // TODO: this is a big hammer for loading state.  we should use a more granular technique when we can.
  const allDataLoaded = dataToLoad.every((data) => data !== undefined);

  const [transitionsEnabled, setTransitionsEnabled] = useState(true);
  const [isOpen, setOpen] = useState(false);
  console.log(styles);

  // One tme useEffect to let us show transitions for the skeletons once the data is loaded.
  // Afterwards we disable transitions so they don't interfere with light/dark mode switching.
  useEffect(() => {
    if (allDataLoaded) {
      setTimeout(() => {
        setTransitionsEnabled(false);
      }, 1000);
    }
  }, [allDataLoaded]);

  if (!pool || !baseAssetContract) {
    return null;
  }

  const startTime = trancheCreatedAt ? trancheCreatedAt * 1000 : undefined;
  const maturityTime = unlockTime ? unlockTime * 1000 : undefined;

  if (!allDataLoaded) {
    return (
      <Card
        elevation={Elevation.TWO}
        interactive
        onClick={goToPoolPage}
        style={poolCardStyle}
        className={classNames(
          Classes.SKELETON,
          tw("h-24", "w-full", "transition", "duration-1000", "ease-in-out")
        )}
      ></Card>
    );
  }

  return (
    <Card
      elevation={Elevation.TWO}
      interactive
      style={poolCardStyle}
      className={classNames(
        styles.gridColsPoolCard,
        tw("w-full", {
          transition: transitionsEnabled,
          "duration-1000": transitionsEnabled,
          "ease-in-out": transitionsEnabled,
        })
      )}
    >
      <div className={tw("w-full", "flex")} style={{ padding: "20px" }}>
        <div
          className={tw(
            "w-full",
            "grid",
            "grid-cols-12",
            "gap-y-4",
            "w-full",
            "items-start"
          )}
        >
          <div
            className={tw(
              cellClassName,
              "col-span-2",
              "sm:mr-0",
              "md:col-span-1",
              "xl:ml-4",
              "items-center"
            )}
          >
            {BaseAssetIcon && baseAssetSymbol === "ETH" ? (
              <div
                className={classNames(
                  tw(
                    "items-start",
                    "justify-center",
                    "rounded",
                    "-mt-2",
                    "p-2",
                    "flex-shrink-0"
                  )
                )}
              >
                <div
                  style={{
                    borderColor: isDarkMode ? Colors.GRAY5 : undefined,
                    backgroundColor: isDarkMode ? Colors.WHITE : undefined,
                  }}
                  className={tw(
                    "items-start",
                    "p-2",
                    "rounded-full",
                    "z-10",
                    "bg-white",
                    "border",
                    "shadow-sm"
                  )}
                >
                  <BaseAssetIcon height={18} width={18} />
                </div>
              </div>
            ) : BaseAssetIcon ? (
              <div className={tw("ml-2")}>
                <BaseAssetIcon height={40} width={40} />
              </div>
            ) : null}
          </div>
          <div
            className={tw(
              cellClassName,
              "col-span-2",
              "lg:col-span-2",
              "xl:col-span-1",
              "lg:col-span-1"
            )}
          >
            <LabeledText text={"Yearn ySTETH"} label={`Vault`} />
          </div>
          <div
            className={tw(
              cellClassName,
              "col-span-2",
              "md:col-span-2",
              "xl:col-span-1"
            )}
          >
            <LabeledText text={"90 Day"} label={`Term`} />
          </div>
          <div
            className={tw(
              cellClassName,
              "col-span-2",
              "md:col-span-2",
              "xl:col-span-1"
            )}
          >
            <LabeledText text={"20%"} label={`Vault APY`} />
          </div>
          <div
            className={tw(
              cellClassName,
              "col-span-3",
              "xl:col-span-2",
              "lg:col-span-2"
            )}
          >
            <LabeledText
              text={formatMoney(liquidity, { wholeAmounts: true })}
              label={`Principal Pool Liquidity`}
            />
          </div>
          <div
            className={tw(
              cellClassName,
              "col-span-3",
              "col-start-3",
              "lg:col-span-2",
              "xl:col-span-2"
            )}
          >
            <LabeledText
              text={formatMoney(liquidity, { wholeAmounts: true })}
              label={`Yield Pool Liquidity`}
            />
          </div>
          <div
            className={tw(
              cellClassName,
              "col-span-2",
              "md:col-span-2",
              "lg:col-start-4",
              "xl:col-start-auto",
              "xl:col-span-1"
            )}
          >
            <LabeledText text={".97 ETH"} label={`Principal Price`} />
          </div>
          <div
            className={tw(
              cellClassName,
              "overflow-visible",
              "sm:ml-0",
              "col-span-4",
              "sm:col-span-3",
              "md:col-span-5",
              "lg:col-span-4",
              "xl:col-span-3"
            )}
          >
            <div className={tw("flex", "w-full")}>
              <div>
                {startTime && maturityTime && Date.now() < maturityTime ? (
                  <Tag intent="primary" className={tw("mr-4", "flex-grow-0")}>
                    Running
                  </Tag>
                ) : (
                  <Tag intent="success" className={tw("mr-4", "flex-grow-0")}>
                    Matured
                  </Tag>
                )}
              </div>
              <div className={tw("flex-1", "-mt-2")}>
                <TimeLeft startDate={startTime} maturityDate={maturityTime} />
              </div>
            </div>
          </div>
        </div>
        <div
          className={tw("flex", "flex-col", "overflow-visible", "items-start")}
        >
          <Button
            intent="primary"
            minimal
            outlined
            active={isOpen}
            onClick={() => setOpen(!isOpen)}
          >
            Deposit
          </Button>
        </div>
      </div>
      <Collapse isOpen={isOpen}>
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
          <div className={tw("mb-1")}>Available: 234.34</div>
          <div className={tw("flex", "items-center")}>
            <div style={{ maxWidth: "300px" }}>
              <TradeInputAlt
                cryptoAddress={"0x0000000000000000000000000000000000000000"}
                cryptoDecimals={18}
                cryptoBalanceOf={undefined}
                cryptoDisplayBalance={0}
                cryptoSymbol={"ETH"}
                cryptoIcon={BaseAssetIcon}
                previewCryptoAddress={
                  "0x90AF5AE6a337734da85Eb751a4B8aCF088Aa74d5"
                }
                previewCryptoPoolIndex={1}
                labelTopLeft={t`Mint`}
                disabled={false}
                swapKind={0}
                pool={pool}
                onChange={() => {
                  console.log("change");
                }}
                onPreviewUpdate={() => console.log("hi")}
                value={"12"}
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
              <LabeledText text={"11.98 eP:yETH"} label={`Principal Tokens`} />
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
              <LabeledText text={"12 eP:yETH"} label={`Yield Tokens`} />
            </Callout>
          </div>
          <div className={tw("mt-4")}>
            <Button intent="primary">Mint Tokens</Button>
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
          <div className={tw("text-lg")}>
            Stake Your Tokens or Sell Principal
          </div>
        </div>
        <div className={tw("flex", "pl-12", "pt-2", "mb-6", "items-center")}>
          <div className={"ml-10 bp3-text-muted text-sm"}>
            Go to the <a>Portfolio Page</a>. <br />
            Stake your tokens for additional APY. <br />
            Or sell your principal to re-invest.
          </div>
        </div>
      </Collapse>
    </Card>
  );
}
