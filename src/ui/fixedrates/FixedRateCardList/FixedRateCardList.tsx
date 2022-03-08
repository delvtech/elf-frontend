import { PrincipalTokenInfo } from "@elementfi/tokenlist";
import tw from "efi-tailwindcss-classnames";
import { FeatureFlag } from "elf/featureFlag/featureFlag";
import { useFeatureFlag } from "elf/featureFlag/useFeatureFlag";
import { ReactElement } from "react";
import { useIsTailwindLargeScreen } from "ui/base/mediaBreakpoints";
import { FixedRateCard } from "ui/fixedrates/FixedRateCard/FixedRateCard";
import { FixedRateCardWithZap } from "ui/fixedrates/FixedRateCard/FixedRateCardWithZap";
import { FixedRateCardListHeader } from "./FixedRateCardListHeader";

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
