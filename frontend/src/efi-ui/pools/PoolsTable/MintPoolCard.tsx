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
import { YieldPoolTokenInfo } from "tokenlists/types";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { TimeLeft } from "efi-ui/base/TimeLeft/TimeLeft";
import { findAssetIcon2 } from "efi-ui/crypto/CryptoIcon";
import { MintCard } from "efi-ui/mint/MintCard/MintCard";
import { useFeeVolumeForPool } from "efi-ui/pools/useFeeVolumeForPool/useFeeVolumeForPool";
import { usePoolSpotPrice } from "efi-ui/pools/usePoolSpotPrice/usePoolSpotPrice";
import { useTokenYield } from "efi-ui/pools/useTokenYield";
import { useTotalFiatLiquidityForPool } from "efi-ui/pools/useTotalFiatLiquidityForPool/useTotalFiatLiquidityForPool";
import { useTotalValueLockedForTranche } from "efi-ui/pools/useTotalValueLockedForTranche";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { useYearnVault } from "efi-ui/yearn/useYearnVault";
import { formatPercent } from "efi/base/formatPercent";
import { CryptoAssetType } from "efi/crypto/CryptoAsset";
import { getCryptoAssetForToken } from "efi/crypto/getCryptoAssetForToken";
import { getCryptoSymbol } from "efi/crypto/getCryptoSymbol";
import { InterestTokenContractsByAddress } from "efi/interestToken/interestToken";
import { formatMoney } from "efi/money/formatMoney";
import {
  getPrincipalPoolForTranche,
  principalPoolContractsByAddress,
} from "efi/pools/ccpool";
import { getTrancheForPool } from "efi/pools/getTrancheForPool";
import { PoolContract } from "efi/pools/PoolContract";
import { yieldPoolContractsByAddress } from "efi/pools/weightedPool";
import { getIsMature2 } from "efi/tranche/getIsMature";
import { getTermAssetSymbol } from "efi/tranche/getTermAssetSymbol";
import { trancheContractsByAddress } from "efi/tranche/tranches";
import { underlyingContracts } from "efi/underlying/underlying";
import { getVaultSymbol } from "efi/vaults/getVaultSymbol";

import styles from "./PrincipalPoolCard.module.css";

interface MintPoolCardProps {
  poolInfo: YieldPoolTokenInfo;
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
  const {
    poolInfo,
    library,
    account,
    chainId,
    walletConnectionActive,
    connector,
  } = props;
  // state
  const { isDarkMode } = useDarkMode();
  const [transitionsEnabled, setTransitionsEnabled] = useState(true);
  const [isExpanded, setExpanded] = useState(false);
  const toggleExpanded = useCallback(
    () => setExpanded(!isExpanded),
    [isExpanded]
  );

  // get infos
  const trancheInfo = getTrancheForPool(poolInfo);
  const principalPoolInfo = getPrincipalPoolForTranche(trancheInfo.address);

  // get contracts
  const principalPoolContract =
    principalPoolContractsByAddress[principalPoolInfo.address];
  const yieldPoolContract = yieldPoolContractsByAddress[poolInfo.address];
  const baseAssetContract =
    underlyingContracts[trancheInfo.extensions.underlying];
  const principalTokenContract = trancheContractsByAddress[trancheInfo.address];
  const yieldTokenContract =
    InterestTokenContractsByAddress[poolInfo.extensions.interestToken];
  const trancheContract = trancheContractsByAddress[trancheInfo.address];

  // get static display information
  const { createdAtTimestamp: trancheCreatedAt, unlockTimestamp } =
    trancheInfo.extensions;
  const baseAsset = getCryptoAssetForToken(baseAssetContract?.address);
  const baseAssetSymbol = getCryptoSymbol(baseAsset);
  const BaseAssetIcon = findAssetIcon2(baseAsset);
  const vaultSymbol = getVaultSymbol(baseAsset);
  const { data: vaultInfo } = useYearnVault(vaultSymbol);
  const { displayName, type, apy } = vaultInfo || {};
  const { symbol: yieldTokenSymbol } = getTermAssetSymbol(
    yieldTokenContract?.address,
    vaultSymbol
  );
  const { symbol: principalTokenSymbol } = getTermAssetSymbol(
    principalTokenContract?.address,
    vaultSymbol
  );

  // get dynamic pool information
  const principalPrice = usePoolSpotPrice(
    principalPoolContract,
    principalTokenContract
  )?.toFixed(4);
  const yieldPrice = usePoolSpotPrice(
    yieldPoolContract,
    yieldTokenContract
  )?.toFixed(4);
  const fees = useFeeVolumeForPool(yieldPoolContract) ?? 0;
  const tvl = useTotalValueLockedForTranche(trancheContract, baseAssetContract);
  const variableYield = useTokenYield(
    baseAssetContract,
    yieldPoolContract,
    "yield"
  );
  const vaultApy = apy?.recommended ?? 0;

  // TODO: this is a big hammer for loading state.  we should use a more granular technique when we can.
  const dataToLoad = [tvl, vaultInfo, yieldPrice, fees, variableYield];
  const allDataLoaded = dataToLoad.every((data) => data !== undefined);

  // One tme useEffect to let us show transitions for the skeletons once the data is loaded.
  // Afterwards we disable transitions so they don't interfere with light/dark mode switching.
  useEffect(() => {
    if (allDataLoaded) {
      setTimeout(() => {
        setTransitionsEnabled(false);
      }, 1000);
    }
  }, [allDataLoaded]);

  if (!yieldPoolContract || !baseAssetContract) {
    return null;
  }

  const startTime = trancheCreatedAt ? trancheCreatedAt * 1000 : 0;
  const maturityTime = unlockTimestamp * 1000;
  const isMature = getIsMature2(maturityTime);

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
      interactive={!isMature}
      onClick={isMature ? undefined : toggleExpanded}
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
      <div className={tw("w-full", "flex", "p-5")}>
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
              "xl:col-span-1"
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
            <LiquiditySection
              pool={yieldPoolContract}
              principalPool={principalPoolContract}
            />
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
            <LiquiditySection
              pool={undefined}
              principalPool={principalPoolContract}
            />
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
            active={isExpanded}
            onClick={() => setExpanded(!isExpanded)}
          >
            {t`Deposit`}
          </Button>
        </div>
      </div>
      <Collapse isOpen={isExpanded}>
        <MintCard
          library={library}
          account={account}
          chainId={chainId}
          walletConnectionActive={walletConnectionActive}
          connector={connector}
          baseAsset={baseAsset}
          baseAssetSymbol={baseAssetSymbol}
          principalTokenSymbol={principalTokenSymbol}
          yieldTokenSymbol={yieldTokenSymbol}
          baseAssetIcon={BaseAssetIcon}
          tranche={trancheContract}
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
