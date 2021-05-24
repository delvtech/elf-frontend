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
import { ConvergentCurvePool } from "elf-contracts/types/ConvergentCurvePool";
import { Tranche__factory } from "elf-contracts/types/factories/Tranche__factory";
import { BigNumber } from "ethers";
import { formatUnits } from "ethers/lib/utils";
import zipObject from "lodash.zipobject";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { findAssetIcon2 } from "efi-ui/crypto/CryptoIcon";
import { UnstakeConvergentCurvePoolButton } from "efi-ui/pools/UnstakeButton/UnstakeConvergentCurvePoolButton";
import { useBaseAssetForPool } from "efi-ui/pools/useBaseAssetForPool/useBaseAssetForPool";
import { usePoolTokens } from "efi-ui/pools/usePoolTokens/usePoolTokens";
import { useShareOfPool } from "efi-ui/pools/useShareOfPool";
import { GoToMarketButton } from "efi-ui/portfolio/PrincipalTokenCard/GoToMarketButton";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { useTokenDecimals } from "efi-ui/token/hooks/useTokenDecimals";
import { useTrancheUnlockTimestamp } from "efi-ui/tranche/useTrancheUnlockTimestamp";
import { KNOWN_BASE_ASSETS } from "efi/addresses";
import { convertEpochSecondsToDate } from "efi/base/convertEpochSecondsToDate";
import { formatAbbreviatedDate } from "efi/base/dates";
import { formatPercent } from "efi/base/formatPercent";
import { getSmartContractFromRegistry } from "efi/contracts/SmartContractsRegistry";
import { getCryptoAssetForToken } from "efi/crypto/getCryptoAssetForToken";
import { getCryptoSymbol } from "efi/crypto/getCryptoSymbol";
import { getPoolTokens } from "efi/pools/getPoolTokens";
import { PoolInfo } from "efi/pools/PoolInfo";
import { getTokenInfo } from "efi/tokenlists";
import { getTermAssetSymbol } from "efi/tranche/getTermAssetSymbol";
import { getVaultSymbol } from "efi/vaults/getVaultSymbol";

interface PrincipalTokenLPCardProps {
  library: Web3Provider | undefined;
  connector: AbstractConnector | undefined;
  account: string | null | undefined;
  pool: ConvergentCurvePool | undefined;
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
  library,
  account,
  connector,
  pool,
}: PrincipalTokenLPCardProps): ReactElement {
  const { isDarkMode } = useDarkMode();

  // base asset
  const baseAssetContract = useBaseAssetForPool(pool);
  const { data: baseAssetDecimals } = useTokenDecimals(baseAssetContract);
  const baseAssetCryptoAsset = getCryptoAssetForToken(
    baseAssetContract?.address
  );
  const baseAssetSymbol = getCryptoSymbol(baseAssetCryptoAsset);
  const BaseAssetIcon = findAssetIcon2(baseAssetCryptoAsset);

  // Principal token
  const tranche = useTrancheForPool(pool);
  const { data: trancheDecimals } = useTokenDecimals(tranche);
  const { data: unlockTimestamp } = useTrancheUnlockTimestamp(tranche);
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
    baseAssetContract?.address,
    baseAssetDecimals
  );
  const principalTokenLiquidity = calculatePoolShareLiquidity(
    shareOfPool,
    addresses,
    poolBalances,
    tranche?.address,
    trancheDecimals
  );

  const baseAssetLiquidityLabel = `${baseAssetLiquidity?.toFixed(4)}`;
  const principalTokenLiquidityLabel = `${principalTokenLiquidity?.toFixed(4)}`;

  const poolInfo = getTokenInfo<PoolInfo>(pool?.address as string);
  const poolName = `${baseAssetSymbol} - ${baseAssetSymbol} Principal Token`;
  const principalTokenSymbol = getPrincipalTokenSymbol(poolInfo);
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
                intent={Intent.PRIMARY}
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
              className={classNames(tw("text-base", "mb-0"))}
            >{t`${baseAssetSymbol} liquidity`}</span>
            <span className={tw("text-lg", "font-semibold")}>
              {baseAssetLiquidityLabel}
            </span>
          </Callout>
          <Callout className={calloutClassName}>
            <span
              className={classNames(tw("text-base", "mb-0"))}
            >{t`Principal liquidity`}</span>
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
        <UnstakeConvergentCurvePoolButton
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

function useTrancheForPool(pool: ConvergentCurvePool | undefined) {
  const { data: [poolTokens = []] = [] } = usePoolTokens(pool);
  const principalTokenAddress = poolTokens.find(
    (address) => !KNOWN_BASE_ASSETS.includes(address)
  );

  return getSmartContractFromRegistry(
    principalTokenAddress,
    Tranche__factory.connect
  );
}

export function getPrincipalTokenSymbol(poolInfo: PoolInfo): string {
  const { baseAssetInfo, termAssetInfo } = getPoolTokens(poolInfo);
  const baseCryptoAsset = getCryptoAssetForToken(baseAssetInfo.address);
  const vaultSymbol = getVaultSymbol(baseCryptoAsset);
  const { symbol: termAssetSymbol } = getTermAssetSymbol(
    termAssetInfo.address,
    vaultSymbol
  );

  return termAssetSymbol as string;
}
