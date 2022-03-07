import { ReactElement } from "react";

import tw from "efi-tailwindcss-classnames";
import { useIsTailwindLargeScreen } from "ui/base/mediaBreakpoints";
import { FixedRateCard } from "ui/fixedrates/FixedRateCard/FixedRateCard";
import { FixedRateCardListHeader } from "./FixedRateCardListHeader";
import { PrincipalTokenInfo } from "@elementfi/tokenlist";
import { FEATURE_TOGGLE_ZAP_PURCHASE } from "ui/toggles/toggles";
import { useLocalStorage } from "react-use";
import { FixedRateCardWithZap } from "../FixedRateCard/FixedRateCardWithZap";
import {
  FeatureFlag,
  useFeatureFlag,
} from "ui/base/hooks/useFeatureFlag/useFeatureFlag";

interface FixedRateCardListProps {
  principalTokens: PrincipalTokenInfo[];
}

export function FixedRateCardList(props: FixedRateCardListProps): ReactElement {
  const { principalTokens } = props;
  const isLargeScreen = useIsTailwindLargeScreen();

  const featureFlagZapPurchase = useFeatureFlag(FeatureFlag.ZAP_PURCHASE);

  return (
    <div className={tw("flex", "flex-col", "space-y-4", "items-center")}>
      {/* TODO:
          Understand better what's going on here and if there is a better way
          to handle it. */}
      {process.browser && ( // required for blueprint to render correctly
        <>
          <FixedRateCardListHeader hide={!isLargeScreen} />

          {principalTokens.map((principalToken) => {
            return featureFlagZapPurchase ? (
              <FixedRateCardWithZap
                key={principalToken.address}
                principalToken={principalToken}
              />
            ) : (
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
