import { ReactElement, useMemo } from "react";

import {
  ButtonGroup,
  Callout,
  Card,
  Icon,
  Intent,
  Tag,
} from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Web3Provider } from "@ethersproject/providers";
import { AbstractConnector } from "@web3-react/abstract-connector";
import classNames from "classnames";
import { Tranche } from "elf-contracts/types/Tranche";
import { jt, t } from "ttag";

import { getCoinGeckoId } from "efi-coingecko";
import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { useCoinGeckoPrice } from "efi-ui/coingecko/useCoinGeckoPrice";
import { ERC20Shim } from "efi-ui/contracts/ERC20Shim";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { findAssetIcon } from "efi-ui/crypto/CryptoIcon";
import { useCryptoSymbol } from "efi-ui/crypto/hooks/useCryptoSymbol/useCryptoSymbol";
import { usePoolForToken } from "efi-ui/pools/usePoolForToken/usePoolForToken";
import { usePoolPairedToken } from "efi-ui/pools/usePoolPairedToken/usePoolPairedToken";
import { usePoolTokenPrices } from "efi-ui/pools/usePoolTokenPrices/usePoolTokenPrices";
import { RedeemButton } from "efi-ui/portfolio/RedeemButton/RedeemButton";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { useTokenBalance } from "efi-ui/token/hooks/useTokenBalance";
import { useBaseAssetForTranche } from "efi-ui/tranche/useBaseAssetForTranche";
import { useTrancheCreatedAt } from "efi-ui/tranche/useTrancheCreatedAt";
import { useUnderlyingVaultForTranche } from "efi-ui/tranche/useUnderlyingVaultForTranche";
import { convertEpochSecondsToDate } from "efi/base/convertEpochSecondsToDate";
import { formatAbbreviatedDate } from "efi/base/dates";
import { formatMoney } from "efi/money/formatMoney";
import { calculateTrancheAPY } from "efi/tranche/calculateTrancheAPY";

import { calculateProgress } from "./calculateProgress";
import { MaturityTimeBar } from "./MaturityTimeBar";
import { GoToMarketButton } from "./GoToMarketButton";

interface PrincipalTokenCardProps {
  chainId: number | undefined;
  library: Web3Provider | undefined;
  connector: AbstractConnector | undefined;
  walletConnectionActive: boolean;
  account: string | null | undefined;
  tranche: Tranche;
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

export function PrincipalTokenCard(
  props: PrincipalTokenCardProps
): ReactElement {
  const { library, account, tranche } = props;
  const { isDarkMode } = useDarkMode();
  const baseAsset = useBaseAssetForTranche(tranche);

  const trancheCreatedAt = useTrancheCreatedAt(tranche);
  const { data: unlockTimestamp } = useSmartContractReadCall(
    tranche,
    "unlockTimestamp"
  );
  const unlockDate = convertEpochSecondsToDate(unlockTimestamp);
  const createdAtDate = convertEpochSecondsToDate(trancheCreatedAt);
  const progress = calculateProgress(createdAtDate, unlockDate);

  const formattedDate = unlockDate
    ? formatAbbreviatedDate(unlockDate)
    : t`Loading unlock date...`;

  const trancheBalance = useTokenBalance(
    (tranche as unknown) as ERC20Shim,
    account
  );

  const vaultContract = useUnderlyingVaultForTranche(tranche);
  const { data: vaultName } = useSmartContractReadCall(vaultContract, "name");
  const pool = usePoolForToken((tranche as unknown) as ERC20Shim);
  const baseAssetContract = usePoolPairedToken(pool, tranche);
  const {
    spotPriceBaseAssetForOneToken: tranchePriceInBaseAsset = 0,
  } = usePoolTokenPrices(pool, baseAssetContract);

  const baseAssetSymbol = useCryptoSymbol(baseAsset);

  const exitValue = trancheBalance * tranchePriceInBaseAsset;
  const { data: baseAssetCoinGeckoPrice } = useCoinGeckoPrice(
    getCoinGeckoId(baseAssetSymbol)
  );

  let fiatPrice;
  if (tranchePriceInBaseAsset && baseAssetCoinGeckoPrice) {
    fiatPrice = formatMoney(baseAssetCoinGeckoPrice.multiply(exitValue));
  }

  const BaseAssetIcon = findAssetIcon(baseAssetSymbol);

  const tableRowLink = getTableRowLink(vaultContract?.address, vaultName);
  const maturationDate = useMemo(
    () => convertEpochSecondsToDate(unlockTimestamp),
    [unlockTimestamp]
  );

  let trancheAPY = 0;
  if (maturationDate) {
    trancheAPY = calculateTrancheAPY(
      tranchePriceInBaseAsset,
      Date.now(),
      maturationDate?.getTime()
    );
  }

  return (
    <Card
      style={{ width: 512 }}
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
              title={t`View principal token on etherscan`}
              href={`https://etherscan.io/address/${tranche.address}`}
              target="_blank"
              rel="noreferrer noopener"
            >
              {t`${baseAssetSymbol} Principal Token` || null}
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
            <Tag
              large
              intent={Intent.PRIMARY}
              fill
              className={tw("text-center")}
            >
              {formattedDate}
            </Tag>
            <div className={tw("flex", "space-x-6", "justify-end")}>
              <LabeledText
                bold
                textClassName={tw("text-base")}
                text={`${trancheAPY.toFixed(2)}%`}
                label={t`yearly`}
              />
              <LabeledText
                bold
                textClassName={tw("text-base")}
                text={`${(trancheAPY / 12).toFixed(2)}%`}
                label={t`monthly`}
              />
              <LabeledText
                bold
                textClassName={tw("text-base")}
                text={`${(trancheAPY / 365).toFixed(2)}%`}
                label={t`daily`}
              />
            </div>
          </div>
        </div>
      </div>
      <div className={tw("flex", "flex-col", "space-y-5", "items-center")}>
        <MaturityTimeBar progress={progress} maturationDate={maturationDate} />

        <Callout className={calloutClassName}>
          <span
            className={classNames(tw("text-base", "mb-0"))}
          >{t`Total balance`}</span>
          <LabeledText
            muted={false}
            className={tw("flex", "justify-center", "items-center")}
            bold
            textClassName={tw("text-2xl")}
            text={`${trancheBalance.toFixed(6)} pt${baseAssetSymbol}`}
            label={t`1 Principal Token = 1 ${baseAssetSymbol} at maturity`}
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
            text={<span>{t`${exitValue.toFixed(6)} ${baseAssetSymbol}`}</span>}
            label={fiatPrice}
          />
        </Callout>
      </div>

      {/* Quick Actions */}
      <ButtonGroup className={tw("space-x-6")}>
        <RedeemButton
          library={library}
          account={account}
          tranche={tranche}
          sellAmount={trancheBalance.toString()}
          baseAsset={baseAsset}
        />
        <GoToMarketButton pool={pool} />
      </ButtonGroup>
      <div className={tw("flex", "justify-center")}>
        <span>
          {jt`Fixed yield is backed by ${baseAssetSymbol} deposited in ${tableRowLink}`}
        </span>
      </div>
    </Card>
  );
}

function getTableRowLink(
  vaultAddress: string | undefined,
  vaultName: string | undefined
): ReactElement | null {
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
