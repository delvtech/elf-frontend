import React, { FC, ReactNode } from "react";

import {
  AnchorButton,
  Button,
  ButtonGroup,
  Callout,
  Card,
  Classes,
  H1,
  H4,
  H5,
  Icon,
  ProgressBar,
} from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Tooltip2 } from "@blueprintjs/popover2";
import classNames from "classnames";
import { jt, t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";

import { Elf__factory, ERC20__factory, Tranche } from "elf-contracts/types";
import { useTokenBalance } from "efi-ui/token/hooks/useTokenBalance";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { convertEpochSecondsToDate } from "efi/base/convertEpochSecondsToDate";
import { formatDuration, intervalToDuration } from "date-fns";
import { useSmartContractFromFactory } from "efi-ui/contracts/useSmartContractFromFactory/useSmartContractFromFactory";
import { getQueryData } from "efi-ui/base/queryResults";
import { useMarketForToken } from "efi-ui/markets/useMarketForToken";
import { useMarketSpotPrice } from "efi-ui/markets/useMarketSpotPrice";
import { formatCurrency } from "efi/base/formatCurrency/formatCurrency";
import { useCoinGeckoPrice } from "efi-ui/coingecko/useCoinGeckoPrice";
import { getCoinGeckoId } from "efi-coingecko";
import { useCurrencyPref } from "efi-ui/prefs/useCurrency/useCurencyPref";
import { calculateTrancheAPY } from "efi/tranche/calculateTrancheAPY";
import { navigate } from "@reach/router";
import { CryptoIconSvg } from "efi-ui/crypto/CryptoIcon";
import { CryptoSymbol } from "efi/crypto/CryptoSymbol";

interface FYTCardProps {
  account: string | null | undefined;
  tranche: Tranche;
}

export const FYTCard: FC<FYTCardProps> = ({ account, tranche }) => {
  const { isDarkMode } = useDarkMode();
  const { currency } = useCurrencyPref();
  const { data: trancheSymbol } = useSmartContractReadCall(tranche, "symbol");
  const { data: trancheName } = useSmartContractReadCall(tranche, "name");
  const { data: unlockTimestamp } = useSmartContractReadCall(
    tranche,
    "unlockTimestamp"
  );
  console.log("asdf", tranche.address);
  const { data: trancheDecimals } = useSmartContractReadCall(
    tranche,
    "decimals"
  );
  const trancheBalance = useTokenBalance(tranche, account);

  const vaultContract = useVaultForTranche(tranche);
  const { data: vaultName } = useSmartContractReadCall(vaultContract, "name");
  const market = useMarketForToken(tranche);
  const trancheSpotPriceResult = useMarketSpotPrice(market, tranche);
  const finalTokensResult = useSmartContractReadCall(market, "getFinalTokens");

  const finalTokenAddresses = getQueryData(finalTokensResult) || [];
  const baseAssetAddress = finalTokenAddresses.find(
    (address) => address !== tranche?.address
  );
  const baseAsset = useSmartContractFromFactory(
    baseAssetAddress,
    ERC20__factory.connect
  );
  const { data: baseAssetSymbol } = useSmartContractReadCall(
    baseAsset,
    "symbol"
  );

  const tranchePriceBigNumber = getQueryData(trancheSpotPriceResult);
  const tranchePriceInBaseAsset = +formatCurrency(
    tranchePriceBigNumber,
    trancheDecimals
  );
  const exitValue = trancheBalance * tranchePriceInBaseAsset;
  const { data: baseAssetCoinGeckoPrice } = useCoinGeckoPrice(
    getCoinGeckoId(baseAssetSymbol)
  );

  let fiatPrice;
  if (tranchePriceInBaseAsset && baseAssetCoinGeckoPrice) {
    fiatPrice = `${currency.symbol}${baseAssetCoinGeckoPrice
      .multiply(exitValue)
      .toDecimal()
      .toLocaleString()}`;
  }

  const iconKey = baseAssetSymbol?.toUpperCase() as CryptoSymbol;
  const BaseAssetIcon = iconKey ? CryptoIconSvg[iconKey] : () => null;

  const tableRowLink = getTableRowLink(vaultContract?.address, vaultName);
  const maturationDate = convertEpochSecondsToDate(unlockTimestamp);
  const timeLeft = getTimeLeft(maturationDate);
  let trancheAPY = 0;
  if (maturationDate) {
    trancheAPY = calculateTrancheAPY(
      +formatCurrency(tranchePriceBigNumber, trancheDecimals),
      Date.now(),
      maturationDate?.getTime()
    );
  }

  return (
    <Card
      style={{ width: 512 }}
      className={classNames(tw("p-8", "flex", "flex-col", "space-y-8"))}
    >
      <div className={tw("flex", "space-x-4")}>
        <BaseAssetIcon title={baseAssetSymbol} height={72} width={72} />
        <div className={tw("flex", "flex-col")}>
          <H4 className={tw("mb-2", "tracking-wide")}>
            <a
              title={t`View tranche on etherscan`}
              href={`https://etherscan.io/address/${tranche.address}`}
              target="_blank"
              rel="noreferrer noopener"
            >
              {trancheSymbol}
            </a>
          </H4>
          <div className={tw("flex", "space-x-5", "items-center")}>
            <H1 className={tw("mb-0")} title={trancheBalance.toLocaleString()}>
              {trancheBalance.toFixed(6)}
            </H1>
            <div className={tw("flex", "flex-col")}>
              <LabeledText
                bold
                text={
                  <div className={tw("flex", "space-x-1")}>
                    <span>{t`${exitValue.toFixed(6)} ${baseAssetSymbol}`}</span>
                    <span
                      className={Classes.TEXT_MUTED}
                    >{t`(${fiatPrice})`}</span>
                  </div>
                }
                label={t`Current exit value`}
              />
            </div>
          </div>
        </div>
      </div>
      <div>
        <div className={tw("mb-3")}>
          <strong>{t`Time to maturity:`}</strong> {timeLeft}
        </div>
        <ProgressBar stripes={false} animate={false} value={0.5} />
      </div>
      <Callout>
        <div>
          <LabeledText
            text={t`${(trancheAPY / 365).toFixed(2)}% daily`}
            label={t`${(trancheAPY / 12).toFixed(2)}% monthly`}
            subLabel={t`${trancheAPY.toFixed(2)}% yearly`}
          />
        </div>
      </Callout>
      {/* Asset */}
      <div>
        <LabeledText text={trancheSymbol} label={jt`via ${tableRowLink}`} />
      </div>

      {/* Quick Actions */}
      <div className={tw("flex", "flex-col", "h-full", "w-full", "space-y-2")}>
        <Button large outlined>{t`Stake`}</Button>
        <ButtonGroup fill>
          <Tooltip2
            inheritDarkTheme={false}
            content={t`This asset can be claimed after it has reached maturity.`}
          >
            <AnchorButton
              large
              outlined
              disabled={
                /*
                 * See Blueprint docs, we have to use an AnchorButton for a11y
                 * when putting a tooltip on a disabled button
                 */
                true
              }
            >
              {t`Claim`}
            </AnchorButton>
          </Tooltip2>
          <Button large outlined>{t`Sell`}</Button>
        </ButtonGroup>
        <AnchorButton
          onClick={() => navigate(`exchange/${market?.address}`)}
          large
          minimal
        >{t`Go to market`}</AnchorButton>
      </div>
    </Card>
  );
};

function useVaultForTranche(tranche: Tranche) {
  const elfAddressResult = useSmartContractReadCall(tranche, "elf");
  const elfContract = useSmartContractFromFactory(
    getQueryData(elfAddressResult),
    Elf__factory.connect
  );
  const vaultAddressResult = useSmartContractReadCall(elfContract, "vault");
  const vaultContract = useSmartContractFromFactory(
    getQueryData(vaultAddressResult),
    ERC20__factory.connect
  );
  return vaultContract;
}

function getTimeLeft(maturationDate: Date | undefined) {
  if (!maturationDate) {
    return;
  }

  const duration = intervalToDuration({
    start: Date.now(),
    end: maturationDate.getTime(),
  });

  const timeLeft = t`${formatDuration(duration, {
    delimiter: ", ",
    format: ["years", "months", "days"],
  })}`;

  return timeLeft;
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
