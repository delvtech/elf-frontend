import { ReactElement } from "react";

import {
  ButtonGroup,
  Callout,
  Card,
  Classes,
  Icon,
  Intent,
  Tag,
} from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Link } from "@reach/router";
import classNames from "classnames";
import { ConvergentCurvePool } from "elf-contracts/types/ConvergentCurvePool";
import { BigNumber } from "ethers";
import { formatUnits } from "ethers/lib/utils";
import zipObject from "lodash.zipobject";
import { PrincipalTokenInfo } from "tokenlists/types";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { findAssetIcon } from "efi-ui/crypto/CryptoIcon";
import { GoToPoolButton } from "efi-ui/pools/GoToPoolButton/GoToPoolButton";
import { usePoolTokens } from "efi-ui/pools/hooks/usePoolTokens/usePoolTokens";
import { PoolAction } from "efi-ui/pools/hooks/usePoolViewPoolActionsPref/usePoolViewPoolActionsPref";
import { useShareOfPool } from "efi-ui/pools/hooks/useShareOfPool";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { convertEpochSecondsToDate } from "efi/base/convertEpochSecondsToDate";
import { formatAbbreviatedDate } from "efi/base/dates";
import { formatPercent } from "efi/base/formatPercent";
import { getCryptoAssetForToken } from "efi/crypto/getCryptoAssetForToken";
import { getCryptoSymbol } from "efi/crypto/getCryptoSymbol";
import { getPoolInfo } from "efi/pools/getPoolInfo";
import { getPoolTokens } from "efi/pools/getPoolTokens";
import { getTokenInfo } from "efi/tokenlists";
import { formatPrincipalTokenShortSymbol } from "efi/tranche/format";
import { getIsMature } from "efi/tranche/getIsMature";

