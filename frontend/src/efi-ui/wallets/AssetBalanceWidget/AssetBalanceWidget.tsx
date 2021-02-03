import React, { FC } from "react";

import { Classes, Colors, Icon } from "@blueprintjs/core";
import classNames from "classnames";
import { t } from "ttag";

import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { ERC20 } from "elf-contracts/types/ERC20";
import { useTokenBalanceOf } from "efi-ui/token/hooks/useTokenBalanceOf";
import { useTokenDecimals } from "efi-ui/token/hooks/useTokenDecimals";
import { formatCurrency } from "efi/base/formatCurrency/formatCurrency";
import { useTokenSymbol } from "efi-ui/token/hooks/useTokenSymbol";
import { getQueryCombinedLoadingState } from "efi-ui/query/getQueryCombinedLoadingState";
import { IconNames } from "@blueprintjs/icons";
import tw from "efi-tailwindcss-classnames";

interface AssetBalanceWidgetProps {
  account: string | null | undefined;
  tokenContract: ERC20;
}

export const AssetBalanceWidget: FC<AssetBalanceWidgetProps> = ({
  account,
  tokenContract,
}) => {
  const [tokenBalance, tokenBalanceQueries] = useTokenBalanceOf(
    tokenContract,
    account
  );
  const [tokenDecimals, tokenDecimalsQueries] = useTokenDecimals(tokenContract);
  const [tokenSymbol, tokenSymbolQueries] = useTokenSymbol(tokenContract);

  const formattedTokenBalance = formatCurrency(tokenBalance, tokenDecimals);

  const isLoading = getQueryCombinedLoadingState([
    ...tokenBalanceQueries,
    ...tokenDecimalsQueries,
    ...tokenSymbolQueries,
  ]);

  const text = isLoading
    ? t`loading`
    : t`${formattedTokenBalance} ${tokenSymbol}`;

  return (
    <LabeledText
      large
      text={text}
      textClassName={classNames({ [Classes.SKELETON]: isLoading })}
      label={t`in this wallet`}
      icon={
        <Icon
          icon={IconNames.BANK_ACCOUNT}
          className={tw("pr-4")}
          iconSize={48}
          color={Colors.GRAY1}
        />
      }
    />
  );
};
