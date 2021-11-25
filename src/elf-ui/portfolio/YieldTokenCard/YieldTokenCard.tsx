import React, { ReactElement, ReactNode } from "react";

import {
  ButtonGroup,
  Callout,
  Card,
  Elevation,
  Icon,
  Intent,
  Tag,
} from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Web3Provider } from "@ethersproject/providers";
import { Link } from "@reach/router";
import { AbstractConnector } from "@web3-react/abstract-connector";
import classNames from "classnames";
import { InterestToken } from "elf-contracts-typechain/dist/types/InterestToken";
import { formatUnits } from "ethers/lib/utils";
import { PrincipalTokenInfo, YieldTokenInfo } from "tokenlists/types";
import { jt, t } from "ttag";

import { getCoinGeckoId } from "elf-coingecko";
import tw from "elf-tailwindcss-classnames";
import { LabeledText } from "elf-ui/base/LabeledText/LabeledText";
import { useCoinGeckoPrice } from "elf-ui/coingecko/useCoinGeckoPrice";
import { findAssetIcon } from "elf-ui/crypto/CryptoIcon";
import { GoToPoolButtonOld } from "elf-ui/pools/GoToPoolButton/GoToPoolButtonOld";
import { usePoolSpotPrice } from "elf-ui/pools/hooks/usePoolSpotPrice/usePoolSpotPrice";
import { PoolAction } from "elf-ui/pools/hooks/usePoolViewPoolActionsPref/usePoolViewPoolActionsPref";
import { MaturityTimeBar } from "elf-ui/portfolio/PrincipalTokenCard/MaturityTimeBar";
import { RedeemYieldTokensButtonOld } from "elf-ui/portfolio/RedeemButton/RedeemYieldTokensButtonOld";
import { useCurrencyPref } from "elf-ui/prefs/useCurrency/useCurencyPref";
import { useDarkMode } from "elf-ui/prefs/useDarkMode/useDarkMode";
import { useTokenBalanceOf } from "elf-ui/token/hooks/useTokenBalanceOf";
import { useYearnVault } from "elf-ui/yearn/useYearnVault";
import { calculateProgress } from "elf/base/calculateProgress";
import { convertEpochSecondsToDate } from "elf/base/convertEpochSecondsToDate";
import { formatAbbreviatedDate } from "elf/base/dates";
import { formatPercent } from "elf/base/formatPercent";
import { getCryptoAssetForToken } from "elf/crypto/getCryptoAssetForToken";
import { getCryptoDecimals } from "elf/crypto/getCryptoDecimals";
import { getCryptoSymbol } from "elf/crypto/getCryptoSymbol";
import { formatMoney } from "elf/money/formatMoney";
import { getPoolForYieldToken } from "elf/pools/weightedPool";
import { getTokenInfo } from "elf/tokenlists";
import {
  getVaultContractForTranche,
  getVaultTokenInfoForTranche,
} from "elf/tranche/tranches";
import { getYearnVaultAPY } from "elf-yearn/fetchYearnVaults";
import { formatYieldTokenShortSymbol } from "elf/interestToken/formatYieldTokenShortSymbol";
import { useNowMs } from "elf-ui/base/hooks/useNowMs/useNowMs";

