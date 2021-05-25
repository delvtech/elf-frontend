import { TokenInfo } from "@uniswap/token-lists";
import { getSmartContractFromRegistryStatic } from "efi/contracts/SmartContractsRegistry";
import { PoolInfo } from "efi/pools/PoolInfo";
import { getTokenInfo } from "efi/tokenlists";
import { ERC20 } from "elf-contracts/types/ERC20";
import { ERC20__factory } from "elf-contracts/types/factories/ERC20__factory";
import { PrincipalPoolTokenInfo, YieldPoolTokenInfo } from "tokenlists/types";

interface PoolTokens {
  baseAssetInfo: TokenInfo;
  termAssetInfo: TokenInfo;
  baseAssetContract: ERC20;
  termAssetContract: ERC20;
  baseAssetIndex: number;
  termAssetIndex: number;
  sortedAddresses: [string, string];
}

export function getPoolTokens(poolInfo: PoolInfo): PoolTokens {
  const baseAssetAddress = poolInfo?.extensions.underlying;
  const termAssetAddress =
    (poolInfo as PrincipalPoolTokenInfo)?.extensions?.bond ??
    (poolInfo as YieldPoolTokenInfo)?.extensions?.interestToken;
  const baseAssetInfo = getTokenInfo(baseAssetAddress);
  const termAssetInfo = getTokenInfo(termAssetAddress);
  const baseAssetContract = getSmartContractFromRegistryStatic(
    baseAssetAddress,
    ERC20__factory
  );
  const termAssetContract = getSmartContractFromRegistryStatic(
    termAssetAddress,
    ERC20__factory
  );

  const sortedAddresses = [baseAssetAddress, termAssetAddress].sort() as [
    string,
    string
  ];

  const baseAssetIndex = sortedAddresses.findIndex(
    (address) => address === baseAssetAddress
  );
  const termAssetIndex = sortedAddresses.findIndex(
    (address) => address === termAssetAddress
  );

  return {
    baseAssetInfo,
    baseAssetContract,
    baseAssetIndex,
    termAssetInfo,
    termAssetContract,
    termAssetIndex,
    sortedAddresses,
  };
}
