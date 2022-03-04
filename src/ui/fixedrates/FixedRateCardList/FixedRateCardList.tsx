import { ReactElement } from "react";

import tw from "efi-tailwindcss-classnames";
import { useIsTailwindLargeScreen } from "ui/base/mediaBreakpoints";
import { FixedRateCard } from "ui/fixedrates/FixedRateCard/FixedRateCard";
import { FixedRateCardListHeader } from "./FixedRateCardListHeader";
import { PrincipalTokenInfo } from "@elementfi/tokenlist";

interface FixedRateCardListProps {
  principalTokens: PrincipalTokenInfo[];
}

export function FixedRateCardList(props: FixedRateCardListProps): ReactElement {
  const { principalTokens } = props;
  const isLargeScreen = useIsTailwindLargeScreen();
  return (
    <div className={tw("flex", "flex-col", "space-y-4", "items-center")}>
      {/* TODO:
          Understand better what's going on here and if there is a better way
          to handle it. */}
      {process.browser && ( // required for blueprint to render correctly
        <>
          <FixedRateCardListHeader hide={!isLargeScreen} />

          {principalTokens.map((principalToken) => {
            return (
              <FixedRateCard
                key={principalToken.address}
                principalToken={principalToken}
              />
            );
          })}
        </>
      )}
    </div>
  );
}