interface PrincipalTokenLPCardProps {
  account: string | null | undefined;
  pool: ConvergentCurvePool;
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

export function PrincipalTokenLPCard({
  account,
  pool,
}: PrincipalTokenLPCardProps): ReactElement {
  const { isDarkMode } = useDarkMode();
  const poolInfo = getPoolInfo(pool.address);

  // base asset
  const { baseAssetInfo } = getPoolTokens(poolInfo);
  const { decimals: baseAssetDecimals } = baseAssetInfo;
  const baseAssetCryptoAsset = getCryptoAssetForToken(baseAssetInfo.address);
  const baseAssetSymbol = getCryptoSymbol(baseAssetCryptoAsset);
  const BaseAssetIcon = findAssetIcon(baseAssetCryptoAsset);

  // Principal token
  const { termAssetInfo } = getPoolTokens(poolInfo);
  const principalTokenInfo = getTokenInfo<PrincipalTokenInfo>(
    termAssetInfo.address
  );

  const { decimals: trancheDecimals } = principalTokenInfo;
  const { unlockTimestamp } = principalTokenInfo.extensions;
  const isRedeemable = getIsMature(unlockTimestamp);
  const unlockDate = convertEpochSecondsToDate(unlockTimestamp);
  const formattedDate = unlockDate
    ? formatAbbreviatedDate(unlockDate)
    : t`Loading unlock date...`;

  // pool shares
  const shareOfPool = useShareOfPool(pool, account);
  const poolSharesLabel = getPoolSharesLabel(shareOfPool);

  // liquidity
  const { data: [addresses, poolBalances] = [] } = usePoolTokens(pool);
  const baseAssetLiquidity = calculatePoolShareLiquidity(
    shareOfPool,
    addresses,
    poolBalances,
    baseAssetInfo.address,
    baseAssetDecimals
  );
  const principalTokenLiquidity = calculatePoolShareLiquidity(
    shareOfPool,
    addresses,
    poolBalances,
    principalTokenInfo.address,
    trancheDecimals
  );

  const baseAssetLiquidityLabel = `${baseAssetLiquidity?.toFixed(4)}`;
  const principalTokenLiquidityLabel = `${principalTokenLiquidity?.toFixed(4)}`;

  const poolName = `${baseAssetSymbol} - ${baseAssetSymbol} Principal Token`;
  const principalTokenSymbol =
    formatPrincipalTokenShortSymbol(principalTokenInfo);
  const poolLabel = `(${baseAssetSymbol} - ${principalTokenSymbol})`;

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
        <div className={tw("flex", "space-x-4", "overflow-hidden")}>
          {BaseAssetIcon ? (
            <BaseAssetIcon
              className={tw("flex-shrink-0")}
              height={72}
              width={72}
            />
          ) : null}
          <div
            className={tw(
              "flex",
              "w-full",
              "flex-col",
              "space-y-2",
              "overflow-hidden"
            )}
          >
            <span
              className={tw("flex", "space-x-2", "text-2xl", "font-semibold")}
            >
              <Link className={tw("truncate")} to={`/pools/${pool?.address}`}>
                {poolName}
              </Link>
              <a
                className={tw("flex", "items-center")}
                onClick={(e) => e.stopPropagation()}
                href={`https://etherscan.io/address/${principalTokenInfo.address}`}
                title={t`View LP token on etherscan`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon
                  intent={Intent.NONE}
                  className={tw("pr-2")}
                  icon={IconNames.SHARE}
                />
              </a>
            </span>
            <span className={classNames(Classes.TEXT_MUTED)}>{poolLabel}</span>
            <div className={tw("flex", "w-full", "items-center", "space-x-2")}>
              <Tag
                large
                intent={isRedeemable ? Intent.SUCCESS : Intent.PRIMARY}
                className={tw("justify-between")}
              >
                <span>{formattedDate}</span>
              </Tag>
              <span> {t`Principal token term`}</span>
            </div>
          </div>
        </div>
      </div>
      <div className={tw("flex", "flex-col", "space-y-5", "items-center")}>
        <div className={tw("flex", "w-full", "space-x-5", "items-center")}>
          <Callout className={calloutClassName}>
            <span
              className={classNames(tw("mb-0"))}
            >{t`${baseAssetSymbol} liquidity`}</span>
            <span className={tw("text-lg", "font-semibold")}>
              {baseAssetLiquidityLabel}
            </span>
          </Callout>
          <Callout className={calloutClassName}>
            <span
              className={classNames(tw("mb-0"))}
            >{t`Principal liquidity`}</span>
            <span className={tw("text-lg", "font-semibold")}>
              {principalTokenLiquidityLabel}
            </span>
          </Callout>
        </div>
        <Callout className={calloutClassName}>
          <span className={classNames(tw("mb-0"))}>{t`Share of pool`}</span>
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
          fill
          poolAddress={poolInfo.address}
          poolAction={PoolAction.REMOVE_LIQUIDITY}
          label={t`Remove LP`}
        />
        <GoToPoolButton
          fill
          poolAddress={poolInfo.address}
          poolAction={PoolAction.BUY}
          label={t`Go to Market`}
        />
      </ButtonGroup>
    </Card>
  );
}

function calculatePoolShareLiquidity(
  shareOfPool: number | undefined,
  poolTokenAddresses: string[] | undefined,
  poolTokenReserves: BigNumber[] | undefined,
  tokenAddress: string | undefined,
  tokenDecimals: number | undefined
): number | undefined {
  let baseAssetLiquidity: number | undefined;
  if (
    shareOfPool &&
    poolTokenAddresses &&
    poolTokenReserves &&
    tokenAddress &&
    tokenDecimals
  ) {
    const reservesByAddress = zipObject(poolTokenAddresses, poolTokenReserves);
    const reserves = reservesByAddress[tokenAddress];
    const reservesNumber = +formatUnits(reserves, tokenDecimals);
    baseAssetLiquidity = shareOfPool * reservesNumber;
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
