import { GetStaticPropsContext } from "next";

import { PrincipalTokenInfo } from "tokenlists/types";

import { getOpenPrincipalTokensWithSameBaseAsset } from "efi/tranche/tranches";
import { getPoolInfoForPrincipalToken } from "efi/pools/ccpool";
import { getTokenInfo } from "efi/tokenlists";
import { getAllPrincipalTokenAddresses } from "efi/tranche/tranches";

export async function getStaticProps({ params }: GetStaticPropsContext) {
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
      principalTokenAddress: params?.principalTokenAddress,
    },
  };
}

export { BuyFixedRatesView as default } from "efi-ui/fixedrates/BuyFixedRatesView/BuyFixedRatesView";

export async function getStaticPaths() {
  const addresses = getAllPrincipalTokenAddresses();
  const paths = addresses.map((principalTokenAddress) => ({
    params: { principalTokenAddress },
  }));
  return {
    paths,
    fallback: false,
  };
}
