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
  Elevation,
  Tag,
} from "@blueprintjs/core";
import { Link, navigate } from "@reach/router";
import classNames from "classnames";
import { Web3Provider } from "@ethersproject/providers";
import { AbstractConnector } from "@web3-react/abstract-connector";
import { Tranche } from "elf-contracts/types/Tranche";
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
import { MintCard } from "efi-ui/mint/MintCard/MintCard";
import { usePoolPairedToken } from "efi-ui/pools/usePoolPairedToken/usePoolPairedToken";
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
  library: Web3Provider | undefined;
  account: string | null | undefined;
  chainId: number | undefined;
  walletConnectionActive: boolean;
  connector: AbstractConnector | undefined;
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
  const {
    pool,
    library,
    account,
    chainId,
    walletConnectionActive,
    connector,
  } = props;
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
        style={poolCardStyle}
        interactive
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
        <MintCard
          pool={pool}
          library={library}
          account={account}
          chainId={chainId}
          walletConnectionActive={walletConnectionActive}
          connector={connector}
          baseAsset={baseAsset}
          baseAssetContract={baseAssetContract}
          baseAssetSymbol={baseAssetSymbol}
          baseAssetIcon={BaseAssetIcon}
          tranche={tranche}
        />
      </Collapse>
    </Card>
  );
}
