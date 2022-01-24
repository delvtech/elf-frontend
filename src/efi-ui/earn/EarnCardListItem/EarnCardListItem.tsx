import { Fragment, ReactElement, useCallback, useState } from "react";

import {
  Button,
  Card,
  Classes,
  Collapse,
  Divider,
  Elevation,
  Intent,
  Tag,
} from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import classNames from "classnames";
import { differenceInDays } from "date-fns";
import { ERC20 } from "elf-contracts-typechain/dist/types";
import { USDC } from "elf-contracts-typechain/dist/types/USDC";
import { WETH } from "elf-contracts-typechain/dist/types/WETH";
import { Signer } from "ethers";
import { PrincipalTokenInfo, YieldTokenInfo } from "@elementfi/tokenlist";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { findAssetIcon } from "efi-ui/crypto/CryptoIcon";
import { EarnActionsTabId } from "efi-ui/earn/EarnActionsTabs/EarnActionsTabId";
import { EarnExpandedSummary } from "efi-ui/earn/EarnCardListItem/EarnExpandedSummary";
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
import { getTokenInfo } from "efi/tokenlists/tokenlists";
import { getIsMature } from "efi/tranche/getIsMature";
import { getVaultTokenInfoForTranche } from "efi/tranche/tranches";
import { underlyingContractsByAddress } from "efi/underlying/underlying";

import { EarnSummaryCardListItem } from "./EarnSummaryCardListItem";
import { IconNames } from "@blueprintjs/icons";
import { MintForm } from "efi-ui/mint/MintCard/MintForm";
import { EarnStakingForms } from "efi-ui/earn/EarnStakingForm/EarnStakingForms";
import { useSigner } from "efi-ui/provider/useBlockFromTag/useSigner/useSigner";

interface EarnCardListItemProps {
  signer: Signer | undefined;
  library: Web3Provider | undefined;
  account: string | null | undefined;
  id: string;
  principalTokenInfo: PrincipalTokenInfo;
  isExpanded: boolean;
  onExpandOpen: (id: string) => void;
  onExpandClose: (id: string) => void;
}

export function EarnCardListItem(
  props: EarnCardListItemProps
): ReactElement | null {
  const {
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
        interactive={false}
        elevation={Elevation.ZERO}
        className={tw(
          "max-w-md",
          "w-full",
          "flex",
          "flex-col",
          "p-4",
          "space-y-2"
        )}
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
      className={tw(
        "max-w-md",
        "w-full",
        "flex",
        "flex-col",
        "p-6",
        "space-y-2"
      )}
    >
      <EarnSummaryCardListItem
        onToggleExpand={onToggleExpand}
        BaseAssetIcon={BaseAssetIcon}
        displayName={displayName}
        type={type}
        termLength={termLength}
        vaultApy={vaultApy}
        tvl={tvl}
        yieldPoolInfo={yieldPoolInfo}
        principalPoolInfo={principalPoolInfo}
        startTime={startTime}
        maturityTime={maturityTime}
        isExpanded={isExpanded}
      />

      <Collapse isOpen={isExpanded}>
        <Divider className={tw("mt-4", "mb-6")} />
        <EarnExpandedSummary
          yieldPoolInfo={yieldPoolInfo}
          principalPoolInfo={principalPoolInfo}
          principalPrice={principalPrice}
          yieldPrice={yieldPrice}
        />
        <EarnActionsButtons
          library={library}
          account={account}
          principalTokenInfo={principalTokenInfo}
          unlockTimestamp={principalTokenInfo.extensions.unlockTimestamp}
        />
      </Collapse>
    </Card>
  );
}

interface EarnActionsButtonsProps {
  library: Web3Provider | undefined;
  account: string | null | undefined;
  principalTokenInfo: PrincipalTokenInfo;
  unlockTimestamp: number;
}

export function EarnActionsButtons(
  props: EarnActionsButtonsProps
): ReactElement {
  const { unlockTimestamp, library, account, principalTokenInfo } = props;
  const signer = useSigner(account, library);
  const isMature = getIsMature(unlockTimestamp);

  const [showMint, setShowMint] = useState(false);
  const [showLiquidity, setShowLiquidity] = useState(false);
  const onClickMintButton = useCallback(() => {
    setShowLiquidity(false);
    setShowMint(!showMint);
  }, [showMint]);

  const onClickLiquidityButton = useCallback(() => {
    setShowMint(false);
    setShowLiquidity(!showLiquidity);
  }, [showLiquidity]);

  return (
    <Fragment>
      <Button
        minimal
        active
        disabled={isMature}
        intent={Intent.PRIMARY}
        id={EarnActionsTabId.MINT}
        rightIcon={IconNames.CHEVRON_RIGHT}
        className={tw("mt-8", "w-full", "flex", "justify-between")}
        onClick={onClickMintButton}
      >
        <Tag
          intent={Intent.PRIMARY}
          round
          minimal
          className={tw("mr-2", "my-2")}
        >
          1
        </Tag>
        <span>{t`Mint principal and yield tokens`}</span>
      </Button>

      <Collapse isOpen={showMint} className={tw("my-2")}>
        <MintForm
          library={library}
          account={account}
          trancheInfo={principalTokenInfo}
        />
      </Collapse>
      <Button
        minimal
        active
        disabled={isMature}
        intent={Intent.PRIMARY}
        id={EarnActionsTabId.PROVIDE_LIQUIDITY}
        rightIcon={IconNames.CHEVRON_RIGHT}
        className={tw("w-full", "flex", "justify-between")}
        onClick={onClickLiquidityButton}
      >
        <Tag
          intent={Intent.PRIMARY}
          round
          minimal
          className={tw("mr-2", "my-2")}
        >
          2
        </Tag>
        <span>{t`Provide liquidity to earn fees`}</span>
      </Button>

      <Collapse isOpen={showLiquidity} className={tw("my-2")}>
        <EarnStakingForms
          library={library}
          signer={signer}
          account={account}
          trancheInfo={principalTokenInfo}
          className={tw("flex-col", "space-x-0", "space-y-4")}
        />
      </Collapse>
    </Fragment>
  );
}
