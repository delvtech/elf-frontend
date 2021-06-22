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
import classNames from "classnames";
import { differenceInDays } from "date-fns";
import { USDC } from "elf-contracts/types/USDC";
import { WETH } from "elf-contracts/types/WETH";
import { YieldPoolTokenInfo } from "tokenlists/types";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { TimeLeft } from "efi-ui/base/TimeLeft/TimeLeft";
import { findAssetIcon2 } from "efi-ui/crypto/CryptoIcon";
import { EarnActionsCard } from "efi-ui/earn/EarnActionsCard/EarnActionsCard";
import { EarnActionsTabId } from "efi-ui/earn/EarnActionsTabs/EarnActionsTabId";
import { useFeeVolumeForPool } from "efi-ui/pools/useFeeVolumeForPool/useFeeVolumeForPool";
import { usePoolSpotPrice2 } from "efi-ui/pools/usePoolSpotPrice/usePoolSpotPrice";
import { useTokenYield } from "efi-ui/pools/useTokenYield";
import { useTotalFiatLiquidityForPool } from "efi-ui/pools/useTotalFiatLiquidityForPool/useTotalFiatLiquidityForPool";
import { useTotalValueLockedForTranche } from "efi-ui/pools/useTotalValueLockedForTranche";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { useYearnVault } from "efi-ui/yearn/useYearnVault";
import { formatPercent } from "efi/base/formatPercent";
import { CryptoAssetType } from "efi/crypto/CryptoAsset";
import { getCryptoAssetForToken } from "efi/crypto/getCryptoAssetForToken";
import { getCryptoSymbol } from "efi/crypto/getCryptoSymbol";
import { interestTokenContractsByAddress } from "efi/interestToken/interestToken";
import { formatMoney } from "efi/money/formatMoney";
import {
  getPrincipalPoolForTranche,
  principalPoolContractsByAddress,
} from "efi/pools/ccpool";
import { getTrancheForPool } from "efi/pools/getTrancheForPool";
import { PoolContract } from "efi/pools/PoolContract";
import { yieldPoolContractsByAddress } from "efi/pools/weightedPool";
import { getIsMature2 } from "efi/tranche/getIsMature";
import { trancheContractsByAddress } from "efi/tranche/tranches";
import { underlyingContractsByAddress } from "efi/underlying/underlying";
import { getVaultSymbol } from "efi/vaults/getVaultSymbol";
import { Signer } from "ethers";

interface EarnCardProps {
  signer: Signer | undefined;
  library: Web3Provider | undefined;
  account: string | null | undefined;
  poolInfo: YieldPoolTokenInfo;
  isExpanded: boolean;
  onExpandOpen: () => void;
  onExpandClose: () => void;
}

const cellClassName = tw("flex", "mr-4", "items-center", "overflow-hidden");

const poolCardStyle: CSSProperties = {
  maxWidth: 1180,
  minWidth: 800,
  padding: "0px",
};

