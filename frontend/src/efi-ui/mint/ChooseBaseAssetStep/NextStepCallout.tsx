import { Callout, H4, Intent } from "@blueprintjs/core";
import React, { FC } from "react";
import { t } from "ttag";
import tw from "efi-tailwindcss-classnames";

export const NextStepCallout: FC<{}> = () => {
  return (
    <Callout icon={null} intent={Intent.PRIMARY}>
      <div className={tw("p-6")}>
        <H4>{t`What's next?`}</H4>
        <span>{t`In the next step you'll be shown different tranches, which represent the period of time that your assets will remain locked into the yield position. This will mint the correct number of FYTs and YCs which you can then trade freely while they mature.`}</span>
      </div>
    </Callout>
  );
};
