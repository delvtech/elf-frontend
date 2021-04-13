import { Provider } from "@ethersproject/providers";
import { Signer } from "ethers";
import zip from "lodash.zip";

import { getQueriesData } from "efi-ui/base/queryResults";
import { CryptoAssetWithIcon } from "efi-ui/crypto/CryptoAssetWithIcon";
import { useCryptoAssetForTokenMulti } from "efi-ui/crypto/hooks/useCryptoAssetForTokenMulti";
import { usePoolTokensMulti } from "efi-ui/pools/usePoolTokens/usePoolTokensMulti";
import { KNOWN_BASE_ASSETS } from "efi/contracts/contractsJson";
import { PoolContract } from "efi/pools/PoolContract";

export function useBaseAssetForPools(
  pools: (PoolContract | undefined)[],
  signerOrProvider?: Signer | Provider
): (CryptoAssetWithIcon | undefined)[] {
  const poolTokensResults = usePoolTokensMulti(pools);
  const tokenAddresses = getQueriesData(poolTokensResults).map(
    (result) => result?.[0] || []
  );

  const baseAssetAddresses = zip(pools, tokenAddresses).map(([, addresses]) => {
    const baseAssetAddress = addresses?.find((address) =>
      KNOWN_BASE_ASSETS.includes(address)
    );

    return baseAssetAddress;
  });

  const baseAssets = useCryptoAssetForTokenMulti(baseAssetAddresses);

  return baseAssets;
}
