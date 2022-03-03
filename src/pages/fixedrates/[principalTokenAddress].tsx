import {
  GetStaticPropsContext,
  GetStaticPropsResult,
  GetStaticPathsResult,
} from "next";

import { getOpenPrincipalTokensWithSameBaseAsset } from "efi/tranche/tranches";
import { getPoolInfoForPrincipalToken } from "efi/pools/ccpool";
import { getTokenInfo } from "tokenlists/tokenlists";
import { getAllPrincipalTokenAddresses } from "efi/tranche/tranches";

import {
  BuyFixedRatesView,
  BuyFixedRatesViewProps,
} from "efi-ui/fixedrates/BuyFixedRatesView/BuyFixedRatesView";
import { PrincipalTokenInfo } from "@elementfi/tokenlist";

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

export default BuyFixedRatesView;

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
