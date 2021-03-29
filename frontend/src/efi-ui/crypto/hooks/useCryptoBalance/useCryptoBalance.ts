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
import { assertNever } from "efi/base/assertNever";

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

  if (!asset) {
    return 0;
  }

  const ethBalanceNumber = +formatEth(ethBalance);
  const tokenBalanceNumber = +formatCurrency(tokenBalance, tokenDecimals);

  const assetType = asset?.type;
  switch (assetType) {
    case CryptoAssetType.ERC20:
    case CryptoAssetType.ERC20PERMIT:
      return tokenBalanceNumber;
    case CryptoAssetType.ETHEREUM:
      return ethBalanceNumber;
    default:
      assertNever(assetType);
      return 0;
  }
}
