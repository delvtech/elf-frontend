import React, { FC } from "react";

import { AnchorButton, Button, Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Tooltip2 } from "@blueprintjs/popover2";
import classNames from "classnames";
import { jt, t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";

import styles from "efi-ui/base/table.module.css";
import { Tranche } from "elf-contracts/types";
import { useTokenBalance } from "efi-ui/token/hooks/useTokenBalance";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { convertEpochSecondsToDate } from "efi/base/convertEpochSecondsToDate";
import { formatAbbreviatedDate } from "efi/base/dates";
import { getTimeLeft } from "efi/base/time";

interface FYTTableRowProps {
  account: string | null | undefined;
  tranche: Tranche;
}

export const FYTTableRow: FC<FYTTableRowProps> = ({ account, tranche }) => {
  const { isDarkMode } = useDarkMode();
  const { data: trancheSymbol } = useSmartContractReadCall(tranche, "symbol");
  const { data: unlockTimestamp } = useSmartContractReadCall(
    tranche,
    "unlockTimestamp"
  );
  const { data: trancheName } = useSmartContractReadCall(tranche, "name");
  const trancheBalance = useTokenBalance(tranche, account);
  const maturationDate = convertEpochSecondsToDate(unlockTimestamp);

  let timeLeft: string | undefined;
  if (maturationDate) {
    const [days, hours, minutes] = getTimeLeft(
      maturationDate.getTime() - Date.now()
    );
    timeLeft = t`${days} days, ${hours}, hours, ${minutes} minutes`;
  }

  const tableRowClassName = isDarkMode ? styles.tableRowDark : styles.tableRow;

  const tableRowLink = (
    <a
      key="table-row-link"
      href="https://etherscan.io/token/0xe1237aa7f535b0cc33fd973d66cbf830354d16c7"
    >
      {t`yEth Vault`}{" "}
      <sup>
        <Icon icon={IconNames.SHARE} iconSize={8} />
      </sup>
    </a>
  );

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
        <LabeledText text={t`98.01893 ETH`} label={t`98,105.23 USD`} />
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
