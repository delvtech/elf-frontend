import { Provider } from "@ethersproject/providers";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { useTrancheContracts } from "efi-ui/tranche/useTrancheContracts";
import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";
import { ConvergentCurvePool } from "elf-contracts/types/ConvergentCurvePool";
import { Tranche } from "elf-contracts/types/Tranche";
import { Signer } from "ethers";

export function useTrancheForPool(
  pool: ConvergentCurvePool | undefined,
  signerOrProvider?: Signer | Provider
): Tranche | undefined {
  const tranches = useTrancheContracts(signerOrProvider ?? jsonRpcProvider);
  const result = useSmartContractReadCall(pool, "bond");
  const { data: trancheAddress } = result;

  const tranche = tranches.find(
    (tranche) => tranche.address === trancheAddress
  );

  return tranche;
}
