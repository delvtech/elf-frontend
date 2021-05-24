import React, { ReactElement, ReactNode } from "react";

import {
  ButtonGroup,
  Callout,
  Card,
  Elevation,
  Icon,
  Intent,
  Tag,
} from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Web3Provider } from "@ethersproject/providers";
import { Link } from "@reach/router";
import { AbstractConnector } from "@web3-react/abstract-connector";
import classNames from "classnames";
import { Tranche__factory } from "elf-contracts/types/factories/Tranche__factory";
import { InterestToken } from "elf-contracts/types/InterestToken";
import { formatUnits } from "ethers/lib/utils";
import { PrincipalTokenInfo } from "tokenlists/types";
import { jt, t } from "ttag";

import { getCoinGeckoId } from "efi-coingecko";
import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { useCoinGeckoPrice } from "efi-ui/coingecko/useCoinGeckoPrice";
import { findAssetIcon2 } from "efi-ui/crypto/CryptoIcon";
import { usePoolSpotPrice } from "efi-ui/pools/usePoolSpotPrice/usePoolSpotPrice";
import { GoToMarketButton } from "efi-ui/portfolio/PrincipalTokenCard/GoToMarketButton";
import { MaturityTimeBar } from "efi-ui/portfolio/PrincipalTokenCard/MaturityTimeBar";
import { RedeemYieldTokensButton } from "efi-ui/portfolio/RedeemButton/RedeemYieldTokensButton";
import { useCurrencyPref } from "efi-ui/prefs/useCurrency/useCurencyPref";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { useTokenBalanceOf } from "efi-ui/token/hooks/useTokenBalanceOf";
import { getTermAssetSymbol } from "efi-ui/tranche/useTermAssetSymbol";
import { useUnderlyingVaultForTranche } from "efi-ui/tranche/useUnderlyingVaultForTranche";
import { useYearnVault } from "efi-ui/yearn/useYearnVault";
import { calculateProgress } from "efi/base/calculateProgress";
import { convertEpochSecondsToDate } from "efi/base/convertEpochSecondsToDate";
import { formatAbbreviatedDate } from "efi/base/dates";
import { formatPercent } from "efi/base/formatPercent";
import { ERC20Shim } from "efi/contracts/ERC20Shim";
import { getSmartContractFromRegistry } from "efi/contracts/SmartContractsRegistry";
import { getCryptoAssetForToken } from "efi/crypto/getCryptoAssetForToken";
import { getCryptoDecimals } from "efi/crypto/getCryptoDecimals";
import { getCryptoSymbol } from "efi/crypto/getCryptoSymbol";
import { yieldTokenInfos } from "efi/interestToken/interestToken";
import { formatMoney } from "efi/money/formatMoney";
import { getPoolForYieldToken } from "efi/pools/weightedPool";
import { PrincipalTokenInfos } from "efi/tranche/tranches";
import { getVaultSymbol } from "efi/vaults/getVaultSymbol";

