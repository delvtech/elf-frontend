import { Classes } from "@blueprintjs/core";
import { PrincipalTokenInfo, TokenInfo } from "@elementfi/tokenlist";
import classNames from "classnames";
import tw from "efi-tailwindcss-classnames";
import { commify } from "ethers/lib/utils";
import { ReactElement } from "react";
import { getTokenInfo } from "tokenlists/tokenlists";
import { getMarketRateLabel } from "ui/tranche/getMarketRateLabel";
import { useFixedRatePrice } from "ui/fixedrates/useFixedRatePrice";
import { BuyFixedRatesKind } from "ui/fixedrates/buyFixedRateKind";
import { useMarketPrice } from "ui/ccpools/useMarketPrice";
import { principalTokenInfos } from "elf/tranche/tranches";

interface FixedRatePriceProps {
  kind: BuyFixedRatesKind;
  principalToken: PrincipalTokenInfo;
  inputToken: TokenInfo;
}

function FixedRatePriceForCurvePoolToken(props: FixedRatePriceProps) {
  const x = useFixedRatePrice(props.principalToken, props.inputToken);
  return (
    <FixedRatePriceForBaseToken
      {...{
        ...props,
        inputToken: getTokenInfo(props.principalToken.extensions.underlying),
      }}
    />
  );
}

function FixedRatePriceForBaseToken({
  principalToken,
  inputToken,
}: FixedRatePriceProps) {
  const principalPrice = useMarketPrice(principalToken);
  const roundedPrincipalPrice = commify((+principalPrice)?.toFixed(4));

  const baseAssetSymbol = getTokenInfo(
    principalToken.extensions.underlying
  ).symbol;

  // TODO Get market rate for all tokens
  const marketRateLabel = getMarketRateLabel(
    baseAssetSymbol,
    roundedPrincipalPrice,
    inputToken.symbol
  );

  if (!marketRateLabel) return null;

  return (
    <span
      className={classNames(Classes.TEXT_MUTED, tw("text-xs", "text-right"))}
    >
      {marketRateLabel}
    </span>
  );
}

export function FixedRatePrice(
  props: FixedRatePriceProps
): ReactElement | null {
  return props.kind === BuyFixedRatesKind.Swap ? (
    <FixedRatePriceForBaseToken {...props} />
  ) : (
    <FixedRatePriceForCurvePoolToken {...props} />
  );
}
