import React, { ReactElement } from "react";

import { ButtonGroup, Callout, Card, Intent, Tag } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { AbstractConnector } from "@web3-react/abstract-connector";
import classNames from "classnames";
import { Tranche__factory } from "elf-contracts/types/factories/Tranche__factory";
import { WeightedPool } from "elf-contracts/types/WeightedPool";
import { BigNumber } from "ethers";
import { formatUnits } from "ethers/lib/utils";
import zipObject from "lodash.zipobject";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { findAssetIcon } from "efi-ui/crypto/CryptoIcon";
import { getCryptoAssetForToken } from "efi/crypto/getCryptoAssetForToken";
import { useCryptoSymbol } from "efi-ui/crypto/hooks/useCryptoSymbol/useCryptoSymbol";
import { UnstakeWeightedPoolButton } from "efi-ui/pools/UnstakeButton/UnstakeWeightedPoolButton";
import { useBaseAssetForPool } from "efi-ui/pools/useBaseAssetForPool/useBaseAssetForPool";
import { usePoolTokens } from "efi-ui/pools/usePoolTokens/usePoolTokens";
import { useShareOfPool } from "efi-ui/pools/useShareOfPool";
import { GoToMarketButton } from "efi-ui/portfolio/PrincipalTokenCard/GoToMarketButton";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { useTokenDecimals } from "efi-ui/token/hooks/useTokenDecimals";
import { useTokenName } from "efi-ui/token/hooks/useTokenName";
import { useTrancheUnlockTimestamp } from "efi-ui/tranche/useTrancheUnlockTimestamp";
import { KNOWN_BASE_ASSETS } from "efi/addresses";
import { convertEpochSecondsToDate } from "efi/base/convertEpochSecondsToDate";
import { formatAbbreviatedDate } from "efi/base/dates";
import { formatPercent } from "efi/base/formatPercent";
import { getSmartContractFromRegistry } from "efi/contracts/SmartContractsRegistry";

interface YieldTokenLPCardProps {
  library: Web3Provider | undefined;
  connector: AbstractConnector | undefined;
  account: string | null | undefined;
  pool: WeightedPool | undefined;
}

const calloutClassName = tw(
  "flex",
  "flex-col",
  "flex-1",
  "h-full",
  "p-8",
  "items-center",
  "justify-center"
);

