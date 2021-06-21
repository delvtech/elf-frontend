import { ReactElement, useCallback, useState } from "react";

import { Button, Intent } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { ConvergentCurvePool, WeightedPool } from "elf-contracts/types";
import { BigNumber, Signer } from "ethers";
import { formatEther, formatUnits, parseUnits } from "ethers/lib/utils";
import zipObject from "lodash.zipobject";
import { PrincipalTokenInfo, YieldTokenInfo } from "tokenlists/types";
import { t } from "ttag";

import { BALANCER_POOL_LP_TOKEN_DECIMALS } from "efi-balancer/pools";
import tw from "efi-tailwindcss-classnames";
import { useNumericInput } from "efi-ui/base/hooks/useNumericInput/useNumericInput";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { UnstakeInput } from "efi-ui/pools/UnstakeInput/UnstakeInput";
import { UnstakeConfirmationDrawer } from "efi-ui/pools/UnstakeTokensConfirmationDrawer/UnstakeTokensConfirmationDrawer";
import { usePoolTokens } from "efi-ui/pools/usePoolTokens/usePoolTokens";
import { useShareOfPool } from "efi-ui/pools/useShareOfPool";
import { useExitConvergentCurvePool } from "efi-ui/pools/useUnstake/useExitConvergentCurvePool";
import { useExitWeightedPool } from "efi-ui/pools/useUnstake/useExitWeightedPool";
import { useTokenBalanceOf } from "efi-ui/token/hooks/useTokenBalanceOf";
import { ElementIcon } from "efi-ui/token/TokenIcon";
import { ConnectWalletDialog } from "efi-ui/wallets/ConnectWalletDialog/ConnectWalletDialog";
import { formatPercent } from "efi/base/formatPercent";
import { getCryptoAssetForToken } from "efi/crypto/getCryptoAssetForToken";
import { getCryptoSymbol } from "efi/crypto/getCryptoSymbol";
import { getPoolContract } from "efi/pools/getPoolContract";
import { getPoolTokens } from "efi/pools/getPoolTokens";
import { PoolInfo } from "efi/pools/PoolInfo";
import { isYieldPool } from "efi/pools/weightedPool";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";

interface UnstakeCardProps {
  signer: Signer | undefined;
  library: Web3Provider | undefined;
  account: string | null | undefined;
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
  signer,
  library,
  account,
  poolInfo,
}: UnstakeCardProps): ReactElement {
  // local state
  const [isWalletDialogOpen, setWalletDialogOpen] = useState(false);
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  // handlers
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const onClickButton = useCallback(() => {
    if (!account) {
      return setWalletDialogOpen(true);
    }
    openDrawer();
  }, [account, openDrawer]);

  const { stringValue: unstakeValue, setValue: setUnstakeValue } =
    useNumericInput();
  const unstakeFromPool = useExitPool(signer, account, poolInfo, unstakeValue);

  const pool = getPoolContract(poolInfo.address);
  // base asset
  const { baseAssetInfo, termAssetInfo } = getPoolTokens(poolInfo);
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
    baseAssetInfo.address,
    baseAssetDecimals
  );

  const termAssetLiquidity = calculatePoolShareLiquidity(
    shareOfPool,
    addresses,
    poolBalances,
    termAssetInfo.address,
    termAssetInfo.decimals
  );

  const { data: totalSupply } = useSmartContractReadCall(pool, "totalSupply");
  const shareOut = totalSupply
    ? Number(unstakeValue) /
      Number(formatUnits(totalSupply, BALANCER_POOL_LP_TOKEN_DECIMALS))
    : 0;

  const baseAssetOutValue = calculatePoolShareLiquidity(
    shareOut,
    addresses,
    poolBalances,
    baseAssetInfo.address,
    baseAssetDecimals
  );

  const termAssetOutValue = calculatePoolShareLiquidity(
    shareOut,
    addresses,
    poolBalances,
    termAssetInfo.address,
    termAssetInfo.decimals
  );

  const baseAssetOut = baseAssetOutValue
    ? `${baseAssetOutValue?.toFixed(4)}`
    : "0.0000";

  const termAssetOut = termAssetOutValue
    ? `${termAssetOutValue?.toFixed(4)}`
    : "0.0000";

  const baseAssetLiquidityLabel = baseAssetLiquidity
    ? `${baseAssetLiquidity?.toFixed(4)}`
    : "0.0000";

  const termAssetLiquidityLabel = termAssetLiquidity
    ? `${termAssetLiquidity?.toFixed(4)}`
    : "0.0000";

  const valueBN = parseUnits(
    unstakeValue || "0",
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
        "space-y-2",
        "py-2",
        "items-center",
        "justify-between",
        "h-full"
      )}
    >
      <UnstakeInput
        label={t`LP Tokens`}
        cryptoSymbol={symbol}
        cryptoDecimals={poolInfo.decimals}
        cryptoAssetIcon={ElementIcon}
        cryptoBalanceOf={lpBalanceOf}
        cryptoDisplayBalance={lpDisplayBalance || ""}
        disabled={balanceIsZero}
        onChange={setUnstakeValue}
        value={unstakeValue}
        validValue={isValidValue}
      />
      <div className={calloutClassName}>
        <LabeledText
          muted={false}
          className={tw("flex", "flex-col", "justify-center", "items-center")}
          bold
          textClassName={tw("text-2xl")}
          text={shareOfPoolLabel}
          label={t`Share of pool`}
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

      <Button
        className={tw("w-full")}
        disabled={disableUnstake}
        onClick={onClickButton}
        minimal
        large
        outlined
        intent={Intent.PRIMARY}
      >
        {t`Unstake`}
      </Button>
      <UnstakeConfirmationDrawer
        library={library}
        account={account}
        baseAssetInfo={baseAssetInfo}
        termAssetInfo={termAssetInfo as PrincipalTokenInfo | YieldTokenInfo}
        baseAssetValue={baseAssetOut}
        termAssetValue={termAssetOut}
        lpTokensIn={unstakeValue}
        isOpen={isDrawerOpen}
        isUnstakeLoading={
          false
          // isPrincipalPoolType ? isJoinCCPoolLoading : isJoinWPoolLoading
        }
        isUnstakeError={
          false
          // isPrincipalPoolType ? isJoinCCPoolError : isJoinWPoolError
        }
        isUnstakeSuccess={
          false
          // isPrincipalPoolType ? isJoinCCPoolSuccess : isJoinWPoolSuccess
        }
        onClose={closeDrawer}
        onUnstake={unstakeFromPool}
      />
      <ConnectWalletDialog isOpen={isWalletDialogOpen} onClose={closeDrawer} />
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

function useExitPool(
  signer: Signer | undefined,
  account: string | null | undefined,
  poolInfo: PoolInfo,
  amount: string
) {
  const principalPool = getPoolContract(
    poolInfo.address
  ) as ConvergentCurvePool;
  const exitPrincipalPool = useExitConvergentCurvePool(
    signer,
    account,
    principalPool,
    amount
  );

  const yieldPool = getPoolContract(poolInfo.address) as WeightedPool;
  const exitYieldPool = useExitWeightedPool(signer, account, yieldPool, amount);

  if (isYieldPool(poolInfo)) {
    return exitYieldPool;
  }

  return exitPrincipalPool;
}
