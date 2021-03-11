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
import { Web3Provider } from "@ethersproject/providers";
import { navigate } from "@reach/router";
import classNames from "classnames";
import { YC } from "elf-contracts/types/YC";
import { formatUnits } from "ethers/lib/utils";
import { jt, t } from "ttag";

import { getCoinGeckoId } from "efi-coingecko";
import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { useCoinGeckoPrice } from "efi-ui/coingecko/useCoinGeckoPrice";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { CryptoIconSvg } from "efi-ui/crypto/CryptoIcon";
import { useOnSwapGivenIn } from "efi-ui/pools/useOnSwapGivenIn/useOnSwapGivenIn";
import { usePoolForToken } from "efi-ui/pools/usePoolForToken/usePoolForToken";
import { usePoolPairedToken } from "efi-ui/pools/usePoolPairedToken/usePoolPairedToken";
import { useCurrencyPref } from "efi-ui/prefs/useCurrency/useCurencyPref";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { useTokenBalance } from "efi-ui/token/hooks/useTokenBalance";
import { convertEpochSecondsToDate } from "efi/base/convertEpochSecondsToDate";
import { getTimeLeft2 } from "efi/base/time";
import { CryptoSymbol } from "efi/crypto/CryptoSymbol";
import { formatMoney } from "efi/money/formatMoney";

import { useTrancheForYieldCoupon } from "./useTrancheForYieldCoupon";
import { useUnderlyingVaultForTranche } from "./useUnderlyingVaultForTranche";

interface YCCardProps {
  library: Web3Provider | undefined;
  account: string | null | undefined;
  yieldCoupon: YC;
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

export const YCCard: FC<YCCardProps> = ({ library, account, yieldCoupon }) => {
  const { isDarkMode } = useDarkMode();
  const { currency } = useCurrencyPref();

  const { data: ycSymbol } = useSmartContractReadCall(yieldCoupon, "symbol");
  const { data: ycBalanceOf } = useSmartContractReadCall(
    yieldCoupon,
    "balanceOf",
    { enabled: !!account, callArgs: [account as string] }
  );
  const ycBalance = useTokenBalance(yieldCoupon, account);

  // The tranche contains the unlockTimestamp
  const tranche = useTrancheForYieldCoupon(yieldCoupon);
  const { data: unlockTimestamp } = useSmartContractReadCall(
    tranche,
    "unlockTimestamp"
  );
  const vaultContract = useUnderlyingVaultForTranche(tranche);
  const { data: vaultName } = useSmartContractReadCall(vaultContract, "name");

  const pool = usePoolForToken(yieldCoupon);

  const baseAsset = usePoolPairedToken(pool, yieldCoupon);
  const { data: baseAssetSymbol } = useSmartContractReadCall(
    baseAsset,
    "symbol"
  );
  const { data: baseAssetFiatPrice } = useCoinGeckoPrice(
    getCoinGeckoId(baseAssetSymbol),
    currency
  );
  const { data: baseAssetDecimals } = useSmartContractReadCall(
    baseAsset,
    "decimals"
  );
  const { data: exitValueBigNumber } = useOnSwapGivenIn(
    pool,
    yieldCoupon,
    ycBalanceOf
  );

  const iconKey = baseAssetSymbol?.toUpperCase() as CryptoSymbol;
  const BaseAssetIcon = iconKey ? CryptoIconSvg[iconKey] : () => null;

  const exitValue = +formatUnits(exitValueBigNumber || 0, baseAssetDecimals);
  const exitValueFiat = formatMoney(baseAssetFiatPrice?.multiply(exitValue));
  const maturationDate = convertEpochSecondsToDate(unlockTimestamp);
  const timeLeft = getTimeLeft2(maturationDate);
  const tableRowLink = getTableRowLink(vaultContract?.address, vaultName);

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
                href={`https://etherscan.io/address/${yieldCoupon.address}`}
                target="_blank"
                rel="noreferrer noopener"
              >
                {ycSymbol}
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
              <div>
                <Tag large minimal>{t`Variable rate`}</Tag>
              </div>
              <div className={tw("flex", "space-x-6", "justify-end")}>
                <LabeledText
                  bold
                  textClassName={tw("text-base")}
                  text={`${(5 / 365).toFixed(2)}%`}
                  label={t`ELV APY`}
                />
                <LabeledText
                  bold
                  textClassName={tw("text-base")}
                  text={`${(5).toFixed(2)}%`}
                  label={t`Position APY`}
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
              text={`${ycBalance.toFixed(6)} YC`}
              label={t`1 YC = yield on 1 ${baseAssetSymbol} at maturity`}
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
              label={`${currency.symbol}${exitValueFiat}`}
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
            {jt`Yield accrued on ${baseAssetSymbol} deposited in ${tableRowLink}`}
          </span>
        </div>
      </Card>
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
