import { CSSProperties, ReactElement, useEffect, useState } from "react";

import {
  Button,
  Card,
  Classes,
  Collapse,
  Colors,
  Elevation,
  Intent,
} from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { AbstractConnector } from "@web3-react/abstract-connector";
import classNames from "classnames";
import { differenceInDays } from "date-fns";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { TimeLeft } from "efi-ui/base/TimeLeft/TimeLeft";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { findAssetIcon } from "efi-ui/crypto/CryptoIcon";
import { getCryptoAssetForToken } from "efi/crypto/getCryptoAssetForToken";
import { getCryptoSymbol } from "efi/crypto/getCryptoSymbol";
import { MintCard } from "efi-ui/mint/MintCard/MintCard";
import { useBaseAssetForPool } from "efi-ui/pools/useBaseAssetForPool/useBaseAssetForPool";
import { useFeeVolumeForPool } from "efi-ui/pools/useFeeVolumeForPool/useFeeVolumeForPool";
import { usePoolForToken } from "efi-ui/pools/usePoolForToken/usePoolForToken";
import { usePoolPairedToken } from "efi-ui/pools/usePoolPairedToken/usePoolPairedToken";
import { usePoolSpotPrice } from "efi-ui/pools/usePoolSpotPrice/usePoolSpotPrice";
import { useTokenYield } from "efi-ui/pools/useTokenYield";
import { useTotalFiatLiquidityForPool } from "efi-ui/pools/useTotalFiatLiquidityForPool/useTotalFiatLiquidityForPool";
import { useTotalValueLockedForTranche } from "efi-ui/pools/useTotalValueLockedForTranche";
import { useTrancheForPool } from "efi-ui/pools/useTrancheForPool/useTrancheForPool";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { getTermAssetSymbol } from "efi-ui/tranche/useTermAssetSymbol";
import { useTrancheCreatedAt } from "efi-ui/tranche/useTrancheCreatedAt";
import { useYearnVault } from "efi-ui/yearn/useYearnVault";
import { formatPercent } from "efi/base/formatPercent";
import { CryptoAssetType } from "efi/crypto/CryptoAsset";
import { formatMoney } from "efi/money/formatMoney";
import { PoolContract } from "efi/pools/PoolContract";
import { getVaultSymbol } from "efi/vaults/getVaultSymbol";

import styles from "./PrincipalPoolCard.module.css";
import { useParseSortedTokensForPool } from "efi/pools/parseSortedTokensForPool";
import { usePoolTokens } from "efi-ui/pools/usePoolTokens/usePoolTokens";
import { getQueryData } from "efi-ui/base/queryResults";

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
  minWidth: 800,
  padding: "0px",
};

