import React, { FC } from "react";

import { Classes, Colors, Icon } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import classNames from "classnames";
import { t } from "ttag";

import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { useEthBalance } from "efi-ui/coins/ether/hooks/useEthBalance/useEthBalance";
import { IconNames } from "@blueprintjs/icons";
import { formatEth } from "efi/coins/ether/formatEth";

interface EthereumBalanceWidgetProps {
  library: Web3Provider | undefined;
  account: string | null | undefined;
}

export const EthereumBalanceWidget: FC<EthereumBalanceWidgetProps> = ({
  library,
  account,
}) => {
  const { data: ethBalance, isLoading } = useEthBalance(library, account);
  const formattedEthBalance = formatEth(ethBalance);

  const text = isLoading ? t`loading` : t`${formattedEthBalance} ETH`;

  return (
    <LabeledText
      large
      text={text}
      textClassName={classNames({ [Classes.SKELETON]: isLoading })}
      label={t`in this wallet`}
      icon={
        <Icon
          icon={IconNames.BANK_ACCOUNT}
          iconSize={48}
          color={Colors.GRAY1}
        />
      }
    />
  );
};
