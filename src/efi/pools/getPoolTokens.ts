import { TokenInfo } from "@uniswap/token-lists";
import { ERC20 } from "elf-contracts-typechain/dist/types/ERC20";
import { ERC20__factory } from "elf-contracts-typechain/dist/types/factories/ERC20__factory";
import { PrincipalPoolTokenInfo, YieldPoolTokenInfo } from "tokenlists/types";

import { getSmartContractFromRegistry } from "efi/contracts/SmartContractsRegistry";
import { PoolInfo } from "efi/pools/PoolInfo";
import { getTokenInfo } from "efi/tokenlists/tokenlists";
import { underlyingContractsByAddress } from "efi/underlying/underlying";
import { sortAddresses } from "efi/base/sortAddresses/sortAddresses";

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
  const baseAssetContract = underlyingContractsByAddress[
    baseAssetAddress
  ] as ERC20;
  const termAssetContract = getSmartContractFromRegistry(
    termAssetAddress,
    ERC20__factory.connect
  ) as ERC20;

  const sortedAddresses = sortAddresses([
    baseAssetAddress,
    termAssetAddress,
  ]) as [string, string];

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
