import { ReactElement } from "react";

import { Web3Provider } from "@ethersproject/providers";
import { AbstractConnector } from "@web3-react/abstract-connector";
import { BigNumber } from "ethers";
import { formatEther, formatUnits, parseUnits } from "ethers/lib/utils";
import zipObject from "lodash.zipobject";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { useNumericInput } from "efi-ui/base/hooks/useNumericInput/useNumericInput";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { UnstakeConvergentCurvePoolButton } from "efi-ui/pools/UnstakeButton/UnstakeConvergentCurvePoolButton";
import { UnstakeWeightedPoolButton } from "efi-ui/pools/UnstakeButton/UnstakeWeightedPoolButton";
import { UnstakeInput } from "efi-ui/pools/UnstakeInput/UnstakeInput";
import { usePoolTokens } from "efi-ui/pools/usePoolTokens/usePoolTokens";
import { useShareOfPool } from "efi-ui/pools/useShareOfPool";
import { useTokenBalanceOf } from "efi-ui/token/hooks/useTokenBalanceOf";
import { ElfIcon } from "efi-ui/token/TokenIcon";
import { formatPercent } from "efi/base/formatPercent";
import { getCryptoAssetForToken } from "efi/crypto/getCryptoAssetForToken";
import { getCryptoSymbol } from "efi/crypto/getCryptoSymbol";
import { getPoolTokens } from "efi/pools/getPoolTokens";
import {
  isConvergentCurvePool,
  isWeightedPool,
  PoolContract,
} from "efi/pools/PoolContract";
import { PoolInfo } from "efi/pools/PoolInfo";
import { BALANCER_POOL_LP_TOKEN_DECIMALS } from "efi-balancer/pools";

interface UnstakeCardProps {
  library: Web3Provider | undefined;
  connector: AbstractConnector | undefined;
  account: string | null | undefined;
  pool: PoolContract;
  poolInfo: PoolInfo;
}

const calloutClassName = tw(
  "flex",
  "flex-1",
  "p-8",
  "w-full",
  "items-center",
  "justify-between"
);

export function UnstakeCard({
  library,
  account,
  connector,
  pool,
  poolInfo,
}: UnstakeCardProps): ReactElement {
  // base asset
  const { baseAssetContract, baseAssetInfo, termAssetInfo } =
    getPoolTokens(poolInfo);
  const symbol = `ELF:${baseAssetInfo.symbol}-${termAssetInfo.symbol}`;
  const { decimals: baseAssetDecimals } = baseAssetInfo;
  const baseAssetCryptoAsset = getCryptoAssetForToken(baseAssetInfo.address);
  const baseAssetSymbol = getCryptoSymbol(baseAssetCryptoAsset);

  // pool shares
  const { data: lpBalanceOf } = useTokenBalanceOf(pool, account);
  const lpDisplayBalance = formatEther(lpBalanceOf ?? 0);
  const shareOfPool = useShareOfPool(pool, account);
  const shareOfPoolLabel = getShareOfPoolLabel(shareOfPool);

  // liquidity
  const { data: [addresses, poolBalances] = [] } = usePoolTokens(pool);

  const baseAssetLiquidity = calculatePoolShareLiquidity(
    shareOfPool,
    addresses,
    poolBalances,
    baseAssetContract?.address,
    baseAssetDecimals
  );

  const termAssetLiquidity = calculatePoolShareLiquidity(
    shareOfPool,
    addresses,
    poolBalances,
    termAssetInfo.address,
    termAssetInfo.decimals
  );

  const baseAssetLiquidityLabel = baseAssetLiquidity
    ? `${baseAssetLiquidity?.toFixed(4)}`
    : "0.0000";
  const termAssetLiquidityLabel = termAssetLiquidity
    ? `${termAssetLiquidity?.toFixed(4)}`
    : "0.0000";

  const { stringValue, setValue } = useNumericInput();

  const valueBN = parseUnits(
    stringValue || "0",
    BALANCER_POOL_LP_TOKEN_DECIMALS
  );

  const balanceIsZero = lpBalanceOf?.isZero() ?? true;
  const valueIsZero = valueBN.isZero();
  const valueLessThanBalance = lpBalanceOf ? valueBN.lte(lpBalanceOf) : false;

  const isValidValue = valueLessThanBalance;
  const disableUnstake = balanceIsZero || valueIsZero || !isValidValue;

  return (
    <div
      className={tw(
        "flex",
        "flex-col",
        "flex-1",
        "space-y-2",
        "py-4",
        "items-center"
      )}
    >
      <UnstakeInput
        label={t`Pool Tokens`}
        cryptoSymbol={symbol}
        cryptoDecimals={poolInfo.decimals}
        cryptoAssetIcon={ElfIcon}
        cryptoBalanceOf={lpBalanceOf}
        cryptoDisplayBalance={lpDisplayBalance || ""}
        disabled={balanceIsZero}
        onChange={setValue}
        value={stringValue}
        validValue={isValidValue}
      />
      <div className={calloutClassName}>
        <LabeledText
          muted={false}
          className={tw("flex", "flex-col", "justify-center", "items-center")}
          bold
          textClassName={tw("text-2xl")}
          text={shareOfPoolLabel}
          label={"Share of pool"}
        />
        <LabeledText
          muted={false}
          className={tw("flex", "flex-col", "justify-center", "items-center")}
          bold
          textClassName={tw("text-2xl")}
          text={termAssetLiquidityLabel}
          label={t`${termAssetInfo.symbol} liquidity`}
        />
        <LabeledText
          muted={false}
          className={tw("flex", "flex-col", "justify-center", "items-center")}
          bold
          textClassName={tw("text-2xl")}
          text={baseAssetLiquidityLabel}
          label={t`${baseAssetSymbol} liquidity`}
        />
      </div>

      {/* Quick Actions */}
      {isConvergentCurvePool(pool) && (
        <UnstakeConvergentCurvePoolButton
          account={account}
          connector={connector}
          library={library}
          pool={pool}
          amount={stringValue}
          disabled={disableUnstake}
        />
      )}
      {isWeightedPool(pool) && (
        <UnstakeWeightedPoolButton
          account={account}
          connector={connector}
          library={library}
          pool={pool}
          amount={stringValue}
          disabled={disableUnstake}
        />
      )}
    </div>
  );
}

function calculatePoolShareLiquidity(
  poolShares: number | undefined,
  poolTokenAddresses: string[] | undefined,
  poolTokenReserves: BigNumber[] | undefined,
  tokenAddress: string | undefined,
  tokenDecimals: number | undefined
): number | undefined {
  let baseAssetLiquidity: number | undefined;
  if (
    poolShares &&
    poolTokenAddresses &&
    poolTokenReserves &&
    tokenAddress &&
    tokenDecimals
  ) {
    const reservesByAddress = zipObject(poolTokenAddresses, poolTokenReserves);
    const reserves = reservesByAddress[tokenAddress];
    const reservesNumber = +formatUnits(reserves ?? 0, tokenDecimals);
    baseAssetLiquidity = poolShares * reservesNumber;
  }
  return baseAssetLiquidity;
}

function getShareOfPoolLabel(shareOfPool: number | undefined) {
  if (!shareOfPool) {
    return formatPercent(0, 0);
  }
  if (shareOfPool === 1) {
    return formatPercent(shareOfPool, 0);
  }

  return formatPercent(shareOfPool, 2);
}