export function EarnCard(props: EarnCardProps): ReactElement | null {
  const {
    signer,
    library,
    account,
    poolInfo,
    isExpanded,
    onExpandClose,
    onExpandOpen,
  } = props;
  // state
  const { isDarkMode } = useDarkMode();
  const [transitionsEnabled, setTransitionsEnabled] = useState(true);
  const [activeTabId, setActiveTabId] = useState(EarnActionsTabId.MINT);

  // get infos
  const trancheInfo = getTrancheForPool(poolInfo);
  const principalPoolInfo = getPrincipalPoolForTranche(trancheInfo.address);
  const { underlying: baseAssetAddress } = trancheInfo.extensions;

  // get contracts
  const principalPoolContract =
    principalPoolContractsByAddress[principalPoolInfo.address];
  const yieldPoolContract = yieldPoolContractsByAddress[poolInfo.address];
  const baseAssetContract = underlyingContractsByAddress[
    trancheInfo.extensions.underlying
  ] as WETH | USDC;
  const principalTokenContract = trancheContractsByAddress[trancheInfo.address];
  const yieldTokenContract =
    interestTokenContractsByAddress[poolInfo.extensions.interestToken];

  // get static display information
  const { createdAtTimestamp: trancheCreatedAt, unlockTimestamp } =
    trancheInfo.extensions;
  const maturityTime = unlockTimestamp * 1000;
  const isMature = getIsMature2(unlockTimestamp);
  const baseAsset = getCryptoAssetForToken(baseAssetAddress);
  const baseAssetSymbol = getCryptoSymbol(baseAsset) as string;
  const BaseAssetIcon = findAssetIcon2(baseAsset);
  const vaultSymbol = getVaultSymbol(baseAsset) as string;
  const { data: vaultInfo } = useYearnVault(vaultSymbol);
  const { displayName, type, apy } = vaultInfo || {};

  // get dynamic pool information
  const principalPrice = usePoolSpotPrice2(
    principalPoolContract,
    principalTokenContract.address
  )?.toFixed(4);
  const yieldPrice = usePoolSpotPrice2(
    yieldPoolContract,
    yieldTokenContract.address
  )?.toFixed(4);
  const fees = useFeeVolumeForPool(yieldPoolContract) ?? 0;
  const tvl = useTotalValueLockedForTranche(trancheInfo, baseAssetContract);
  const variableYield = useTokenYield(poolInfo, "yield");
  const vaultApy = apy?.recommended ?? 0;

  const startTime = trancheCreatedAt ? trancheCreatedAt * 1000 : 0;

  const dayDifference = differenceInDays(
    maturityTime as number,
    startTime as number
  );

  const termLength =
    dayDifference > 10 ? Math.round(dayDifference / 10) * 10 : dayDifference;

  // TODO: this is a big hammer for loading state.  we should use a more granular technique when we can.
  const dataToLoad = [tvl, vaultInfo, yieldPrice, fees, variableYield];
  const allDataLoaded = dataToLoad.every((data) => data !== undefined);

  const onToggleExpand = useCallback(() => {
    if (isMature) {
      return;
    }
    if (isExpanded) {
      onExpandClose();
    } else {
      onExpandOpen();
    }
  }, [isExpanded, isMature, onExpandClose, onExpandOpen]);
  // One tme useEffect to let us show transitions for the skeletons once the data is loaded.
  // Afterwards we disable transitions so they don't interfere with light/dark mode switching.
  useEffect(() => {
    if (allDataLoaded) {
      const id = setTimeout(() => {
        setTransitionsEnabled(false);
      }, 1000);
      return () => {
        clearInterval(id);
      };
    }
  }, [allDataLoaded]);

  if (!yieldPoolContract || !baseAssetContract) {
    return null;
  }

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
      style={poolCardStyle}
      className={classNames(
        tw("w-full", {
          transition: transitionsEnabled,
          "duration-1000": transitionsEnabled,
          "ease-in-out": transitionsEnabled,
        })
      )}
    >
      <Card onClick={onToggleExpand} className={tw("w-full", "flex", "p-5")}>
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
                    borderColor: isDarkMode ? Colors.GRAY5 : "",
                    backgroundColor: isDarkMode ? Colors.WHITE : "",
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
              yieldPoolContract={yieldPoolContract}
              principalPoolContract={principalPoolContract}
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
              yieldPoolContract={yieldPoolContract}
              principalPoolContract={principalPoolContract}
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
            active={isExpanded}
            onClick={onToggleExpand}
          >
            {isExpanded ? t`Hide` : t`Show`}
          </Button>
        </div>
      </Card>
      <Collapse isOpen={isExpanded}>
        <EarnActionsCard
          signer={signer}
          library={library}
          account={account}
          trancheInfo={trancheInfo}
          activeTabId={activeTabId}
          setActiveTabId={setActiveTabId}
        />
      </Collapse>
    </Card>
  );
}

interface LiquiditySectionProps {
  yieldPoolContract: PoolContract;
  principalPoolContract: PoolContract;
}

function LiquiditySection({
  yieldPoolContract,
  principalPoolContract,
}: LiquiditySectionProps) {
  const liquidity = useTotalFiatLiquidityForPool(yieldPoolContract);
  const principalLiquidity = useTotalFiatLiquidityForPool(
    principalPoolContract
  );
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
