import { ReactElement } from "react";

import { Callout } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { AbstractConnector } from "@web3-react/abstract-connector";
import classNames from "classnames";
import { ConvergentCurvePool } from "elf-contracts/types/ConvergentCurvePool";
import { Tranche__factory } from "elf-contracts/types/factories/Tranche__factory";
import { BigNumber } from "ethers";
import { formatUnits } from "ethers/lib/utils";
import zipObject from "lodash.zipobject";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { getCryptoAssetForToken } from "efi/crypto/getCryptoAssetForToken";
import { getCryptoSymbol } from "efi/crypto/getCryptoSymbol";
import { UnstakeConvergentCurvePoolButton } from "efi-ui/pools/UnstakeButton/UnstakeConvergentCurvePoolButton";
import { UnstakeWeightedPoolButton } from "efi-ui/pools/UnstakeButton/UnstakeWeightedPoolButton";
import { useBaseAssetForPool } from "efi-ui/pools/useBaseAssetForPool/useBaseAssetForPool";
import { usePoolTokens } from "efi-ui/pools/usePoolTokens/usePoolTokens";
import { useShareOfPool } from "efi-ui/pools/useShareOfPool";
import { useTokenDecimals } from "efi-ui/token/hooks/useTokenDecimals";
import { KNOWN_BASE_ASSETS } from "efi/addresses";
import { formatPercent } from "efi/base/formatPercent";
import { getSmartContractFromRegistry } from "efi/contracts/SmartContractsRegistry";
import { isConvergentCurvePool, isWeightedPool } from "efi/pools/PoolContract";

interface UnstakeCardProps {
  library: Web3Provider | undefined;
  connector: AbstractConnector | undefined;
  account: string | null | undefined;
  pool: ConvergentCurvePool | undefined;
}

const calloutClassName = tw(
  "flex",
  "flex-col",
  "flex-1",
  "h-full",
  "p-8",
  "items-center",
  "justify-center"
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
      <div className={tw("flex", "w-full", "space-x-5", "items-center")}>
        <Callout className={calloutClassName}>
          <span
            className={classNames(tw("text-base", "mb-0"))}
          >{t`${baseAssetSymbol} liquidity`}</span>
          <span className={tw("text-lg", "font-semibold")}>
            {baseAssetLiquidityLabel}
          </span>
        </Callout>
        <Callout className={calloutClassName}>
          <span
            className={classNames(tw("text-base", "mb-0"))}
          >{t`pt${baseAssetSymbol} liquidity`}</span>
          <span className={tw("text-lg", "font-semibold")}>
            {principalTokenLiquidityLabel}
          </span>
        </Callout>
      </div>
      <Callout className={calloutClassName}>
        <span
          className={classNames(tw("text-base", "mb-0"))}
        >{t`Share of pool`}</span>
        <LabeledText
          muted={false}
          className={tw("flex", "justify-center", "items-center")}
          bold
          textClassName={tw("text-2xl")}
          text={shareOfPoolLabel}
          label={""}
        />
      </Callout>

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
