import { formatCurrency } from "efi/base/formatCurrency/formatCurrency";
import { Web3Provider } from "@ethersproject/providers";
import { formatEth } from "efi/coins/ether/formatEth";
import {
  CryptoAsset,
  CryptoAssetType,
  findTokenContract,
} from "efi/crypto/CryptoAsset";
import { useEthBalance } from "efi-ui/wallets/hooks/useEthBalance/useEthBalance";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";

export function useCryptoBalance(
  library: Web3Provider | undefined,
  account: string | null | undefined,
  asset: CryptoAsset | undefined
): number {
  const { data: ethBalance } = useEthBalance(library, account);

  const tokenContract = asset ? findTokenContract(asset) : undefined;
  const { data: tokenBalance } = useSmartContractReadCall(
    tokenContract,
    "balanceOf",
    {
      callArgs: [account as string], // safe to cast because `enabled` is set
      enabled: !!account,
    }
  );
  const { data: tokenDecimals } = useSmartContractReadCall(
    tokenContract,
    "decimals"
  );

  let balance: number = +formatEth(ethBalance);
  if (asset?.type === CryptoAssetType.ERC20) {
    balance = +formatCurrency(tokenBalance, tokenDecimals);
  }

  return balance;
}
