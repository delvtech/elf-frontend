import React, { ReactElement, useMemo } from "react";

import {
  ButtonGroup,
  Callout,
  Card,
  Icon,
  Intent,
  Tag,
} from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Web3Provider } from "@ethersproject/providers";
import { Link } from "@reach/router";
import classNames from "classnames";
import { Tranche } from "elf-contracts/types/Tranche";
import { PrincipalTokenInfo } from "tokenlists/types";
import { jt, t } from "ttag";

import { getCoinGeckoId } from "efi-coingecko";
import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { useCoinGeckoPrice } from "efi-ui/coingecko/useCoinGeckoPrice";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { findAssetIcon } from "efi-ui/crypto/CryptoIcon";
import { GoToPoolButton } from "efi-ui/pools/GoToPoolButton/GoToPoolButton";
import { usePoolTokenPrices } from "efi-ui/pools/usePoolTokenPrices/usePoolTokenPrices";
import { PoolAction } from "efi-ui/pools/usePoolViewPoolActionsPref/usePoolViewPoolActionsPref";
import { RedeemPrincipalTokensButton } from "efi-ui/portfolio/RedeemButton/RedeemPrincipalTokensButton";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { useTokenBalanceUNSAFE } from "efi-ui/token/hooks/useTokenBalance";
import { calculateProgress } from "efi/base/calculateProgress";
import { convertEpochSecondsToDate } from "efi/base/convertEpochSecondsToDate";
import { formatAbbreviatedDate } from "efi/base/dates";
import { formatPercent } from "efi/base/formatPercent";
import { ERC20Shim } from "efi/contracts/ERC20Shim";
import { getCryptoAssetForToken } from "efi/crypto/getCryptoAssetForToken";
import { getCryptoSymbol } from "efi/crypto/getCryptoSymbol";
import { formatMoney } from "efi/money/formatMoney";
import { getPoolInfoForPrincipalToken } from "efi/pools/ccpool";
import { getPoolContract } from "efi/pools/getPoolContract";
import { getPoolTokens } from "efi/pools/getPoolTokens";
import { calculateTrancheAPY } from "efi/tranche/calculateTrancheAPY";
import { getTermAssetSymbol } from "efi/tranche/getTermAssetSymbol";
import { getVaultForTranche } from "efi/tranche/tranches";
import { getVaultSymbol } from "efi/vaults/getVaultSymbol";

import { MaturityTimeBar } from "./MaturityTimeBar";

