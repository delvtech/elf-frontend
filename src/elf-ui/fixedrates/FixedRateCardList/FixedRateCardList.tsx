import { ReactElement } from "react";

import { PrincipalTokenInfo } from "tokenlists/types";

import tw from "elf-tailwindcss-classnames";
import { useIsTailwindLargeScreen } from "elf-ui/base/mediaBreakpoints";
import { FixedRateCard } from "elf-ui/fixedrates/FixedRateCard/FixedRateCard";
import { FixedRateCardListHeader } from "./FixedRateCardListHeader";

interface FixedRateCardListProps {
  principalTokens: PrincipalTokenInfo[];
}

export function FixedRateCardList(props: FixedRateCardListProps): ReactElement {
  const { principalTokens } = props;
  const isLargeScreen = useIsTailwindLargeScreen();
  return (
    <div className={tw("flex", "flex-col", "space-y-4", "items-center")}>
      <FixedRateCardListHeader hide={!isLargeScreen} />

      {principalTokens.map((principalToken) => {
        return (
          <FixedRateCard
            key={principalToken.address}
            principalToken={principalToken}
          />
        );
      })}
    </div>
  );
}