export function YieldTokenLPCard({
  library,
  account,
  connector,
  pool,
}: YieldTokenLPCardProps): ReactElement {
  const { isDarkMode } = useDarkMode();

  // base asset
  const baseAssetContract = useBaseAssetForPool(pool);
  const { data: baseAssetDecimals } = useTokenDecimals(baseAssetContract);
  const baseAssetCryptoAsset = getCryptoAssetForToken(
    baseAssetContract?.address
  );
  const baseAssetSymbol = useCryptoSymbol(baseAssetCryptoAsset);
  const BaseAssetIcon = findAssetIcon(baseAssetSymbol);

  // Principal token
  const tranche = useTrancheForPool(pool);
  const { data: trancheDecimals } = useTokenDecimals(tranche);
  const { data: unlockTimestamp } = useTrancheUnlockTimestamp(tranche);
  const unlockDate = convertEpochSecondsToDate(unlockTimestamp);
  const formattedDate = unlockDate
    ? formatAbbreviatedDate(unlockDate)
    : t`Loading unlock date...`;

  // pool shares
  const { data: poolName } = useTokenName(pool);
  const poolShares = useShareOfPool(pool, account);
  const poolSharesLabel = getPoolSharesLabel(poolShares);

  // liquidity
  const { data: [addresses, poolBalances] = [] } = usePoolTokens(pool);
  const baseAssetLiquidity = calculatePoolShareLiquidity(
    poolShares,
    addresses,
    poolBalances,
    baseAssetContract?.address,
    baseAssetDecimals
  );
  const principalTokenLiquidity = calculatePoolShareLiquidity(
    poolShares,
    addresses,
    poolBalances,
    tranche?.address,
    trancheDecimals
  );

  const baseAssetLiquidityLabel = `${baseAssetLiquidity?.toFixed(4)}`;
  const principalTokenLiquidityLabel = `${principalTokenLiquidity?.toFixed(4)}`;

  return (
    <Card
      style={{ width: 512 }}
      className={classNames(
        tw("p-8", "flex", "flex-col", "m-4", "space-y-5", "text-base", {
          "text-gray-700": !isDarkMode,
          "text-white": isDarkMode,
        })
      )}
    >
      <div>
        <div className={tw("flex", "space-x-4")}>
          {BaseAssetIcon ? (
            <BaseAssetIcon
              className={tw("flex-shrink-0")}
              height={72}
              width={72}
            />
          ) : null}
          <div className={tw("flex", "w-full", "flex-col", "space-y-2")}>
            <span className={tw("text-2xl", "font-semibold")}>
              <a
                title={t`View LP token on etherscan`}
                href={`https://etherscan.io/address/${pool?.address}`}
                target="_blank"
                rel="noreferrer noopener"
              >
                {poolName}
              </a>
            </span>
            <div className={tw("flex", "w-full", "items-center", "space-x-2")}>
              <Tag
                large
                intent={Intent.SUCCESS}
                className={tw("justify-between")}
              >
                <span>{formattedDate}</span>
              </Tag>
              <span> {t`Term`}</span>
            </div>
          </div>
        </div>
      </div>
      <div className={tw("flex", "flex-col", "space-y-5", "items-center")}>
        <div className={tw("flex", "w-full", "space-x-5", "items-center")}>
          <Callout className={calloutClassName}>
            <span
              className={classNames(tw("text-base", "mb-0"))}
            >{t`${baseAssetSymbol} liquidity`}</span>
            <span className={tw("text-lg", "font-semibold")}>
              {baseAssetLiquidityLabel}
            </span>
          </Callout>
          <Callout className={calloutClassName}>
            <span
              className={classNames(tw("text-base", "mb-0"))}
            >{t`pt${baseAssetSymbol} liquidity`}</span>
            <span className={tw("text-lg", "font-semibold")}>
              {principalTokenLiquidityLabel}
            </span>
          </Callout>
        </div>
        <Callout className={calloutClassName}>
          <span
            className={classNames(tw("text-base", "mb-0"))}
          >{t`Share of pool`}</span>
          <LabeledText
            muted={false}
            className={tw("flex", "justify-center", "items-center")}
            bold
            textClassName={tw("text-2xl")}
            text={poolSharesLabel}
            label={""}
          />
        </Callout>
      </div>

      {/* Quick Actions */}
      <ButtonGroup className={tw("space-x-6")}>
        <UnstakeWeightedPoolButton
          account={account}
          connector={connector}
          library={library}
          pool={pool}
        />
        <GoToMarketButton pool={pool} isStake={false} label={t`Go to Market`} />
      </ButtonGroup>
    </Card>
  );
}

function calculatePoolShareLiquidity(
  poolShares: number | undefined,
  poolTokenAddresses: string[] | undefined,
  poolTokenReserves: BigNumber[] | undefined,
  tokenAddress: string | undefined,
  tokenDecimals: number | undefined
): number | undefined {
  let baseAssetLiquidity: number | undefined;
  if (
    poolShares &&
    poolTokenAddresses &&
    poolTokenReserves &&
    tokenAddress &&
    tokenDecimals
  ) {
    const reservesByAddress = zipObject(poolTokenAddresses, poolTokenReserves);
    const reserves = reservesByAddress[tokenAddress];
    const reservesNumber = +formatUnits(reserves, tokenDecimals);
    baseAssetLiquidity = poolShares * reservesNumber;
  }
  return baseAssetLiquidity;
}

function getPoolSharesLabel(poolShares: number | undefined) {
  if (!poolShares) {
    return formatPercent(0, 0);
  }
  if (poolShares === 1) {
    return formatPercent(poolShares, 0);
  }

  return formatPercent(poolShares, 2);
}

function useTrancheForPool(pool: WeightedPool | undefined) {
  const { data: [poolTokens = []] = [] } = usePoolTokens(pool);
  const principalTokenAddress = poolTokens.find(
    (address) => !KNOWN_BASE_ASSETS.includes(address)
  );

  return getSmartContractFromRegistry(
    principalTokenAddress,
    Tranche__factory.connect
  );
}
