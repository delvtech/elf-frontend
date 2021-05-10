import { ReactElement, ReactNode } from "react";

import { AnchorButton, Button, Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Tooltip2 } from "@blueprintjs/popover2";
import { Web3Provider } from "@ethersproject/providers";
import classNames from "classnames";
import { InterestToken } from "elf-contracts/types/InterestToken";
import { formatUnits } from "ethers/lib/utils";
import { jt, t } from "ttag";

import { getCoinGeckoId } from "efi-coingecko";
import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import styles from "efi-ui/base/table.module.css";
import { useCoinGeckoPrice } from "efi-ui/coingecko/useCoinGeckoPrice";
import { ERC20Shim } from "efi-ui/contracts/ERC20Shim";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { useOnSwapGivenIn } from "efi-ui/pools/useOnSwapGivenIn/useOnSwapGivenIn";
import { usePoolForToken } from "efi-ui/pools/usePoolForToken/usePoolForToken";
import { usePoolPairedToken } from "efi-ui/pools/usePoolPairedToken/usePoolPairedToken";
import { useCurrencyPref } from "efi-ui/prefs/useCurrency/useCurencyPref";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { useTokenBalance } from "efi-ui/token/hooks/useTokenBalance";
import { useTrancheForInterestToken } from "efi-ui/tranche/useTrancheForInterestToken";
import { useUnderlyingVaultForTranche } from "efi-ui/tranche/useUnderlyingVaultForTranche";
import { convertEpochSecondsToDate } from "efi/base/convertEpochSecondsToDate";
import { formatAbbreviatedDate } from "efi/base/dates";
import { getTimeLeft } from "efi/base/time";
import { formatMoney } from "efi/money/formatMoney";

interface InterestTokenTableRowProps {
  library: Web3Provider | undefined;
  account: string | null | undefined;
  interestToken: InterestToken;
}

export function InterestTokenTableRow({
  library,
  account,
  interestToken,
}: InterestTokenTableRowProps): ReactElement {
  const { isDarkMode } = useDarkMode();
  const { currency } = useCurrencyPref();

  const { data: interestTokenSymbol } = useSmartContractReadCall(
    interestToken,
    "symbol"
  );
  const { data: interestTokenBalanceOf } = useSmartContractReadCall(
    interestToken,
    "balanceOf",
    {
      enabled: !!account,
      callArgs: [account as string],
    }
  );
  const interestTokenBalance = useTokenBalance(
    interestToken as unknown as ERC20Shim,
    account
  );

  // The tranche contains the unlockTimestamp
  const tranche = useTrancheForInterestToken(interestToken);
  const { data: unlockTimestamp } = useSmartContractReadCall(
    tranche,
    "unlockTimestamp"
  );
  const vaultContract = useUnderlyingVaultForTranche(tranche);
  const { data: vaultName } = useSmartContractReadCall(vaultContract, "name");

  const pool = usePoolForToken(interestToken as unknown as ERC20Shim);

  const baseAsset = usePoolPairedToken(
    pool,
    interestToken as unknown as ERC20Shim
  );
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
  const { data: exitValue } = useOnSwapGivenIn(
    pool,
    interestToken as unknown as ERC20Shim,
    interestTokenBalanceOf
  );

  const tableRowClassName = isDarkMode ? styles.tableRowDark : styles.tableRow;

  const currentExitValue = +formatUnits(exitValue || 0, baseAssetDecimals);
  const currentExitValueFiat = formatMoney(
    baseAssetFiatPrice?.multiply(currentExitValue)
  );
  const maturationDate = convertEpochSecondsToDate(unlockTimestamp);
  const timeLeft = getTimeLeft(maturationDate);
  const tableRowLink = getTableRowLink(vaultContract?.address, vaultName);

  return (
    <div
      className={classNames(
        tableRowClassName,
        tw("grid", "grid-cols-8", "w-full", "gap-2", "p-4")
      )}
    >
      {/* Asset */}
      <div>
        <LabeledText
          text={interestTokenSymbol}
          label={jt`via ${tableRowLink}`}
        />
      </div>
      {/* Quantity */}
      <div>
        <LabeledText text={interestTokenBalance.toFixed(6)} label="" />
      </div>

      {/* Current exit value */}
      <div>
        <LabeledText
          text={t`${currentExitValue.toFixed(6)} ${baseAssetSymbol}`}
          label={t`${currency.symbol}${currentExitValueFiat}`}
        />
      </div>

      {/* Current acc. value */}
      <div>
        <LabeledText text={t`1.013 ETH`} label={t`1,105.23 USD`} />
      </div>

      {/* Yield rate Interest Token */}
      <div>
        <LabeledText
          text={t`0.32% daily`}
          label={t`4.21% monthly`}
          subLabel={t`12.21% yearly`}
        />
      </div>

      {/* Yield rate Underlying */}
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
        <Button outlined>{t`Go to market`}</Button>
      </div>
    </div>
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
