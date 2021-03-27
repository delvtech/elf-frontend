import { FC } from "react";

import { Link } from "@reach/router";
import { ConvergentCurvePool } from "elf-contracts/types/ConvergentCurvePool";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LabeledProgressBar } from "efi-ui/base/LabeledProgressBar/LabeledProgressBar";
import { getQueryData } from "efi-ui/base/queryResults";
import { ERC20Shim } from "efi-ui/contracts/ERC20Shim";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { usePoolPairedToken } from "efi-ui/pools/usePoolPairedToken/usePoolPairedToken";
import { useTrancheForPool } from "efi-ui/pools/useTrancheForPool/useTrancheForPool";
import { useTrancheCreatedAt } from "efi-ui/tranche/useTrancheCreatedAt";
import { convertEpochSecondsToDate } from "efi/base/convertEpochSecondsToDate";
import { getTimeLeft2 } from "efi/base/time";
import { PoolContract } from "efi/pools/PoolContract";
import ContractAddresses from "efi/contracts/contractsJson";
import { Vault__factory } from "elf-contracts/types/factories/Vault__factory";
import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";
import { useTokenPrice } from "efi-ui/token/hooks/useTokenPrice";
import { useTokenDecimals } from "efi-ui/token/hooks/useTokenDecimals";
import { useConvertToFiat } from "efi-ui/money/hooks/useConvertToFiat";
import { ERC20__factory } from "elf-contracts/types/factories/ERC20__factory";
import { Currencies } from "ts-money";

interface TranchePoolTableRowProps {
  pool: ConvergentCurvePool | undefined;
}

export const TranchePoolTableRow: FC<TranchePoolTableRowProps> = ({ pool }) => {
  const tranche = useTrancheForPool(pool);
  const liquidity = useTotalLiquidityForPool(pool);
  const trancheCreatedAtResult = useTrancheCreatedAt(tranche);
  const poolNameResult = useSmartContractReadCall(pool, "name");
  const baseAsset = usePoolPairedToken(pool, tranche as ERC20Shim);
  const unlockTimestampResult = useSmartContractReadCall(
    tranche,
    "unlockTimestamp",
    { enabled: !!tranche }
  );
  const maturityDate = convertEpochSecondsToDate(
    getQueryData(unlockTimestampResult)
  );

  const startDate = convertEpochSecondsToDate(
    getQueryData(trancheCreatedAtResult)
  );

  if (!pool || !baseAsset) {
    return null;
  }

  const timeLeft = getTimeLeft2(maturityDate);

  return (
    <tr>
      <td>{maturityDate?.toLocaleDateString()}</td>
      <td>
        <Link className={tw("flex", "space-x-2")} to={pool?.address || ""}>
          {getQueryData(poolNameResult)}
        </Link>
      </td>

      <td>${liquidity?.toDecimal()?.toLocaleString()}</td>
      <td>2.13%</td>

      <td>{startDate?.toLocaleDateString()}</td>

      <td>
        <LabeledProgressBar
          progressValue={0.5}
          label={t`running`}
          helperText={timeLeft}
        />
      </td>
    </tr>
  );
};

function useTotalLiquidityForPool(pool: PoolContract | undefined) {
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
