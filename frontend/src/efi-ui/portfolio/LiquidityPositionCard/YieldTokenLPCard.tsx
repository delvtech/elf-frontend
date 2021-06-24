import { ReactElement } from "react";

import {
  ButtonGroup,
  Callout,
  Card,
  Classes,
  Intent,
  Tag,
} from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { AbstractConnector } from "@web3-react/abstract-connector";
import classNames from "classnames";
import { WeightedPool } from "elf-contracts/types/WeightedPool";
import { BigNumber } from "ethers";
import { formatUnits } from "ethers/lib/utils";
import zipObject from "lodash.zipobject";
import {
  PrincipalTokenInfo,
  YieldPoolTokenInfo,
  YieldTokenInfo,
} from "tokenlists/types";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { findAssetIcon } from "efi-ui/crypto/CryptoIcon";
import { GoToPoolButton } from "efi-ui/pools/GoToPoolButton/GoToPoolButton";
import { usePoolTokens } from "efi-ui/pools/usePoolTokens/usePoolTokens";
import { PoolAction } from "efi-ui/pools/usePoolViewPoolActionsPref/usePoolViewPoolActionsPref";
import { useShareOfPool } from "efi-ui/pools/useShareOfPool";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { convertEpochSecondsToDate } from "efi/base/convertEpochSecondsToDate";
import { formatAbbreviatedDate } from "efi/base/dates";
import { formatPercent } from "efi/base/formatPercent";
import { getCryptoAssetForToken } from "efi/crypto/getCryptoAssetForToken";
import { getCryptoSymbol } from "efi/crypto/getCryptoSymbol";
import { getPoolInfo } from "efi/pools/getPoolInfo";
import { getPoolTokens } from "efi/pools/getPoolTokens";
import { PoolInfo } from "efi/pools/PoolInfo";
import { getTokenInfo } from "efi/tokenlists";
import { getTermAssetSymbol } from "efi/tranche/getTermAssetSymbol";
import { getVaultSymbol } from "efi/vaults/getVaultSymbol";

interface YieldTokenLPCardProps {
  library: Web3Provider | undefined;
  connector: AbstractConnector | undefined;
  account: string | null | undefined;
  pool: WeightedPool;
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
  const poolInfo = getPoolInfo(pool.address);

  // base asset
  const { baseAssetInfo } = getPoolTokens(poolInfo);
  const { decimals: baseAssetDecimals } = baseAssetInfo;
  const baseAssetCryptoAsset = getCryptoAssetForToken(baseAssetInfo.address);
  const baseAssetSymbol = getCryptoSymbol(baseAssetCryptoAsset);
  const BaseAssetIcon = findAssetIcon(baseAssetCryptoAsset);

  // yield asset
  const { address: yieldTokenAddress, decimals: yieldTokenDecimals } =
    getYieldTokenForWeightedPool(pool.address);

  const {
    extensions: { unlockTimestamp },
  } = getPrincipalTokenForYieldToken(yieldTokenAddress);

  const unlockDate = convertEpochSecondsToDate(unlockTimestamp);
  const formattedDate = unlockDate
    ? formatAbbreviatedDate(unlockDate)
    : t`Loading unlock date...`;

  // pool shares
  const poolShares = useShareOfPool(pool, account);
  const poolSharesLabel = getPoolSharesLabel(poolShares);

  // liquidity
  const { data: [addresses, poolBalances] = [] } = usePoolTokens(pool);
  const baseAssetLiquidity = calculatePoolShareLiquidity(
    poolShares,
    addresses,
    poolBalances,
    baseAssetInfo.address,
    baseAssetDecimals
  );
  const principalTokenLiquidity = calculatePoolShareLiquidity(
    poolShares,
    addresses,
    poolBalances,
    yieldTokenAddress,
    yieldTokenDecimals
  );

  const baseAssetLiquidityLabel = `${baseAssetLiquidity?.toFixed(4)}`;
  const principalTokenLiquidityLabel = `${principalTokenLiquidity?.toFixed(4)}`;

  const poolName = `${baseAssetSymbol} - ${baseAssetSymbol} Yield Token`;
  const yieldTokenSymbol = getYieldTokenSymbol(poolInfo);
  const poolLabel = `(${baseAssetSymbol} - ${yieldTokenSymbol})`;

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
            <span className={classNames(Classes.TEXT_MUTED)}>{poolLabel}</span>
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
            >{t`Yield liquidity`}</span>
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
            containerClassName={tw("justify-center")}
            text={poolSharesLabel}
            label={""}
          />
        </Callout>
      </div>

      {/* Quick Actions */}
      <ButtonGroup className={tw("space-x-6")}>
        <GoToPoolButton
          poolAddress={poolInfo.address}
          poolAction={PoolAction.REMOVE_LIQUIDITY}
          label={t`Remove LP`}
        />
        <GoToPoolButton
          poolAddress={poolInfo.address}
          poolAction={PoolAction.BUY}
          label={t`Go to Market`}
        />
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

function getPrincipalTokenForYieldToken(
  interestTokenAddress: string
): PrincipalTokenInfo {
  const {
    extensions: { tranche },
  } = getTokenInfo<YieldTokenInfo>(interestTokenAddress);

  return getTokenInfo<PrincipalTokenInfo>(tranche);
}

function getYieldTokenForWeightedPool(poolAddress: string): YieldTokenInfo {
  const {
    extensions: { interestToken: yieldTokenAddress },
  } = getTokenInfo<YieldPoolTokenInfo>(poolAddress);

  return getTokenInfo<YieldTokenInfo>(yieldTokenAddress);
}

export function getYieldTokenSymbol(poolInfo: PoolInfo): string {
  const { baseAssetInfo, termAssetInfo } = getPoolTokens(poolInfo);
  const baseCryptoAsset = getCryptoAssetForToken(baseAssetInfo.address);
  const vaultSymbol = getVaultSymbol(baseCryptoAsset);
  const { symbol: termAssetSymbol } = getTermAssetSymbol(
    termAssetInfo.address,
    vaultSymbol
  );

  return termAssetSymbol as string;
}
