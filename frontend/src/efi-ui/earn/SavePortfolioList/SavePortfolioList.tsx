import { ReactElement, useCallback, useState } from "react";

import { PrincipalTokenInfo } from "tokenlists/types";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { SavePortfolioCard } from "efi-ui/earn/SavePortfolioList/SavePortfolioCard";
import { Web3Provider } from "@ethersproject/providers";

interface SavePortfolioListProps {
  library: Web3Provider | undefined;
  account: string | null | undefined;
  principalTokens: PrincipalTokenInfo[];
}

export function SavePortfolioList(props: SavePortfolioListProps): ReactElement {
  const { library, principalTokens, account } = props;

  const [expandedCardIndex, setExpandedCardIndex] = useState(-1);
  const onExpandClose = useCallback(() => setExpandedCardIndex(-1), []);

  return (
    <div className={tw("flex", "flex-col", "space-y-4")}>
      <div className={tw("grid", "grid-cols-5", "gap-4")}>
        <span
          className={tw("col-span-2", "text-left", "pl-6")}
        >{t`Asset`}</span>
        <span>{t`Balance`}</span>
        <span>{t`Maturity`}</span>
        <span />
      </div>
      {principalTokens.map((principalToken, i) => {
        return (
          <SavePortfolioCard
            library={library}
            key={principalToken.address}
            account={account}
            isExpanded={expandedCardIndex === i}
            onExpandClose={onExpandClose}
            onExpandOpen={() => setExpandedCardIndex(i)}
            principalToken={principalToken}
          />
        );
      })}
    </div>
  );
}
