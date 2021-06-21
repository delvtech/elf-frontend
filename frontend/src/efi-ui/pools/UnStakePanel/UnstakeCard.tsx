import { ReactElement, useCallback, useState } from "react";

import { Button, Intent } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { TokenInfo } from "@uniswap/token-lists";
import { ConvergentCurvePool, WeightedPool } from "elf-contracts/types";
import { BigNumber, Signer } from "ethers";
import { formatEther, formatUnits, parseUnits } from "ethers/lib/utils";
import zipObject from "lodash.zipobject";
import { PrincipalTokenInfo, YieldTokenInfo } from "tokenlists/types";
import { t } from "ttag";

import { BALANCER_POOL_LP_TOKEN_DECIMALS } from "efi-balancer/pools";
import tw from "efi-tailwindcss-classnames";
import { useNumericInput } from "efi-ui/base/hooks/useNumericInput/useNumericInput";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { UnstakeInput } from "efi-ui/pools/UnstakeInput/UnstakeInput";
import { UnstakeConfirmationDrawer } from "efi-ui/pools/UnstakeTokensConfirmationDrawer/UnstakeTokensConfirmationDrawer";
import { usePoolTokens } from "efi-ui/pools/usePoolTokens/usePoolTokens";
import { useExitConvergentCurvePool } from "efi-ui/pools/useUnstake/useExitConvergentCurvePool";
import { useExitWeightedPool } from "efi-ui/pools/useUnstake/useExitWeightedPool";
import { useTokenBalanceOf } from "efi-ui/token/hooks/useTokenBalanceOf";
import { ElementIcon } from "efi-ui/token/TokenIcon";
import { ConnectWalletDialog } from "efi-ui/wallets/ConnectWalletDialog/ConnectWalletDialog";
import { getPoolContract } from "efi/pools/getPoolContract";
import { getPoolTokens } from "efi/pools/getPoolTokens";
import { PoolContract } from "efi/pools/PoolContract";
import { PoolInfo } from "efi/pools/PoolInfo";
import { isYieldPool } from "efi/pools/weightedPool";
import { PoolStakeStats } from "efi-ui/pools/UnstakePanel/PoolStakeStats";

interface UnstakeCardProps {
  signer: Signer | undefined;
  library: Web3Provider | undefined;
  account: string | null | undefined;
  poolInfo: PoolInfo;
}

export function UnstakeCard({
  signer,
  library,
  account,
  poolInfo,
}: UnstakeCardProps): ReactElement {
  const pool = getPoolContract(poolInfo.address);

  // local state
  const [isWalletDialogOpen, setWalletDialogOpen] = useState(false);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const { stringValue: unstakeValue, setValue: setUnstakeValue } =
    useNumericInput();

  // handlers
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const onClickButton = useCallback(() => {
    if (!account) {
      return setWalletDialogOpen(true);
    }
    openDrawer();
  }, [account, openDrawer]);

  const unstakeFromPool = useExitPool(signer, account, poolInfo, unstakeValue);

  // display info
  const { baseAssetInfo, termAssetInfo } = getPoolTokens(poolInfo);
  const poolSymbol = `ELF:${baseAssetInfo.symbol}-${termAssetInfo.symbol}`;
  const { data: lpBalanceOf } = useTokenBalanceOf(pool, account);
  const lpDisplayBalance = formatEther(lpBalanceOf ?? 0);

  // drawer info
  const { baseAssetOut, termAssetOut } = useCalculateAssetsOut(
    pool,
    unstakeValue,
    baseAssetInfo,
    termAssetInfo
  );

  // form validators
  const { balanceIsZero, isValidValue, disableUnstake } = getFormValidators(
    unstakeValue,
    lpBalanceOf
  );

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
        cryptoSymbol={poolSymbol}
        cryptoDecimals={poolInfo.decimals}
        cryptoAssetIcon={ElementIcon}
        cryptoBalanceOf={lpBalanceOf}
        cryptoDisplayBalance={lpDisplayBalance || ""}
        disabled={balanceIsZero}
        onChange={setUnstakeValue}
        value={unstakeValue}
        validValue={isValidValue}
      />
      <PoolStakeStats account={account} poolInfo={poolInfo} />

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

function useCalculateAssetsOut(
  pool: PoolContract,
  unstakeValue: string,
  baseAssetInfo: TokenInfo,
  termAssetInfo: TokenInfo
) {
  const { data: [addresses, poolBalances] = [] } = usePoolTokens(pool);
  const { decimals: baseAssetDecimals } = baseAssetInfo;
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
  return { baseAssetOut, termAssetOut };
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

function getFormValidators(
  unstakeValue: string,
  lpBalanceOf: BigNumber | undefined
) {
  const valueBN = parseUnits(
    unstakeValue || "0",
    BALANCER_POOL_LP_TOKEN_DECIMALS
  );

  const balanceIsZero = lpBalanceOf?.isZero() ?? true;
  const valueIsZero = valueBN.isZero();
  const valueLessThanBalance = lpBalanceOf ? valueBN.lte(lpBalanceOf) : false;

  const isValidValue = valueLessThanBalance;
  const disableUnstake = balanceIsZero || valueIsZero || !isValidValue;
  return { balanceIsZero, isValidValue, disableUnstake };
}
