import React, { FC, ReactNode } from "react";

import {
  AnchorButton,
  Button,
  ButtonGroup,
  Callout,
  Card,
  Icon,
  Intent,
  ProgressBar,
  Tag,
} from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Tooltip2 } from "@blueprintjs/popover2";
import { navigate } from "@reach/router";
import classNames from "classnames";
import { formatDuration, intervalToDuration } from "date-fns";
import { ERC20__factory } from "elf-contracts/types/factories/ERC20__factory";
import { YVaultAssetProxy__factory } from "elf-contracts/types/factories/YVaultAssetProxy__factory";
import { Tranche } from "elf-contracts/types/Tranche";
import { BigNumber } from "ethers";
import { jt, t } from "ttag";

import { getCoinGeckoId } from "efi-coingecko";
import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { getQueryData } from "efi-ui/base/queryResults";
import { useCoinGeckoPrice } from "efi-ui/coingecko/useCoinGeckoPrice";
import { useSmartContractFromFactory } from "efi-ui/contracts/useSmartContractFromFactory/useSmartContractFromFactory";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { CryptoIconSvg } from "efi-ui/crypto/CryptoIcon";
import { useOnSwapGivenIn } from "efi-ui/pools/useOnSwapGivenIn/useOnSwapGivenIn";
import { usePoolForToken } from "efi-ui/pools/usePoolForToken/usePoolForToken";
import { usePoolPairedToken } from "efi-ui/pools/usePoolPairedToken/usePoolPairedToken";
import { useCurrencyPref } from "efi-ui/prefs/useCurrency/useCurencyPref";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { useTokenBalance } from "efi-ui/token/hooks/useTokenBalance";
import { convertEpochSecondsToDate } from "efi/base/convertEpochSecondsToDate";
import { formatCurrency } from "efi/base/formatCurrency/formatCurrency";
import { CryptoSymbol } from "efi/crypto/CryptoSymbol";
import { formatMoney } from "efi/money/formatMoney";
import { calculateTrancheAPY } from "efi/tranche/calculateTrancheAPY";
import { Web3Provider } from "@ethersproject/providers";

interface FYTCardProps {
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
export const FYTCard: FC<FYTCardProps> = ({ library, account, tranche }) => {
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

  const vaultContract = useVaultForTranche(tranche);
  const { data: vaultName } = useSmartContractReadCall(vaultContract, "name");
  const pool = usePoolForToken(tranche);
  const trancheSpotPriceResult = useOnSwapGivenIn(
    pool,
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
    fiatPrice = formatMoney(baseAssetCoinGeckoPrice.multiply(exitValue));
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
    <div>
      <Card
        style={{ width: 512 }}
        className={classNames(
          tw("p-8", "flex", "flex-col", "space-y-8", "text-base", {
            "text-gray-700": !isDarkMode,
            "text-white": isDarkMode,
          })
        )}
      >
        <div className={tw("flex", "space-x-4")}>
          <BaseAssetIcon
            className={tw("flex-shrink-0")}
            title={baseAssetSymbol}
            height={72}
            width={72}
          />
          <div className={tw("flex", "flex-col", "space-y-2")}>
            <span className={tw("text-xl", "font-semibold", "tracking-wide")}>
              <a
                title={t`View tranche on etherscan`}
                href={`https://etherscan.io/address/${tranche.address}`}
                target="_blank"
                rel="noreferrer noopener"
              >
                {trancheSymbol}
              </a>
            </span>
            <div
              className={tw(
                "flex",
                "w-full",
                "items-center",
                "justify-center",
                "space-x-8"
              )}
            >
              <Tag large minimal>{t`Fixed rate`}</Tag>
              <div className={tw("flex", "space-x-6", "justify-end")}>
                <LabeledText
                  bold
                  textClassName={tw("text-base")}
                  text={`${trancheAPY.toFixed(2)}%`}
                  label={t`yearly`}
                />
                <LabeledText
                  bold
                  textClassName={tw("text-base")}
                  text={`${(trancheAPY / 12).toFixed(2)}%`}
                  label={t`monthly`}
                />
                <LabeledText
                  bold
                  textClassName={tw("text-base")}
                  text={`${(trancheAPY / 365).toFixed(2)}%`}
                  label={t`daily`}
                />
              </div>
            </div>
          </div>
        </div>
        <div className={tw("flex", "flex-col", "space-y-5", "items-center")}>
          <div className={tw("space-y-2", "w-full")}>
            <div>
              <span className={tw("text-base")}>
                {t`Reaches maturity in`} <strong>{timeLeft}</strong>
              </span>
            </div>
            <ProgressBar stripes={false} animate={false} value={0.5} />
          </div>

          <Callout className={calloutClassName}>
            <span
              className={classNames(tw("text-base", "mb-0"))}
            >{t`Total balance`}</span>
            <LabeledText
              muted={false}
              className={tw("flex", "justify-center", "items-center")}
              bold
              textClassName={tw("text-2xl")}
              text={`${trancheBalance.toFixed(6)} FYT`}
              label={t`1 FYT = 1 ${baseAssetSymbol} at maturity`}
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
              textClassName={tw("text-2xl")}
              text={
                <span>{t`${exitValue.toFixed(6)} ${baseAssetSymbol}`}</span>
              }
              label={`${currency.symbol}${fiatPrice}`}
            />
          </Callout>
        </div>

        {/* Quick Actions */}
        <ButtonGroup className={tw("space-x-6")}>
          <Tooltip2
            inheritDarkTheme={false}
            content={t`This asset can be claimed after it has reached maturity.`}
          >
            <AnchorButton
              fill
              minimal
              disabled={
                /*
                 * See Blueprint docs, we have to use an AnchorButton for a11y
                 * when putting a tooltip on a disabled button
                 */
                true
              }
            >
              <div className={tw("p-2", "text-base")}>{t`Claim`}</div>
            </AnchorButton>
          </Tooltip2>
          <Button fill minimal intent={Intent.PRIMARY}>
            <div className={tw("p-2", "text-base")}>{t`Sell`}</div>
          </Button>
          <Button fill minimal intent={Intent.PRIMARY}>
            <div className={tw("p-2", "text-base")}>{t`Stake`}</div>
          </Button>
          <AnchorButton
            intent={Intent.PRIMARY}
            onClick={() => navigate(`exchange/${pool?.address}`)}
            minimal
          >
            <div className={tw("p-2", "text-base")}>{t`Go to market`}</div>
          </AnchorButton>
        </ButtonGroup>
        <div className={tw("flex", "justify-center")}>
          <span>
            {jt`Fixed yield is backed by ${baseAssetSymbol} deposited in ${tableRowLink}`}
          </span>
        </div>
      </Card>
    </div>
  );
};

function useVaultForTranche(tranche: Tranche) {
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
