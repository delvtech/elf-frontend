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
import { useOnSwapGivenIn } from "efi-ui/pools/useOnSwapGivenIn/useOnSwapGivenIn";
import { formatUnits, parseUnits } from "@ethersproject/units";
import { BigNumber } from "ethers";

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

  const baseAssetIndex: number =
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
  const baseAssetFiatBalance = useConvertToFiat(
    baseAssetPrice,
    baseAssetBalance,
    baseAssetDecimals
  );

  const yieldAssetIndex = baseAssetIndex === 0 ? 1 : 0;
  const yieldAssetAddress = tokens?.[yieldAssetIndex];
  const yieldAssetBalance = balances?.[yieldAssetIndex];
  const yieldAssetContract = yieldAssetAddress
    ? ERC20__factory.connect(yieldAssetAddress, jsonRpcProvider)
    : undefined;
  const [yieldAssetDecimals] = useTokenDecimals(yieldAssetContract);

  /**************************
   * Laxy spot price technique until we get a better method.  Right now just calculates how much out
   * asset for '1' of the in asset.  A future optimisation might be to do '$1' worth of the in asset
   * to minimize slippage in the value.
   **************************/
  const amountIn = parseUnits("1", baseAssetDecimals);
  const { data: amountOut = BigNumber.from(1) } = useOnSwapGivenIn(
    pool,
    baseAssetContract,
    amountIn
  );
  const yieldAssetRatio =
    +formatUnits(amountIn, baseAssetDecimals) /
    +formatUnits(amountOut, yieldAssetDecimals);
  const yieldAssetPrice = Money.fromDecimal(
    +yieldAssetRatio * (baseAssetPrice?.toDecimal() || 1),
    Currencies.USD,
    Math.round
  );
  /***************************** */

  const yieldAssetFiatBalance =
    useConvertToFiat(yieldAssetPrice, yieldAssetBalance, yieldAssetDecimals) ||
    Money.fromInteger(0, Currencies.USD.code);

  const totalBalance = baseAssetFiatBalance?.add(yieldAssetFiatBalance);
  return totalBalance;
}
// TODO: formalize this
const baseAssetAddressWhitelist = [
  ContractAddresses.wethAddress,
  ContractAddresses.usdcAddress,
];
