import { Provider } from "@ethersproject/providers";
import { ConvergentCurvePool } from "elf-contracts/types/ConvergentCurvePool";
import { Tranche } from "elf-contracts/types/Tranche";
import { Signer } from "ethers";
import { isAddress } from "ethers/lib/utils";

import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { usePoolTokens } from "efi-ui/pools/usePoolTokens/usePoolTokens";
import { useTrancheContracts } from "efi-ui/tranche/useTrancheContracts";
import { PoolContract } from "efi/pools/PoolContract";
import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";
import { InterestToken__factory } from "elf-contracts/types/factories/InterestToken__factory";
import { useSmartContractFromFactory } from "efi-ui/contracts/useSmartContractFromFactory/useSmartContractFromFactory";
import { Tranche__factory } from "elf-contracts/types/factories/Tranche__factory";
import { useInterestTokens } from "efi-ui/interestToken/useInterestTokens/useInterestTokens";

export function useTrancheForPool(
  pool: PoolContract | undefined,
  signerOrProvider?: Signer | Provider
): Tranche | undefined {
  // if the pool is a ConvergentCurvePool, then we can just look up the tranche address directly.
  // the 'bond' is the prinicpal token address, which is the same adddress as the tranche.
  const tranches = useTrancheContracts(signerOrProvider ?? jsonRpcProvider);
  const {
    data: trancheAddressFromPrincipalTokenAddress,
  } = useSmartContractReadCall(pool as ConvergentCurvePool, "bond");

  // if the pool is a WeightedPool then we'll, find an interest token associated with it. then we
  // just have to look up the tranche address
  const { data: tokenInfo } = usePoolTokens(pool);
  const [tokens] = tokenInfo || [];
  const interestTokenAddresses = useInterestTokens(tranches).map(
    (c) => c.address
  );
  const interestTokenAddress = interestTokenAddresses.find((address) =>
    tokens?.includes(address)
  );
  const interestTokenContract = useSmartContractFromFactory(
    interestTokenAddress,
    InterestToken__factory.connect
  );
  const {
    data: trancheAddressFromInterestTokenAddress,
  } = useSmartContractReadCall(interestTokenContract, "tranche");

  const trancheContract = useSmartContractFromFactory(
    trancheAddressFromInterestTokenAddress,
    Tranche__factory.connect
  );

  // return result from ConvergentCurvePool if we find it
  if (
    trancheAddressFromPrincipalTokenAddress &&
    isAddress(trancheAddressFromPrincipalTokenAddress)
  ) {
    const tranche = tranches.find(
      (tranche) => tranche.address === trancheAddressFromPrincipalTokenAddress
    );

    return tranche;
  }

  // return result from WeightedPool if we find it
  if (
    trancheAddressFromInterestTokenAddress &&
    isAddress(trancheAddressFromInterestTokenAddress)
  ) {
    return trancheContract;
  }
}
