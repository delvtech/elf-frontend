import {
  GetStaticPropsContext,
  GetStaticPropsResult,
  GetStaticPathsResult,
} from "next";

import { getOpenPrincipalTokensWithSameBaseAsset } from "elf/tranche/tranches";
import { getPoolInfoForPrincipalToken } from "elf/pools/ccpool";
import { getTokenInfo } from "tokenlists/tokenlists";
import { getAllPrincipalTokenAddresses } from "elf/tranche/tranches";

import {
  BuyFixedRatesView,
  BuyFixedRatesViewProps,
} from "ui/fixedrates/BuyFixedRatesView/BuyFixedRatesView";
import { PrincipalTokenInfo } from "@elementfi/tokenlist";
import { BuyFixedRatesViewWithZap } from "ui/fixedrates/BuyFixedRatesView/BuyFixedRatesViewWithZap";

export async function getStaticProps({
  params,
}: GetStaticPropsContext): Promise<
  GetStaticPropsResult<BuyFixedRatesViewProps>
> {
  // Used for the Term picker, since base assets can have multiple terms (ie:
  // principal tokens) running at the same time.
  const availablePrincipalTokens = getOpenPrincipalTokensWithSameBaseAsset(
    params?.principalTokenAddress as string
  );
  const principalTokenInfo = getTokenInfo<PrincipalTokenInfo>(
    params?.principalTokenAddress as string
  );
  const principalTokenPoolInfo = getPoolInfoForPrincipalToken(
    params?.principalTokenAddress as string
  );
  return {
    props: {
      availablePrincipalTokens,
      principalTokenInfo,
      principalTokenPoolInfo,
      principalTokenAddress: params?.principalTokenAddress as
        | string
        | undefined,
    },
  };
}

const USE_BUY_FIXED_RATES_VIEW_WITH_ZAPS = true;

const X = USE_BUY_FIXED_RATES_VIEW_WITH_ZAPS
  ? BuyFixedRatesViewWithZap
  : BuyFixedRatesView;

export default X;

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  const addresses = getAllPrincipalTokenAddresses();
  const paths = addresses.map((principalTokenAddress) => ({
    params: { principalTokenAddress },
  }));
  return {
    paths,
    fallback: false,
  };
}
