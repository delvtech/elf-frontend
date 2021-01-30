import React, { FC } from "react";

import { Classes, Colors, Icon } from "@blueprintjs/core";
import classNames from "classnames";
import { t } from "ttag";

import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { useEthPrice } from "efi-ui/ethereum/hooks/useEthPrice";
import { useCurrencyPref } from "efi-ui/prefs/useCurrency/useCurencyPref";
import { IconNames } from "@blueprintjs/icons";
import { Currencies } from "ts-money";

interface EthereumPriceWidgetProps {}

export const EthereumPriceWidget: FC<EthereumPriceWidgetProps> = () => {
  const { currency } = useCurrencyPref();
  const { isLoading, data: ethPrice } = useEthPrice(currency.code);

  const icon =
    currency.code === Currencies.USD.code ? IconNames.DOLLAR : IconNames.EURO;
  const text = isLoading ? t`loading` : t`${ethPrice} ${currency.code}`;

  return (
    <LabeledText
      large
      text={text}
      textClassName={classNames({ [Classes.SKELETON]: isLoading })}
      label={t`ETH price`}
      icon={<Icon icon={icon} iconSize={48} color={Colors.GRAY1} />}
    />
  );
};
