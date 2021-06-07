import { ReactElement } from "react";

import { Web3Provider } from "@ethersproject/providers";
import { AbstractConnector } from "@web3-react/abstract-connector";
import { ConvergentCurvePool } from "elf-contracts/types/ConvergentCurvePool";
import { Tranche__factory } from "elf-contracts/types/factories/Tranche__factory";
import { BigNumber } from "ethers";
import { formatEther, formatUnits } from "ethers/lib/utils";
import zipObject from "lodash.zipobject";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { useNumericInput } from "efi-ui/base/hooks/useNumericInput/useNumericInput";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { UnstakeConvergentCurvePoolButton } from "efi-ui/pools/UnstakeButton/UnstakeConvergentCurvePoolButton";
import { UnstakeWeightedPoolButton } from "efi-ui/pools/UnstakeButton/UnstakeWeightedPoolButton";
import { UnstakeInput } from "efi-ui/pools/UnstakeInput/UnstakeInput";
import { useBaseAssetForPool } from "efi-ui/pools/useBaseAssetForPool/useBaseAssetForPool";
import { usePoolTokens } from "efi-ui/pools/usePoolTokens/usePoolTokens";
import { useShareOfPool } from "efi-ui/pools/useShareOfPool";
import { useTokenBalanceOf } from "efi-ui/token/hooks/useTokenBalanceOf";
import { useTokenDecimals } from "efi-ui/token/hooks/useTokenDecimals";
import { KNOWN_BASE_ASSETS } from "efi/addresses";
import { formatPercent } from "efi/base/formatPercent";
import { getSmartContractFromRegistry } from "efi/contracts/SmartContractsRegistry";
import { CryptoSymbol } from "efi/crypto/CryptoSymbol";
import { getCryptoAssetForToken } from "efi/crypto/getCryptoAssetForToken";
import { getCryptoSymbol } from "efi/crypto/getCryptoSymbol";
import { isConvergentCurvePool, isWeightedPool } from "efi/pools/PoolContract";

interface UnstakeCardProps {
  library: Web3Provider | undefined;
  connector: AbstractConnector | undefined;
  account: string | null | undefined;
  pool: ConvergentCurvePool | undefined;
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
}: UnstakeCardProps): ReactElement {
  // base asset
  const baseAssetContract = useBaseAssetForPool(pool);
  const { data: baseAssetDecimals } = useTokenDecimals(baseAssetContract);
  const baseAssetCryptoAsset = getCryptoAssetForToken(
    baseAssetContract?.address
  );
  const baseAssetSymbol = getCryptoSymbol(baseAssetCryptoAsset);

  // Principal token
  const tranche = useTrancheForPool(pool);
  const { data: trancheDecimals } = useTokenDecimals(tranche);

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
  const principalTokenLiquidity = calculatePoolShareLiquidity(
    shareOfPool,
    addresses,
    poolBalances,
    tranche?.address,
    trancheDecimals
  );

  const baseAssetLiquidityLabel = baseAssetLiquidity
    ? `${baseAssetLiquidity?.toFixed(4)}`
    : "0.0000";
  const principalTokenLiquidityLabel = principalTokenLiquidity
    ? `${principalTokenLiquidity?.toFixed(4)}`
    : "0.0000";

  const { stringValue, setValue } = useNumericInput();

  return (
    <div
      className={tw(
        "flex",
        "flex-col",
        "flex-1",
        "space-y-5",
        "p-8",
        "items-center"
      )}
    >
      <UnstakeInput
        cryptoSymbol={baseAssetSymbol as CryptoSymbol}
        cryptoDecimals={baseAssetDecimals}
        cryptoAssetIcon={undefined}
        cryptoBalanceOf={lpBalanceOf}
        cryptoDisplayBalance={lpDisplayBalance || ""}
        disabled={false}
        onChange={setValue}
        labelTopLeft={t`Base asset`}
        value={stringValue}
        validValue={true}
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
          text={principalTokenLiquidityLabel}
          label={t`pt${baseAssetSymbol} liquidity`}
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
        />
      )}
      {isWeightedPool(pool) && (
        <UnstakeWeightedPoolButton
          account={account}
          connector={connector}
          library={library}
          pool={pool}
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
    const reservesNumber = +formatUnits(reserves, tokenDecimals);
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

function useTrancheForPool(pool: ConvergentCurvePool | undefined) {
  const { data: [poolTokens = []] = [] } = usePoolTokens(pool);
  const principalTokenAddress = poolTokens.find(
    (address) => !KNOWN_BASE_ASSETS.includes(address)
  );

  return getSmartContractFromRegistry(
    principalTokenAddress,
    Tranche__factory.connect
  );
}