interface YieldTokenCardProps {
  library: Web3Provider | undefined;
  account: string | null | undefined;
  chainId: number | undefined;
  walletConnectionActive: boolean;
  connector: AbstractConnector | undefined;
  yieldToken: InterestToken;
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

export function YieldTokenCard({
  account,
  library,
  yieldToken,
}: YieldTokenCardProps): ReactElement {
  const { isDarkMode } = useDarkMode();
  const { currency } = useCurrencyPref();

  const yieldTokenInfo = yieldTokenInfos.find(
    (info) => info.address === yieldToken?.address
  );

  const { data: yieldTokenBalanceOf } = useTokenBalanceOf(yieldToken, account);
  const yieldTokenBalance = +formatUnits(
    yieldTokenBalanceOf ?? 0,
    yieldTokenInfo?.decimals
  );

  // The tranche contains the unlockTimestamp
  const trancheAddress = yieldTokenInfo?.extensions?.tranche;
  const trancheInfo = PrincipalTokenInfos.find(
    (info) => info.address === trancheAddress
  );

  const {
    createdAtTimestamp: trancheCreatedAt,
    unlockTimestamp,
    position,
    underlying,
  } = trancheInfo?.extensions ?? ({} as PrincipalTokenInfo["extensions"]);
  const unlockDate = convertEpochSecondsToDate(unlockTimestamp);
  const createdAtDate = convertEpochSecondsToDate(trancheCreatedAt);
  const trancheContract = getSmartContractFromRegistry(
    position,
    Tranche__factory.connect
  );
  const vaultContract = useUnderlyingVaultForTranche(trancheContract);

  const baseAsset = getCryptoAssetForToken(underlying);
  const baseAssetSymbol = getCryptoSymbol(baseAsset);
  const { data: baseAssetFiatPrice } = useCoinGeckoPrice(
    getCoinGeckoId(baseAssetSymbol),
    currency
  );
  const baseAssetDecimals = getCryptoDecimals(baseAsset);

  const pool = getPoolForYieldToken(yieldToken.address);

  const spotPrice = usePoolSpotPrice(pool, yieldToken as unknown as ERC20Shim);
  const BaseAssetIcon = findAssetIcon2(baseAsset);

  const vaultSymbol = getVaultSymbol(baseAsset);
  const { data: yearnVault } = useYearnVault(vaultSymbol);
  const { name: vaultName } = yearnVault || {};

  const postedAPY = formatPercent(yearnVault?.apy?.recommended || 0);
  const exitValue =
    +formatUnits(yieldTokenBalanceOf || 0, baseAssetDecimals) *
    (spotPrice || 0);
  const exitValueFiat = formatMoney(baseAssetFiatPrice?.multiply(exitValue));
  const formattedDate = unlockDate
    ? formatAbbreviatedDate(unlockDate)
    : t`Loading unlock date...`;
  const progress = calculateProgress(createdAtDate, unlockDate);
  const tableRowLink = getTableRowLink(vaultContract?.address, vaultName);

  const { symbol: termAssetSymbol } = getTermAssetSymbol(
    yieldToken.address,
    vaultSymbol
  );

  return (
    <div>
      <Card
        style={{ width: 512 }}
        elevation={Elevation.TWO}
        className={classNames(
          tw("p-8", "flex", "flex-col", "m-4", "space-y-5", "text-base", {
            "text-gray-700": !isDarkMode,
            "text-white": isDarkMode,
          })
        )}
      >
        <div className={tw("flex", "space-x-4")}>
          {BaseAssetIcon ? (
            <BaseAssetIcon
              className={tw("flex-shrink-0")}
              height={72}
              width={72}
            />
          ) : null}
          <div className={tw("flex", "flex-col", "space-y-2")}>
            <div
              className={tw(
                "flex",
                "items-center",
                "space-x-2",
                "text-2xl",
                "font-semibold"
              )}
            >
              <Link to={`/pools/${pool?.address}`}>
                {t`${baseAssetSymbol} Yield Token` || null}
              </Link>
              <a
                className={tw("flex", "items-center")}
                onClick={(e) => e.stopPropagation()}
                href={`https://etherscan.io/address/${yieldToken?.address}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon
                  intent={Intent.NONE}
                  className={tw("pr-2")}
                  icon={IconNames.SHARE}
                />
              </a>
            </div>
            <div
              className={tw(
                "flex",
                "w-full",
                "items-center",
                "justify-center",
                "space-x-8"
              )}
            >
              <div>
                <Tag
                  large
                  intent={Intent.SUCCESS}
                  fill
                  className={tw("text-center")}
                >
                  {formattedDate}
                </Tag>
              </div>
              <div className={tw("flex", "space-x-6", "justify-end")}>
                <LabeledText
                  bold
                  textClassName={tw("text-base")}
                  text={postedAPY}
                  label={t`Position APY`}
                />
              </div>
            </div>
          </div>
        </div>
        <div className={tw("flex", "flex-col", "space-y-5", "items-center")}>
          <MaturityTimeBar progress={progress} maturationDate={unlockDate} />
          <Callout className={calloutClassName}>
            <span
              className={classNames(tw("text-base", "mb-0"))}
            >{t`Total balance`}</span>
            <LabeledText
              muted={false}
              className={tw("flex", "justify-center", "items-center")}
              bold
              textClassName={tw("text-2xl")}
              text={`${yieldTokenBalance.toFixed(6)} ${termAssetSymbol}`}
              label={t`1 Yield Token = yield on 1 ${baseAssetSymbol} at maturity`}
            />
          </Callout>
          <Callout icon={null} className={calloutClassName}>
            <span
              className={classNames(tw("text-base", "mb-0"))}
            >{t`Current value`}</span>
            <LabeledText
              bold
              muted={false}
              className={tw("flex", "justify-center", "items-center")}
              textClassName={tw("text-2xl")}
              text={
                <span>{t`${exitValue.toFixed(6)} ${baseAssetSymbol}`}</span>
              }
              label={exitValueFiat}
            />
          </Callout>
        </div>
        {/* Quick Actions */}
        <ButtonGroup className={tw("space-x-6")}>
          <RedeemYieldTokensButton
            account={account}
            tranche={trancheContract}
            library={library}
            baseAsset={baseAsset}
          />
          <GoToMarketButton pool={pool} isStake label={t`Stake`} />
          <GoToMarketButton pool={pool} isStake={false} label={t`Sell`} />
        </ButtonGroup>
        <div className={tw("flex", "justify-center")}>
          <span>
            {jt`Yield accrued on ${baseAssetSymbol} deposited in ${tableRowLink}`}
          </span>
        </div>
      </Card>
    </div>
  );
}

function getTableRowLink(
  vaultAddress: string | undefined,
  vaultName: string | undefined
): ReactNode {
  if (!vaultAddress || !vaultName) {
    return null;
  }

  return (
    <a key="table-row-link" href={`https://etherscan.io/token/${vaultAddress}`}>
      {vaultName}{" "}
      <sup>
        <Icon icon={IconNames.SHARE} iconSize={8} />
      </sup>
    </a>
  );
}
