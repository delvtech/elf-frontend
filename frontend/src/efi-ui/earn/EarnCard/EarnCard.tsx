import { CSSProperties, ReactElement, useCallback, useState } from "react";

import { Card, Classes, Collapse, Elevation } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import classNames from "classnames";
import { differenceInDays } from "date-fns";
import { ERC20 } from "elf-contracts/types";
import { USDC } from "elf-contracts/types/USDC";
import { WETH } from "elf-contracts/types/WETH";
import { Signer } from "ethers";
import { PrincipalTokenInfo, YieldTokenInfo } from "tokenlists/types";

import tw from "efi-tailwindcss-classnames";
import { findAssetIcon } from "efi-ui/crypto/CryptoIcon";
import { EarnActionsCard } from "efi-ui/earn/EarnActionsCard/EarnActionsCard";
import { EarnActionsTabId } from "efi-ui/earn/EarnActionsTabs/EarnActionsTabId";
import { useFeeVolumeForPool } from "efi-ui/pools/hooks/useFeeVolumeForPool/useFeeVolumeForPool";
import { usePoolSpotPrice } from "efi-ui/pools/hooks/usePoolSpotPrice/usePoolSpotPrice";
import { useTokenYield } from "efi-ui/pools/hooks/useTokenYield";
import { useTotalValueLockedForTranche } from "efi-ui/pools/hooks/useTotalValueLockedForTranche";
import { useYearnVault } from "efi-ui/yearn/useYearnVault";
import { getYearnVaultAPY } from "efi-yearn/fetchYearnVaults";
import { getCryptoAssetForToken } from "efi/crypto/getCryptoAssetForToken";
import {
  getPoolInfoForPrincipalToken,
  principalPoolContractsByAddress,
} from "efi/pools/ccpool";
import {
  getPoolInfoForYieldToken,
  yieldPoolContractsByAddress,
} from "efi/pools/weightedPool";
import { getIsMature } from "efi/tranche/getIsMature";
import { underlyingContractsByAddress } from "efi/underlying/underlying";

import { EarnSummaryCard } from "./EarnSummaryCard";
import { getTokenInfo } from "efi/tokenlists";
import { getVaultTokenInfoForTranche } from "efi/tranche/tranches";

interface EarnCardProps {
  signer: Signer | undefined;
  library: Web3Provider | undefined;
  account: string | null | undefined;
  id: string;
  principalTokenInfo: PrincipalTokenInfo;
  isExpanded: boolean;
  onExpandOpen: (id: string) => void;
  onExpandClose: (id: string) => void;
}

const poolCardStyle: CSSProperties = {
  padding: "0px",
};

export function EarnCard(props: EarnCardProps): ReactElement | null {
  const {
    signer,
    id,
    library,
    account,
    principalTokenInfo,
    principalTokenInfo: {
      address: principalTokenAddress,
      extensions: {
        interestToken: interestTokenAddress,
        underlying: baseAssetAddress,
      },
    },
    isExpanded,
    onExpandClose,
    onExpandOpen,
  } = props;

  // state
  const [activeTabId, setActiveTabId] = useState(EarnActionsTabId.MINT);

  // get token infos
  const yieldPoolInfo = getPoolInfoForYieldToken(interestTokenAddress);
  const principalPoolInfo = getPoolInfoForPrincipalToken(
    principalTokenInfo.address
  );
  const vaultTokenInfo = getVaultTokenInfoForTranche(principalTokenAddress);
  const yieldTokenInfo = getTokenInfo<YieldTokenInfo>(interestTokenAddress);

  // get contracts
  const principalPoolContract =
    principalPoolContractsByAddress[principalPoolInfo.address];
  const yieldPoolContract = yieldPoolContractsByAddress[yieldPoolInfo.address];
  const baseAssetContract = underlyingContractsByAddress[
    principalTokenInfo.extensions.underlying
  ] as WETH | USDC | ERC20;

  // get static display information
  const {
    extensions: { createdAtTimestamp: trancheCreatedAt, unlockTimestamp },
  } = principalTokenInfo;
  const { symbol: vaultSymbol, address: vaultAddress } = vaultTokenInfo;
  const maturityTime = unlockTimestamp * 1000;
  const isMature = getIsMature(unlockTimestamp);
  const baseAsset = getCryptoAssetForToken(baseAssetAddress);
  const BaseAssetIcon = findAssetIcon(baseAsset);
  const { data: vaultInfo } = useYearnVault(vaultSymbol, vaultAddress);
  const { display_name: displayName, type, apy } = vaultInfo || {};

  // get dynamic pool information
  const principalPrice = usePoolSpotPrice(
    principalPoolContract,
    principalTokenInfo.address
  )?.toFixed(4);
  const yieldPrice = usePoolSpotPrice(
    yieldPoolContract,
    yieldTokenInfo.address
  )?.toFixed(4);

  const fees = useFeeVolumeForPool(yieldPoolInfo) ?? 0;
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
      onExpandClose(id);
    } else {
      onExpandOpen(id);
    }
  }, [id, isExpanded, isMature, onExpandClose, onExpandOpen]);

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
        displayName={displayName}
        type={type}
        termLength={termLength}
        vaultApy={vaultApy}
        tvl={tvl}
        yieldPoolInfo={yieldPoolInfo}
        principalPoolInfo={principalPoolInfo}
        principalPrice={principalPrice}
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
