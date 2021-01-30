import { useTokenBalanceOf } from "efi-ui/token/hooks/useTokenBalanceOf";
import { useTokenDecimals } from "efi-ui/token/hooks/useTokenDecimals";
import { formatCurrency } from "efi/base/formatCurrency/formatCurrency";
import { Web3Provider } from "@ethersproject/providers";
import { formatEth } from "efi/coins/ether/formatEth";
import {
  CryptoAsset,
  CryptoAssetType,
  findTokenContract,
} from "efi/crypto/CryptoAsset";
import { useEthBalance } from "efi-ui/wallets/hooks/useEthBalance/useEthBalance";

export function useCryptoBalance(
  library: Web3Provider | undefined,
  account: string | null | undefined,
  asset: CryptoAsset
) {
  const { data: ethBalance } = useEthBalance(library, account);

  const tokenContract = findTokenContract(asset);
  const [tokenBalance] = useTokenBalanceOf(tokenContract, account);
  const [tokenDecimals] = useTokenDecimals(tokenContract);

  let balance: number = +formatEth(ethBalance);
  if (asset.type === CryptoAssetType.ERC20) {
    balance = +formatCurrency(tokenBalance, tokenDecimals);
  }

  return balance;
}
