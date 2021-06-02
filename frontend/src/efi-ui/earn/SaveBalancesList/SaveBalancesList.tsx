import React, { ReactElement } from "react";

import { PrincipalTokenInfo } from "tokenlists/types";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { SaveBalanceCard } from "efi-ui/earn/SaveBalancesList/SaveBalanceCard";

interface SaveBalancesListProps {
  account: string | null | undefined;
  principalTokens: PrincipalTokenInfo[];
}

export function SaveBalancesList(props: SaveBalancesListProps): ReactElement {
  const { principalTokens, account } = props;
  return (
    <div className={tw("flex", "flex-col", "space-y-4")}>
      <div className={tw("grid", "grid-cols-6", "gap-4")}>
        <span
          className={tw("col-span-2", "text-left", "pl-6")}
        >{t`Asset`}</span>
        <span>{t`Balance`}</span>
        <span>{t`Maturity`}</span>
        <span
          className={tw("col-span-2", "text-left", "pl-6", "justify-end")}
        >{t`Actions`}</span>
      </div>
      {principalTokens.map((principalToken) => {
        return (
          <SaveBalanceCard
            key={principalToken.address}
            account={account}
            principalToken={principalToken}
          />
        );
      })}
    </div>
  );
}
