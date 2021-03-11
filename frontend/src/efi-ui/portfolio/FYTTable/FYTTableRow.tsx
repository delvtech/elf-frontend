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
import { useTokenBalance } from "efi-ui/token/hooks/useTokenBalance";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { convertEpochSecondsToDate } from "efi/base/convertEpochSecondsToDate";
import { formatAbbreviatedDate } from "efi/base/dates";
import { useSmartContractFromFactory } from "efi-ui/contracts/useSmartContractFromFactory/useSmartContractFromFactory";
import { getQueryData } from "efi-ui/base/queryResults";
import { formatCurrency } from "efi/base/formatCurrency/formatCurrency";
import { useCoinGeckoPrice } from "efi-ui/coingecko/useCoinGeckoPrice";
import { getCoinGeckoId } from "efi-coingecko";
import { useCurrencyPref } from "efi-ui/prefs/useCurrency/useCurencyPref";
import { calculateTrancheAPY } from "efi/tranche/calculateTrancheAPY";
import { navigate } from "@reach/router";
import { getTimeLeft2 } from "efi/base/time";
import { usePoolForToken } from "efi-ui/pools/usePoolForToken/usePoolForToken";
import { useOnSwapGivenIn } from "efi-ui/pools/useOnSwapGivenIn/useOnSwapGivenIn";
import { BigNumber } from "ethers";
import { usePoolPairedToken } from "efi-ui/pools/usePoolPairedToken/usePoolPairedToken";
import { ERC20__factory } from "elf-contracts/types/factories/ERC20__factory";
import { YVaultAssetProxy__factory } from "elf-contracts/types/factories/YVaultAssetProxy__factory";
import { Tranche } from "elf-contracts/types/Tranche";
import { Web3Provider } from "@ethersproject/providers";

interface FYTTableRowProps {
  library: Web3Provider | undefined;
  account: string | null | undefined;
  tranche: Tranche;
}

export const FYTTableRow: FC<FYTTableRowProps> = ({
  library,
  account,
  tranche,
}) => {
  const { isDarkMode } = useDarkMode();
  const { currency } = useCurrencyPref();
  const { data: trancheSymbol } = useSmartContractReadCall(tranche, "symbol");
  const { data: unlockTimestamp } = useSmartContractReadCall(
    tranche,
    "unlockTimestamp"
  );
  const { data: trancheDecimals } = useSmartContractReadCall(
    tranche,
    "decimals"
  );
  const trancheBalance = useTokenBalance(tranche, account);

  const elfAddressResult = useSmartContractReadCall(tranche, "elf");
  const elfContract = useSmartContractFromFactory(
    getQueryData(elfAddressResult),
    YVaultAssetProxy__factory.connect
  );
  const vaultAddressResult = useSmartContractReadCall(elfContract, "vault");
  const vaultContract = useSmartContractFromFactory(
    getQueryData(vaultAddressResult),
    ERC20__factory.connect
  );
  const { data: vaultName } = useSmartContractReadCall(vaultContract, "name");
  const pool = usePoolForToken(tranche);
  const trancheSpotPriceResult = useOnSwapGivenIn(
    pool,
    account,
    tranche,
    BigNumber.from(1)
  );
  const baseAsset = usePoolPairedToken(pool, tranche);
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

  const tableRowLink = getTableRowLink(vaultContract?.address, vaultName);
  const maturationDate = convertEpochSecondsToDate(unlockTimestamp);
  const timeLeft = getTimeLeft2(maturationDate);
  let trancheAPY = 0;
  if (maturationDate) {
    trancheAPY = calculateTrancheAPY(
      +formatCurrency(tranchePriceBigNumber, trancheDecimals),
      Date.now(),
      maturationDate?.getTime()
    );
  }

  const tableRowClassName = isDarkMode ? styles.tableRowDark : styles.tableRow;

  return (
    <div
      className={classNames(
        tableRowClassName,
        tw("grid", "grid-cols-6", "gap-2", "w-full", "p-4")
      )}
    >
      {/* Asset */}
      <div>
        <LabeledText text={trancheSymbol} label={jt`via ${tableRowLink}`} />
      </div>
      {/* Quantity */}
      <div>
        <LabeledText text={t`${trancheBalance.toFixed(6)}`} label="" />
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
          text={t`${(trancheAPY / 365).toFixed(2)}% daily`}
          label={t`${(trancheAPY / 12).toFixed(2)}% monthly`}
          subLabel={t`${trancheAPY.toFixed(2)}% yearly`}
        />
      </div>

      {/* Maturation date */}
      <div>
        <LabeledText
          text={maturationDate && formatAbbreviatedDate(maturationDate)}
          label={t`in ${timeLeft}`}
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
        <AnchorButton
          onClick={() => navigate(`exchange/${pool?.address}`)}
          outlined
        >{t`Go to market`}</AnchorButton>
      </div>
    </div>
  );
};

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