export function MintPoolCard(props: MintPoolCardProps): ReactElement | null {
  const { pool, library, account, chainId, walletConnectionActive, connector } =
    props;
  const tranche = useTrancheForPool(pool);
  const principalPool = usePoolForToken(tranche);
  const poolTokensResult = usePoolTokens(pool);
  const tokenAddresses = getQueryData(poolTokensResult)?.[0] || [];
  const { termAssetContract: principalTokenContract } =
    useParseSortedTokensForPool(tokenAddresses);
  const principalPrice = usePoolSpotPrice(
    principalPool,
    principalTokenContract
  )?.toFixed(4);
  const trancheCreatedAt = useTrancheCreatedAt(tranche);
  const fees = useFeeVolumeForPool(pool) ?? 0;
  const baseAssetContract = useBaseAssetForPool(pool);
  const baseAsset = getCryptoAssetForToken(baseAssetContract?.address);
  const baseAssetSymbol = getCryptoSymbol(baseAsset);
  const BaseAssetIcon = findAssetIcon(baseAssetSymbol);
  const termAssetContract = usePoolPairedToken(pool, baseAssetContract);
  const { symbol: termAssetSymbol } = getTermAssetSymbol(
    termAssetContract?.address,
    baseAssetSymbol
  );
  const tvl = useTotalValueLockedForTranche(tranche, baseAssetContract);
  const yieldPrice = usePoolSpotPrice(pool, termAssetContract)?.toFixed(4);

  const { data: unlockBN } = useSmartContractReadCall(
    tranche,
    "unlockTimestamp"
  );
  const unlockTime = unlockBN?.toNumber();
  const variableYield = useTokenYield(baseAssetContract, pool, "yield");

  const vaultSymbol = getVaultSymbol(baseAsset);
  const { data: vaultInfo } = useYearnVault(vaultSymbol);

  const { displayName, type, apy } = vaultInfo || {};
  const vaultApy = apy?.recommended ?? 0;

  const { isDarkMode } = useDarkMode();

  // TODO: this is a big hammer for loading state.  we should use a more granular technique when we can.
  const dataToLoad = [
    tvl,
    vaultInfo,
    yieldPrice,
    tranche,
    trancheCreatedAt,
    fees,
    baseAssetContract,
    baseAsset,
    baseAssetSymbol,
    BaseAssetIcon,
    termAssetContract,
    termAssetSymbol,
    unlockBN,
    variableYield,
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

  const startTime = trancheCreatedAt ? trancheCreatedAt * 1000 : 0;
  const maturityTime = unlockTime ? unlockTime * 1000 : 0;

  const dayDifference = differenceInDays(
    maturityTime as number,
    startTime as number
  );

  const termLength =
    dayDifference > 10 ? Math.round(dayDifference / 10) * 10 : dayDifference;

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
              "col-span-1",
              "xl:ml-4",
              "items-center"
            )}
          >
            {BaseAssetIcon && baseAsset?.type === CryptoAssetType.ETHEREUM ? (
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
            <LabeledText
              text={t`Yearn ${displayName} ${type}`}
              label={t`Vault`}
            />
          </div>
          <div
            className={tw(
              cellClassName,
              "col-span-2",
              "md:col-span-2",
              "xl:col-span-1"
            )}
          >
            <LabeledText text={t`${termLength} Day`} label={t`Term`} />
          </div>
          <div
            className={tw(
              cellClassName,
              "col-span-2",
              "md:col-span-2",
              "xl:col-span-1"
            )}
          >
            <LabeledText
              text={t`${formatPercent(vaultApy)}`}
              label={`Vault APY`}
            />
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
              text={tvl ? formatMoney(tvl, { wholeAmounts: true }) : null}
              label={`Element TVL`}
            />
          </div>
          <div
            className={tw(
              cellClassName,
              "col-span-2",
              "lg:col-span-3",
              "xl:col-span-2"
            )}
          >
            <LiquiditySection pool={pool} principalPool={principalPool} />
          </div>
          <div
            className={tw(
              cellClassName,
              "col-span-2",
              "col-start-2",
              "lg:col-span-3",
              "lg:col-start-2",
              "xl:hidden"
            )}
          >
            <LiquiditySection pool={undefined} principalPool={principalPool} />
          </div>
          <div
            className={tw(
              cellClassName,
              "col-span-2",
              "lg:col-start-6",
              "xl:col-start-auto",
              "xl:col-span-2"
            )}
          >
            <div className={tw("flex", "flex-col")}>
              <LabeledText
                text={t`${principalPrice}`}
                label={`Principal Price (${baseAssetSymbol})`}
              />
              <LabeledText
                className={tw("mt-2", "hidden", "xl:flex")}
                text={t`${yieldPrice}`}
                label={`Yield Price (${baseAssetSymbol})`}
              />
            </div>
          </div>
          <div className={tw(cellClassName, "col-span-2", "xl:hidden")}>
            <LabeledText
              text={t`${principalPrice}`}
              label={`Yield Price (${baseAssetSymbol})`}
            />
          </div>
          <div
            className={tw(
              cellClassName,
              "overflow-visible",
              "col-span-3",
              "lg:col-span-3",
              "xl:col-span-2"
            )}
          >
            <div className={tw("flex", "w-full", "items-start")}>
              <TimeLeft
                startTimestamp={startTime}
                maturityTimestamp={maturityTime}
              />
            </div>
          </div>
        </div>
        <div
          className={tw(
            "flex",
            "flex-col",
            "overflow-visible",
            "items-start",
            maturityTime && Date.now() < maturityTime ? "visible" : "invisible"
          )}
        >
          <Button
            intent={Intent.PRIMARY}
            minimal
            outlined
            active={isOpen}
            onClick={() => setOpen(!isOpen)}
          >
            {t`Deposit`}
          </Button>
        </div>
      </div>
      <Collapse isOpen={isOpen}>
        <MintCard
          library={library}
          account={account}
          chainId={chainId}
          walletConnectionActive={walletConnectionActive}
          connector={connector}
          baseAsset={baseAsset}
          baseAssetSymbol={baseAssetSymbol}
          baseAssetIcon={BaseAssetIcon}
          tranche={tranche}
        />
      </Collapse>
    </Card>
  );
}

interface LiquiditySectionProps {
  pool: PoolContract | undefined;
  principalPool: PoolContract | undefined;
}

function LiquiditySection({ pool, principalPool }: LiquiditySectionProps) {
  const liquidity = useTotalFiatLiquidityForPool(pool);
  const principalLiquidity = useTotalFiatLiquidityForPool(principalPool);
  return (
    <div className={tw("flex", "flex-col")}>
      {liquidity && (
        <LabeledText
          text={formatMoney(liquidity, { wholeAmounts: true })}
          label={`Yield Pool Liquidity`}
        />
      )}
      {principalLiquidity && (
        <LabeledText
          className={tw("mt-2", "hidden", "xl:flex")}
          text={formatMoney(principalLiquidity, { wholeAmounts: true })}
          label={`Principal Pool Liquidity`}
        />
      )}
    </div>
  );
}
