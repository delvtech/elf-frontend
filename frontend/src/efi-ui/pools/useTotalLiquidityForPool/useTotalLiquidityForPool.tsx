import { ERC20__factory } from "elf-contracts/types/factories/ERC20__factory";
import { Vault__factory } from "elf-contracts/types/factories/Vault__factory";
import { Currencies, Money } from "ts-money";

import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { useConvertToFiat } from "efi-ui/money/hooks/useConvertToFiat";
import { useTokenDecimals } from "efi-ui/token/hooks/useTokenDecimals";
import { useTokenPrice } from "efi-ui/token/hooks/useTokenPrice";
import ContractAddresses from "efi/contracts/contractsJson";
import { PoolContract } from "efi/pools/PoolContract";
import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";

export function useTotalLiquidityForPool(
  pool: PoolContract | undefined
): Money | undefined {
  const { balancerVaultAddress } = ContractAddresses;
  const vault = Vault__factory.connect(balancerVaultAddress, jsonRpcProvider);
  const { data: poolId } = useSmartContractReadCall(pool, "getPoolId");
  const { data: poolTokens } = useSmartContractReadCall(
    vault,
    "getPoolTokens",
    { callArgs: [poolId as string], enabled: !!poolId }
  );
  const [tokens, balances] = poolTokens ?? [undefined, undefined];

  const baseAssetIndex =
    tokens?.findIndex((address) =>
      baseAssetAddressWhitelist.includes(address)
    ) ?? 0;
  const baseAssetAddress = tokens?.[baseAssetIndex];
  const baseAssetBalance = balances?.[baseAssetIndex];

  const baseAssetContract = baseAssetAddress
    ? ERC20__factory.connect(baseAssetAddress, jsonRpcProvider)
    : undefined;
  const [baseAssetPrice] = useTokenPrice(baseAssetContract, Currencies.USD);
  const [baseAssetDecimals] = useTokenDecimals(baseAssetContract);

  // Base Asset Fiat Balance
  const fiatBalance = useConvertToFiat(
    baseAssetPrice,
    baseAssetBalance,
    baseAssetDecimals
  );

  return fiatBalance;
}
// TODO: formalize this
const baseAssetAddressWhitelist = [
  ContractAddresses.wethAddress,
  ContractAddresses.usdcAddress,
];
