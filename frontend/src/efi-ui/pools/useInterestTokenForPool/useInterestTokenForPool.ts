import { Provider } from "@ethersproject/providers";
import { InterestToken__factory } from "elf-contracts/types/factories/InterestToken__factory";
import { InterestToken } from "elf-contracts/types/InterestToken";
import { WeightedPool } from "elf-contracts/types/WeightedPool";
import { Signer } from "ethers";

import { usePoolTokens } from "efi-ui/pools/usePoolTokens/usePoolTokens";
import { jsonRpcProvider } from "efi/providers/providers";
import { useTrancheInterestTokenMulti } from "efi-ui/tranche/useTrancheInterestTokenMulti";
import { TrancheContracts } from "efi/tranche/tranches";

export function useInterestTokenForPool(
  pool: WeightedPool | undefined,
  signerOrProvider?: Signer | Provider
): InterestToken | undefined {
  const poolTokensResult = usePoolTokens(pool);
  const poolTokens = poolTokensResult.data?.[0]?.filter(Boolean) || [];
  const interestTokenAddressResults = useTrancheInterestTokenMulti(
    TrancheContracts
  );
  const interestTokenAddresses = interestTokenAddressResults
    .map((result) => {
      const { data: address } = result;
      return address;
    })
    .filter(Boolean) as string[];

  const tokenAddress = interestTokenAddresses.find((address) =>
    poolTokens?.includes(address)
  );

  if (!tokenAddress) {
    return undefined;
  }

  const interestToken = InterestToken__factory.connect(
    tokenAddress,
    signerOrProvider ?? jsonRpcProvider
  );

  return interestToken;
}