interface PrincipalTokenCardProps {
  chainId: number | undefined;
  library: Web3Provider | undefined;
  account: string | null | undefined;
  tranche: Tranche;
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

export function PrincipalTokenCard(
  props: PrincipalTokenCardProps
): ReactElement {
  const { library, account, tranche } = props;
  const poolInfo = getPoolInfoForPrincipalToken(tranche.address);
  const { baseAssetInfo, termAssetInfo } = getPoolTokens(poolInfo);
  const baseAsset = getCryptoAssetForToken(baseAssetInfo.address);
  const principalTokenInfo: PrincipalTokenInfo =
    termAssetInfo as PrincipalTokenInfo; // we know pool is a principal token pool.
  const { createdAtTimestamp: trancheCreatedAt, unlockTimestamp } =
    principalTokenInfo.extensions;

  const { isDarkMode } = useDarkMode();

  const unlockDate = convertEpochSecondsToDate(unlockTimestamp);
  const createdAtDate = convertEpochSecondsToDate(trancheCreatedAt);
  const progress = calculateProgress(createdAtDate, unlockDate);

  const formattedDate = unlockDate
    ? formatAbbreviatedDate(unlockDate)
    : t`Loading unlock date...`;

  const trancheBalance = useTokenBalanceUNSAFE(
    tranche as unknown as ERC20Shim,
    account
  );

  const vaultContract = getVaultForTranche(tranche.address);
  const { data: vaultName } = useSmartContractReadCall(vaultContract, "name");
  const pool = getPoolContract(poolInfo.address);
  const { baseAssetContract } = getPoolTokens(poolInfo);

  const { spotPriceBaseAssetForOneToken: tranchePriceInBaseAsset = 0 } =
    usePoolTokenPrices(pool, baseAssetContract);

  const baseAssetSymbol = getCryptoSymbol(baseAsset);

  const exitValue = trancheBalance * tranchePriceInBaseAsset;
  const { data: baseAssetCoinGeckoPrice } = useCoinGeckoPrice(
    getCoinGeckoId(baseAssetSymbol)
  );

  let fiatPrice;
  if (tranchePriceInBaseAsset && baseAssetCoinGeckoPrice) {
    fiatPrice = formatMoney(baseAssetCoinGeckoPrice.multiply(exitValue));
  }

  const BaseAssetIcon = findAssetIcon(baseAsset);

  const tableRowLink = getTableRowLink(vaultContract?.address, vaultName);
  const maturationDate = useMemo(
    () => convertEpochSecondsToDate(unlockTimestamp),
    [unlockTimestamp]
  );

  let trancheAPY = 0;
  if (maturationDate) {
    trancheAPY = calculateTrancheAPY(
      tranchePriceInBaseAsset,
      Date.now(),
      maturationDate?.getTime()
    );
  }

  const vaultSymbol: string | undefined = getVaultSymbol(baseAsset);

  const { symbol: termAssetSymbol } = getTermAssetSymbol(
    tranche.address,
    vaultSymbol
  );

  return (
    <Card
      style={{ width: 512, height: 632 }}
      className={classNames(
        tw("p-8", "flex", "flex-col", "m-4", "space-y-5", "text-base", {
          "text-gray-700": !isDarkMode,
          "text-white": isDarkMode,
        })
      )}
    >
      <div className={tw("flex", "space-x-4")}>
        {BaseAssetIcon ? (
          <BaseAssetIcon
            className={tw("flex-shrink-0")}
            height={72}
            width={72}
          />
        ) : null}
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
              {t`${baseAssetSymbol} Principal Token` || null}
            </Link>
            <a
              className={tw("flex", "items-center")}
              onClick={(e) => e.stopPropagation()}
              href={`https://etherscan.io/address/${tranche?.address}`}
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
            <Tag
              large
              intent={Intent.PRIMARY}
              fill
              className={tw("text-center")}
            >
              {formattedDate}
            </Tag>
            <div className={tw("flex", "space-x-6", "justify-end")}>
              <LabeledText
                bold
                textClassName={tw("text-base")}
                text={`${formatPercent(trancheAPY)}`}
                label={t`yearly`}
              />
              <LabeledText
                bold
                textClassName={tw("text-base")}
                text={`${formatPercent(trancheAPY / 12)}`}
                label={t`monthly`}
              />
              <LabeledText
                bold
                textClassName={tw("text-base")}
                text={`${formatPercent(trancheAPY / 365)}`}
                label={t`daily`}
              />
            </div>
          </div>
        </div>
      </div>
      <div className={tw("flex", "flex-col", "space-y-5", "items-center")}>
        <MaturityTimeBar progress={progress} maturationDate={maturationDate} />

        <Callout className={calloutClassName}>
          <span
            className={classNames(tw("text-base", "mb-0"))}
          >{t`Total balance`}</span>
          <LabeledText
            muted={false}
            className={tw("flex", "justify-center", "items-center")}
            containerClassName={tw("justify-center")}
            bold
            textClassName={tw("text-2xl")}
            text={`${trancheBalance.toFixed(6)} ${termAssetSymbol}`}
            label={t`1 Principal Token = 1 ${baseAssetSymbol} at maturity`}
          />
        </Callout>
        <Callout icon={null} className={calloutClassName}>
          <span
            className={classNames(tw("text-base", "mb-0"))}
          >{t`Current exit value`}</span>
          <LabeledText
            bold
            muted={false}
            className={tw("flex", "justify-center", "items-center")}
            containerClassName={tw("justify-center")}
            textClassName={tw("text-2xl")}
            text={<span>{t`${exitValue.toFixed(6)} ${baseAssetSymbol}`}</span>}
            label={fiatPrice}
          />
        </Callout>
      </div>

      {/* Quick Actions */}
      <ButtonGroup fill>
        <RedeemPrincipalTokensButton
          library={library}
          account={account}
          principalTokenInfo={principalTokenInfo}
          baseAsset={baseAsset}
        />
        <GoToPoolButton
          poolAddress={poolInfo.address}
          poolAction={PoolAction.ADD_LIQUIDITY}
          label={t`Add Liquidity`}
        />
        <GoToPoolButton
          poolAddress={poolInfo.address}
          poolAction={PoolAction.SELL}
          label={t`Sell`}
        />
      </ButtonGroup>
      <div className={tw("flex", "justify-center")}>
        <span>
          {jt`Fixed yield is backed by ${baseAssetSymbol} deposited in ${tableRowLink}`}
        </span>
      </div>
    </Card>
  );
}

function getTableRowLink(
  vaultAddress: string | undefined,
  vaultName: string | undefined
): ReactElement | null {
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
