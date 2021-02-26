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

interface YCTableRowProps {}

export const YCTableRow: FC<YCTableRowProps> = () => {
  const { isDarkMode } = useDarkMode();

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
        tw("grid", "grid-cols-8", "w-full", "gap-2", "p-4")
      )}
    >
      {/* Asset */}
      <div>
        <LabeledText
          text={t`Yield Coupon Ether`}
          label={jt`via ${tableRowLink}`}
        />
      </div>
      {/* Quantity */}
      <div>
        <LabeledText text={t`100 ycETH`} label="" />
      </div>

      {/* Current exit value */}
      <div>
        <LabeledText text={t`8.01893 ETH`} label={t`8,105.23 USD`} />
      </div>

      {/* Current acc. value */}
      <div>
        <LabeledText text={t`1.013 ETH`} label={t`1,105.23 USD`} />
      </div>

      {/* Yield rate YC */}
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
          text={t` January 15, 2021`}
          label={t`3 days, 6 hours left `}
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
