import { Button } from "@blueprintjs/core";
import React, { FC } from "react";
import { t } from "ttag";
import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { LabeledProgressBar } from "../../base/LabeledProgressBar/LabeledProgressBar";

interface FYTTableRowProps {}
export const FYTTableRow: FC<FYTTableRowProps> = () => {
  return (
    <tr>
      <td>{t`January 15, 2021`}</td>
      <td>
        <LabeledText bold text="fyETH" label={t`Fixed Yield Ether`} />
      </td>

      <td>{t`100 fyETH`}</td>

      <td>
        <LabeledText text={t`98.01893 ETH`} label={t`98,105.23 USD`} />
      </td>

      <td>{"January 1, 2021"}</td>

      <td>
        <LabeledProgressBar
          progressValue={0.75}
          label={t`3 days, 6 hours, 32 minutes left`}
        />
      </td>

      <td>
        <div className={tw("flex", "space-x-2")}>
          <Button outlined disabled>
            {t`Claim`}
          </Button>
          <Button outlined>{t`Stake`}</Button>
          <Button outlined>{t`Boost`}</Button>
          <Button outlined>{t`Liquidate`}</Button>
        </div>
      </td>
    </tr>
  );
};