interface YieldTokenCardProps {
  library: Web3Provider | undefined;
  account: string | null | undefined;
  chainId: number | undefined;
  walletConnectionActive: boolean;
  connector: AbstractConnector | undefined;
  yieldToken: InterestToken;
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

export function YieldTokenCard({
  account,
  library,
  yieldToken,
}: YieldTokenCardProps): ReactElement {
  const { isDarkMode } = useDarkMode();
  const nowMs = useNowMs();
  const { currency } = useCurrencyPref();

  const yieldTokenInfo = getTokenInfo<YieldTokenInfo>(yieldToken.address);

  const { data: yieldTokenBalanceOf } = useTokenBalanceOf(yieldToken, account);
  const yieldTokenBalance = +formatUnits(
    yieldTokenBalanceOf ?? 0,
    yieldTokenInfo?.decimals
  );

  // The tranche contains the unlockTimestamp
  const trancheAddress = yieldTokenInfo?.extensions?.tranche;
  const trancheInfo = getTokenInfo<PrincipalTokenInfo>(trancheAddress);

  const {
    address: principalTokenAddress,
    extensions: {
      createdAtTimestamp: trancheCreatedAt,
      unlockTimestamp,
      underlying,
    },
  } = trancheInfo;
  const unlockDate = convertEpochSecondsToDate(unlockTimestamp);
  const createdAtDate = convertEpochSecondsToDate(trancheCreatedAt);
  const vaultContract = getVaultContractForTranche(trancheInfo.address);

  const baseAsset = getCryptoAssetForToken(underlying);
  const baseAssetSymbol = getCryptoSymbol(baseAsset);
  const { data: baseAssetFiatPrice } = useCoinGeckoPrice(
    getCoinGeckoId(baseAssetSymbol),
    currency
  );
  const baseAssetDecimals = getCryptoDecimals(baseAsset);

  const pool = getPoolForYieldToken(yieldToken.address);

  const spotPrice = usePoolSpotPrice(pool, yieldToken.address);
  const BaseAssetIcon = findAssetIcon(baseAsset);

  const { symbol: vaultSymbol, address: vaultAddress } =
    getVaultTokenInfoForTranche(principalTokenAddress);
  const { data: yearnVault } = useYearnVault(vaultSymbol, vaultAddress);
  const { name: vaultName } = yearnVault || {};

  const vaultApy = yearnVault?.apy ? getYearnVaultAPY(yearnVault?.apy) : 0;
  const postedAPY = formatPercent(vaultApy);

  const exitValue =
    +formatUnits(yieldTokenBalanceOf || 0, baseAssetDecimals) *
    (spotPrice || 0);
  const exitValueFiat = formatMoney(baseAssetFiatPrice?.multiply(exitValue));
  const formattedDate = unlockDate
    ? formatAbbreviatedDate(unlockDate)
    : t`Loading unlock date...`;
  const progress = calculateProgress(createdAtDate, unlockDate);
  const tableRowLink = getTableRowLink(vaultContract?.address, vaultName);

  const yieldTokenShortSymbol = formatYieldTokenShortSymbol(yieldTokenInfo);

  return (
    <Card
      style={{ width: 512 }}
      elevation={Elevation.TWO}
      className={classNames(
        tw("p-8", "flex", "flex-col", "m-4", "space-y-5", "text-base", {
          "text-gray-700": !isDarkMode,
          "text-white": isDarkMode,
        })
      )}
    >
      <div className={tw("flex", "space-x-4")}>
        <BaseAssetIcon className={tw("flex-shrink-0")} height={72} width={72} />
        <div className={tw("flex", "flex-col", "space-y-2")}>
          <div
            className={tw(
              "flex",
              "items-center",
              "space-x-2",
              "text-2xl",
              "font-semibold"
            )}
          >
            <Link to={`/pools/${pool?.address}`}>
              {t`${baseAssetSymbol} Yield Token` || null}
            </Link>
            <a
              className={tw("flex", "items-center")}
              onClick={(e) => e.stopPropagation()}
              href={`https://etherscan.io/address/${yieldToken?.address}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon
                intent={Intent.NONE}
                className={tw("pr-2")}
                icon={IconNames.SHARE}
              />
            </a>
          </div>
          <div
            className={tw(
              "flex",
              "w-full",
              "items-center",
              "justify-center",
              "space-x-8"
            )}
          >
            <div>
              <Tag
                large
                intent={
                  unlockTimestamp * 1000 < nowMs
                    ? Intent.SUCCESS
                    : Intent.PRIMARY
                }
                fill
                className={tw("text-center")}
              >
                {formattedDate}
              </Tag>
            </div>
            <div className={tw("flex", "space-x-6", "justify-end")}>
              <LabeledText
                bold
                textClassName={tw("text-base")}
                text={postedAPY}
                label={t`Position APY`}
              />
            </div>
          </div>
        </div>
      </div>
      <div className={tw("flex", "flex-col", "space-y-5", "items-center")}>
        <MaturityTimeBar
          progress={progress}
          unlockTimestamp={unlockTimestamp}
        />
        <Callout className={calloutClassName}>
          <span className={classNames(tw("mb-0"))}>{t`Total balance`}</span>
          <LabeledText
            muted={false}
            className={tw("flex", "justify-center", "items-center")}
            bold
            textClassName={tw("text-lg")}
            containerClassName={tw("justify-center")}
            text={`${yieldTokenBalance.toFixed(6)} ${yieldTokenShortSymbol}`}
            label={""}
          />
        </Callout>
        <Callout icon={null} className={calloutClassName}>
          <span className={classNames(tw("mb-0"))}>{t`Current value`}</span>
          <LabeledText
            bold
            muted={false}
            className={tw("flex", "justify-center", "items-center")}
            textClassName={tw("text-lg")}
            containerClassName={tw("justify-center")}
            text={<span>{t`${exitValue.toFixed(6)} ${baseAssetSymbol}`}</span>}
            label={exitValueFiat}
          />
        </Callout>
      </div>
      {/* Quick Actions */}
      <ButtonGroup fill>
        <RedeemYieldTokensButtonOld
          account={account}
          yieldTokenInfo={yieldTokenInfo}
          library={library}
          baseAsset={baseAsset}
        />
        <GoToPoolButtonOld
          fill
          poolAddress={pool.address}
          poolAction={PoolAction.ADD_LIQUIDITY}
          label={t`Add Liquidity`}
        />
        <GoToPoolButtonOld
          fill
          poolAddress={pool.address}
          poolAction={PoolAction.SELL}
          label={t`Sell`}
        />
      </ButtonGroup>
      <div className={tw("flex", "justify-center")}>
        <span>
          {jt`Yield accrued on ${baseAssetSymbol} deposited in ${tableRowLink}`}
        </span>
      </div>
    </Card>
  );
}

function getTableRowLink(
  vaultAddress: string | undefined,
  vaultName: string | undefined
): ReactNode {
  if (!vaultAddress || !vaultName) {
    return null;
  }

  return (
    <a key="table-row-link" href={`https://etherscan.io/token/${vaultAddress}`}>
      {vaultName}{" "}
      <sup>
        <Icon icon={IconNames.SHARE} iconSize={8} />
      </sup>
    </a>
  );
}
