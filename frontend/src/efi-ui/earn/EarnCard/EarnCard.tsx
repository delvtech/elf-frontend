import { CSSProperties, ReactElement, useCallback, useState } from "react";

import { Card, Classes, Collapse, Elevation } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { differenceInDays } from "date-fns";
import { USDC } from "elf-contracts/types/USDC";
import { WETH } from "elf-contracts/types/WETH";
import { PrincipalTokenInfo } from "tokenlists/types";

import tw from "efi-tailwindcss-classnames";
import { findAssetIcon } from "efi-ui/crypto/CryptoIcon";
import { EarnActionsCard } from "efi-ui/earn/EarnActionsCard/EarnActionsCard";
import { EarnActionsTabId } from "efi-ui/earn/EarnActionsTabs/EarnActionsTabId";
import { useFeeVolumeForPool } from "efi-ui/pools/useFeeVolumeForPool/useFeeVolumeForPool";
import { usePoolSpotPrice } from "efi-ui/pools/usePoolSpotPrice/usePoolSpotPrice";
import { useTokenYield } from "efi-ui/pools/useTokenYield";
import { useTotalValueLockedForTranche } from "efi-ui/pools/useTotalValueLockedForTranche";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { useYearnVault } from "efi-ui/yearn/useYearnVault";
import { getCryptoAssetForToken } from "efi/crypto/getCryptoAssetForToken";
import { getCryptoSymbol } from "efi/crypto/getCryptoSymbol";
import { interestTokenContractsByAddress } from "efi/interestToken/interestToken";
import {
  getPoolInfoForPrincipalToken,
  principalPoolContractsByAddress,
} from "efi/pools/ccpool";
import {
  getPoolInfoForYieldToken,
  yieldPoolContractsByAddress,
} from "efi/pools/weightedPool";
import { getIsMature } from "efi/tranche/getIsMature";
import { trancheContractsByAddress } from "efi/tranche/tranches";
import { underlyingContractsByAddress } from "efi/underlying/underlying";
import { getVaultSymbol } from "efi/vaults/getVaultSymbol";
import { Signer } from "ethers";
import { EarnSummaryCard } from "./EarnSummaryCard";
import { getYearnVaultAPY } from "efi-yearn/fetchYearnVaults";
import { ERC20 } from "elf-contracts/types";
import classNames from "classnames";

interface EarnCardProps {
  signer: Signer | undefined;
  library: Web3Provider | undefined;
  account: string | null | undefined;
  principalTokenInfo: PrincipalTokenInfo;
  isExpanded: boolean;
  onExpandOpen: () => void;
  onExpandClose: () => void;
}

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
    principalTokenInfo,
    principalTokenInfo: {
      extensions: { interestToken: interestTokenAddress },
    },
    isExpanded,
    onExpandClose,
    onExpandOpen,
  } = props;
  // state
  const { isDarkMode } = useDarkMode();
  const [activeTabId, setActiveTabId] = useState(EarnActionsTabId.MINT);

  // get infos
  const yieldPoolInfo = getPoolInfoForYieldToken(interestTokenAddress);
  const principalPoolInfo = getPoolInfoForPrincipalToken(
    principalTokenInfo.address
  );
  const { underlying: baseAssetAddress } = principalTokenInfo.extensions;

  // get contracts
  const principalPoolContract =
    principalPoolContractsByAddress[principalPoolInfo.address];
  const yieldPoolContract = yieldPoolContractsByAddress[yieldPoolInfo.address];
  const baseAssetContract = underlyingContractsByAddress[
    principalTokenInfo.extensions.underlying
  ] as WETH | USDC | ERC20;

  // get static display information
  const { createdAtTimestamp: trancheCreatedAt, unlockTimestamp } =
    principalTokenInfo.extensions;
  const maturityTime = unlockTimestamp * 1000;
  const isMature = getIsMature(unlockTimestamp);
  const baseAsset = getCryptoAssetForToken(baseAssetAddress);
  const baseAssetSymbol = getCryptoSymbol(baseAsset) as string;
  const BaseAssetIcon = findAssetIcon(baseAsset);
  const vaultSymbol = getVaultSymbol(baseAsset) as string;
  const { data: vaultInfo } = useYearnVault(vaultSymbol);
  const { displayName, type, apy } = vaultInfo || {};

  // get dynamic pool information
  const principalPrice = usePoolSpotPrice(
    principalPoolContract,
    principalPoolInfo.extensions.underlying
  )?.toFixed(4);
  const yieldPrice = usePoolSpotPrice(
    yieldPoolContract,
    yieldPoolInfo.extensions.underlying
  )?.toFixed(4);
  const fees = useFeeVolumeForPool(yieldPoolContract) ?? 0;
  const tvl = useTotalValueLockedForTranche(
    principalTokenInfo,
    baseAssetContract
  );
  const variableYield = useTokenYield(yieldPoolInfo, "yield");
  const vaultApy = apy ? getYearnVaultAPY(apy) : 0;

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

  if (!yieldPoolContract || !baseAssetContract) {
    return null;
  }

  if (!allDataLoaded) {
    return (
      <Card
        style={poolCardStyle}
        interactive={false}
        elevation={Elevation.ZERO}
        className={classNames(tw("p-0", "w-full"))}
      >
        <div
          className={classNames(tw("p-0", "w-full", "h-24"), Classes.SKELETON)}
        />
      </Card>
    );
  }

  return (
    <Card
      interactive={!isExpanded}
      elevation={isExpanded ? Elevation.THREE : Elevation.ZERO}
      className={tw("p-0", "w-full")}
      style={poolCardStyle}
    >
      <EarnSummaryCard
        onToggleExpand={onToggleExpand}
        BaseAssetIcon={BaseAssetIcon}
        baseAsset={baseAsset}
        isDarkMode={isDarkMode}
        displayName={displayName}
        type={type}
        termLength={termLength}
        vaultApy={vaultApy}
        tvl={tvl}
        yieldPoolInfo={yieldPoolInfo}
        principalPoolInfo={principalPoolInfo}
        principalPrice={principalPrice}
        baseAssetSymbol={baseAssetSymbol}
        yieldPrice={yieldPrice}
        startTime={startTime}
        maturityTime={maturityTime}
        isExpanded={isExpanded}
      />

      <Collapse isOpen={isExpanded}>
        <EarnActionsCard
          signer={signer}
          library={library}
          account={account}
          trancheInfo={principalTokenInfo}
          activeTabId={activeTabId}
          setActiveTabId={setActiveTabId}
        />
      </Collapse>
    </Card>
  );
}
