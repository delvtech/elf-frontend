import React, { FC } from "react";

import { t } from "ttag";

import { Classes, Colors, Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { useGasPrice } from "efi-ui/ethereum/hooks/useGasPrice";
import classNames from "classnames";
import tw from "efi-tailwindcss-classnames";

interface GasPriceWidgetProps {}

export const GasPriceWidget: FC<GasPriceWidgetProps> = () => {
  const { data: gasPrice, isLoading } = useGasPrice();

  const text = isLoading ? t`loading` : t`${gasPrice?.fast?.toFixed(0)} gwei`;

  return (
    <LabeledText
      large
      text={text}
      textClassName={classNames({ [Classes.SKELETON]: isLoading })}
      label={t`gas price`}
      icon={
        <Icon
          icon={IconNames.OIL_FIELD}
          iconSize={48}
          color={Colors.GRAY1}
          className={tw("pr-4")}
        />
      }
    />
  );
};
