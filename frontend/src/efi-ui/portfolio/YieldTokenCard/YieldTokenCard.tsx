import { ReactElement, ReactNode, useMemo } from "react";

import {
  AnchorButton,
  Button,
  ButtonGroup,
  Callout,
  Card,
  Elevation,
  Icon,
  Intent,
  Tag,
} from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Tooltip2 } from "@blueprintjs/popover2";
import { Web3Provider } from "@ethersproject/providers";
import { navigate } from "@reach/router";
import classNames from "classnames";
import { InterestToken } from "elf-contracts/types/InterestToken";
import { formatUnits } from "ethers/lib/utils";
import { jt, t } from "ttag";

import { getCoinGeckoId } from "efi-coingecko";
import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { useCoinGeckoPrice } from "efi-ui/coingecko/useCoinGeckoPrice";
import { ERC20Shim } from "efi-ui/contracts/ERC20Shim";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { findAssetIcon } from "efi-ui/crypto/CryptoIcon";
import { useCryptoDecimals } from "efi-ui/crypto/hooks/useCryptoDecimals/useCryptoDecimals";
import { useCryptoSymbol } from "efi-ui/crypto/hooks/useCryptoSymbol/useCryptoSymbol";
import { useOnSwapGivenIn } from "efi-ui/pools/useOnSwapGivenIn/useOnSwapGivenIn";
import { usePoolForToken } from "efi-ui/pools/usePoolForToken/usePoolForToken";
import { useCurrencyPref } from "efi-ui/prefs/useCurrency/useCurencyPref";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { useTokenBalance } from "efi-ui/token/hooks/useTokenBalance";
import { useBaseAssetForTranche } from "efi-ui/tranche/useBaseAssetForTranche";
import { useTrancheForInterestToken } from "efi-ui/tranche/useTrancheForInterestToken";
import { useUnderlyingVaultForTranche } from "efi-ui/tranche/useUnderlyingVaultForTranche";
import { convertEpochSecondsToDate } from "efi/base/convertEpochSecondsToDate";
import { formatMoney } from "efi/money/formatMoney";
import { formatAbbreviatedDate } from "efi/base/dates";
import { MaturityTimeBar } from "efi-ui/portfolio/PrincipalTokenCard/MaturityTimeBar";
import { calculateProgress } from "efi-ui/portfolio/PrincipalTokenCard/calculateProgress";
import { useTrancheCreatedAt } from "efi-ui/tranche/useTrancheCreatedAt";
import { useYearnVault } from "efi-ui/yearn/useYearnVault";
import { CryptoAssetType } from "efi/crypto/CryptoAsset";
import { formatPercent } from "efi/base/formatPercent";
import { SellYieldTokensButton } from "efi-ui/portfolio/SellButton/SellYieldTokensButton";
import { AbstractConnector } from "@web3-react/abstract-connector";

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
  library,
  account,
  chainId,
  connector,
  walletConnectionActive,
  yieldToken,
}: YieldTokenCardProps): ReactElement {
  const { isDarkMode } = useDarkMode();
  const { currency } = useCurrencyPref();

  const { data: yieldTokenSymbol } = useSmartContractReadCall(
    yieldToken,
    "symbol"
  );
  const { data: yieldTokenBalanceOf } = useSmartContractReadCall(
    yieldToken,
    "balanceOf",
    {
      enabled: !!account,
      callArgs: [account as string],
    }
  );
  const yieldTokenBalance = useTokenBalance(
    (yieldToken as unknown) as ERC20Shim,
    account
  );

  // The tranche contains the unlockTimestamp
  const tranche = useTrancheForInterestToken(yieldToken);
  const trancheCreatedAt = useTrancheCreatedAt(tranche);
  const { data: unlockTimestamp } = useSmartContractReadCall(
    tranche,
    "unlockTimestamp"
  );
  const unlockDate = useMemo(() => convertEpochSecondsToDate(unlockTimestamp), [
    unlockTimestamp,
  ]);
  const createdAtDate = useMemo(
    () => convertEpochSecondsToDate(trancheCreatedAt),
    [trancheCreatedAt]
  );

  const vaultContract = useUnderlyingVaultForTranche(tranche);

  const pool = usePoolForToken((yieldToken as unknown) as ERC20Shim);

  const baseAsset = useBaseAssetForTranche(tranche);
  const baseAssetSymbol = useCryptoSymbol(baseAsset);
  const { data: baseAssetFiatPrice } = useCoinGeckoPrice(
    getCoinGeckoId(baseAssetSymbol),
    currency
  );
  const baseAssetDecimals = useCryptoDecimals(baseAsset);
  const { data: exitValueBigNumber } = useOnSwapGivenIn(
    pool,
    (yieldToken as unknown) as ERC20Shim,
    yieldTokenBalanceOf
  );

  const BaseAssetIcon = findAssetIcon(baseAssetSymbol);

  // TODO: Proof of concept for now, this should be done w/ a lookup against a
  // list of mainnet addresses
  let vaultSymbol: string | undefined;
  if (baseAsset?.type === CryptoAssetType.ETHEREUM) {
    vaultSymbol = "yvWETH";
  } else if (baseAsset?.type === CryptoAssetType.ERC20PERMIT) {
    vaultSymbol = "yvUSDC";
  }

  const { data: yearnVault } = useYearnVault(vaultSymbol);
  const { name: vaultName } = yearnVault || {};

  const postedAPY = formatPercent(yearnVault?.apy?.recommended || 0);
  const exitValue = +formatUnits(exitValueBigNumber || 0, baseAssetDecimals);
  const exitValueFiat = formatMoney(baseAssetFiatPrice?.multiply(exitValue));
  const formattedDate = unlockDate
    ? formatAbbreviatedDate(unlockDate)
    : t`Loading unlock date...`;
  const progress = calculateProgress(createdAtDate, unlockDate);
  const tableRowLink = getTableRowLink(vaultContract?.address, vaultName);

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
              title={baseAssetSymbol}
              height={72}
              width={72}
            />
          ) : null}
          <div className={tw("flex", "flex-col", "space-y-2")}>
            <span className={tw("text-2xl", "font-semibold")}>
              <a
                title={t`View tranche on etherscan`}
                href={`https://etherscan.io/address/${yieldToken.address}`}
                target="_blank"
                rel="noreferrer noopener"
              >
                {t`${baseAssetSymbol} Yield Token` || null}
              </a>
            </span>
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
              text={`${yieldTokenBalance.toFixed(6)} yt${baseAssetSymbol}`}
              label={t`1 Yield Token = yield on 1 ${baseAssetSymbol} at maturity`}
            />
          </Callout>
          <Callout icon={null} className={calloutClassName}>
            <span
              className={classNames(tw("text-base", "mb-0"))}
            >{t`Current exit value`}</span>
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
          <Tooltip2
            inheritDarkTheme={false}
            content={t`This asset can be claimed after it has reached maturity.`}
          >
            <AnchorButton
              fill
              minimal
              disabled={
                /*
                 * See Blueprint docs, we have to use an AnchorButton for a11y
                 * when putting a tooltip on a disabled button
                 */
                true
              }
            >
              <div className={tw("p-2", "text-base")}>{t`Claim`}</div>
            </AnchorButton>
          </Tooltip2>
          <SellYieldTokensButton
            account={account}
            chainId={chainId}
            connector={connector}
            library={library}
            walletConnectionActive={walletConnectionActive}
            pool={pool}
            baseAsset={baseAsset}
            maxSellAmount={yieldTokenBalance.toString()}
            yieldToken={yieldToken}
          />
          <Button fill minimal intent={Intent.PRIMARY}>
            <div className={tw("p-2", "text-base")}>{t`Stake`}</div>
          </Button>
          <AnchorButton
            intent={Intent.PRIMARY}
            onClick={() => navigate(`exchange/${pool?.address}`)}
            minimal
          >
            <div className={tw("p-2", "text-base")}>{t`Go to market`}</div>
          </AnchorButton>
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
