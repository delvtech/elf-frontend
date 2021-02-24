import React, { FC, ReactNode } from "react";

import { AnchorButton, Button, Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Tooltip2 } from "@blueprintjs/popover2";
import classNames from "classnames";
import { jt, t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";

import styles from "efi-ui/base/table.module.css";
import { Elf__factory, ERC20__factory, Tranche } from "elf-contracts/types";
import { useTokenBalance } from "efi-ui/token/hooks/useTokenBalance";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { convertEpochSecondsToDate } from "efi/base/convertEpochSecondsToDate";
import { formatAbbreviatedDate } from "efi/base/dates";
import { formatDuration, intervalToDuration } from "date-fns";
import { useSmartContractFromFactory } from "efi-ui/contracts/useSmartContractFromFactory/useSmartContractFromFactory";
import { getQueryData } from "efi-ui/base/queryResults";
import { useMarketForToken } from "efi-ui/markets/useMarketForToken";
import { useMarketSpotPrice } from "efi-ui/markets/useMarketSpotPrice";
import { formatCurrency } from "efi/base/formatCurrency/formatCurrency";
import { useCoinGeckoPrice } from "efi-ui/coingecko/useCoinGeckoPrice";
import { getCoinGeckoId } from "efi-coingecko";
import { useCurrencyPref } from "efi-ui/prefs/useCurrency/useCurencyPref";

interface FYTTableRowProps {
  account: string | null | undefined;
  tranche: Tranche;
}

export const FYTTableRow: FC<FYTTableRowProps> = ({ account, tranche }) => {
  const { isDarkMode } = useDarkMode();
  const { currency } = useCurrencyPref();
  const { data: trancheSymbol } = useSmartContractReadCall(tranche, "symbol");
  const { data: unlockTimestamp } = useSmartContractReadCall(
    tranche,
    "unlockTimestamp"
  );
  const { data: trancheName } = useSmartContractReadCall(tranche, "name");
  const { data: trancheDecimals } = useSmartContractReadCall(
    tranche,
    "decimals"
  );
  const trancheBalance = useTokenBalance(tranche, account);

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
    fiatPrice = `${currency.symbol}${baseAssetCoinGeckoPrice.multiply(
      exitValue
    )}`;
  }

  const tableRowLink = getTableRowLink(vaultContract?.address, vaultName);
  const maturationDate = convertEpochSecondsToDate(unlockTimestamp);
  const timeLeft = getTimeLeft(maturationDate);

  const tableRowClassName = isDarkMode ? styles.tableRowDark : styles.tableRow;

  return (
    <div
      className={classNames(
        tableRowClassName,
        tw("grid", "grid-cols-6", "w-full", "p-4")
      )}
    >
      {/* Asset */}
      <div>
        <LabeledText text={trancheName} label={jt`via ${tableRowLink}`} />
      </div>
      {/* Quantity */}
      <div>
        <LabeledText
          text={t`${trancheBalance.toFixed(6)} ${trancheSymbol}`}
          label=""
        />
      </div>

      {/* Current value */}
      <div>
        <LabeledText
          text={t`${exitValue.toFixed(6)} ${baseAssetSymbol}`}
          label={t`${fiatPrice} USD`}
        />
      </div>

      {/* Yield rate*/}
      <div>
        <LabeledText
          text={t`0.32% daily`}
          label={t`4.21% monthly`}
          subLabel={t`12.21% yearly`}
        />
      </div>

      {/* Maturation date */}
      <div>
        <LabeledText
          text={maturationDate && formatAbbreviatedDate(maturationDate)}
          label={timeLeft}
        />
      </div>

      {/* Quick Actions */}
      <div className={tw("flex", "flex-col", "h-full", "w-full", "space-y-2")}>
        <Button outlined>{t`Sell`}</Button>
        <Button outlined>{t`Stake`}</Button>
        <Tooltip2
          inheritDarkTheme={false}
          content={t`This asset can be claimed after it has reached maturity.`}
        >
          <AnchorButton
            fill
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
        <Button outlined>{t`Go to market`}</Button>
      </div>
    </div>
  );
};

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
  })} left`;

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
