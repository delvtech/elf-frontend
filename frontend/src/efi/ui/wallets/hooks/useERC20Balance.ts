import { useQuery } from "react-query";

import { Contract } from "ethers";

import {
  ERC20Abi,
  ERC20ContractAddressesByName,
  SupportedERC20StakingAssets,
} from "efi/crypto/erc20";
import { fetchERC20Balance } from "efi/crypto/fetchERC20Balance";

export function useERC20Balance(
  name: SupportedERC20StakingAssets,
  account: string | null | undefined
) {
  const address = ERC20ContractAddressesByName[name];
  const contract = new Contract(address, ERC20Abi);
  const balanceKey = makeERC20BalanceOfQueryKey(name, account);

  const erc20Balance = useQuery(balanceKey, async () => {
    if (account) {
      return fetchERC20Balance(contract, account);
    }
  });

  return erc20Balance;
}

export function makeERC20BalanceOfQueryKey(
  name: string,
  account: string | null | undefined
): string[] {
  const accountString = account ?? "0x0";
  return ["contract", "erc20", name, "balanceOf", accountString];
}
