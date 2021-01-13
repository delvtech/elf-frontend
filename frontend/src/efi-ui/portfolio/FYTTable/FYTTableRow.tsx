import { AnchorButton, Button, Tooltip } from "@blueprintjs/core";
import React, { FC } from "react";
import { t } from "ttag";
import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { LabeledProgressBar } from "../../base/LabeledProgressBar/LabeledProgressBar";

import styles from "./FYTTableRow.module.css";
interface FYTTableRowProps {}
export const FYTTableRow: FC<FYTTableRowProps> = () => {
  return (
    <tr className={styles.tableRow}>
      {/* Asset */}
      <td>
        <LabeledText text="fyETH" label={t`Fixed Yield Ether`} />
      </td>

      {/* Quantity */}
      <td>
        <div className={tw("flex", "h-full", "w-full")}>{t`100 fyETH`}</div>
      </td>

      {/* Current value */}
      <td>
        <LabeledText text={t`98.01893 ETH`} label={t`98,105.23 USD`} />
      </td>

      {/* Yield rate*/}
      <td>
        <LabeledText
          text={t`0.32% daily`}
          label={t`4.21% monthly`}
          subLabel={t`12.21% yearly`}
        />
      </td>

      {/* Maturation date */}
      <td>
        <LabeledProgressBar
          label={t` January 15, 2021`}
          progressValue={0.75}
          helperText={t`3 days, 6 hours, 32 minutes left`}
        />
      </td>

      {/* Quick Actions */}
      <td>
        <div
          className={tw(
            "flex",
            "h-full",
            "w-full",
            "items-center",
            "space-x-2"
          )}
        >
          <Tooltip
            inheritDarkTheme={false}
            content={t`This asset can be claimed after it has reached maturity.`}
          >
            <AnchorButton
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
          </Tooltip>
          <Button outlined>{t`Sell`}</Button>
          <Button outlined>{t`Stake`}</Button>
        </div>
      </td>
    </tr>
  );
};
