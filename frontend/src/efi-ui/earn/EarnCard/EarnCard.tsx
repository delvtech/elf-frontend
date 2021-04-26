import React, {
  Fragment,
  ReactElement,
  useCallback,
  useEffect,
  useState,
} from "react";

import { Button, Card, Classes, Elevation, Intent } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { AbstractConnector } from "@web3-react/abstract-connector";
import classNames from "classnames";
import { Tranche } from "elf-contracts/types/Tranche";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { SwapKind } from "efi-ui/balancer/SwapKind";
import { useNumericInput } from "efi-ui/base/hooks/useNumericInput/useNumericInput";
import { ERC20Shim } from "efi-ui/contracts/ERC20Shim";
import { CryptoAssetPicker } from "efi-ui/crypto/CryptoAssetPicker/CryptoAssetPicker";
import { findAssetIcon } from "efi-ui/crypto/CryptoIcon";
import { useCryptoBalance } from "efi-ui/crypto/hooks/useCryptoBalance/useCryptoBalance";
import { useCryptoDecimals } from "efi-ui/crypto/hooks/useCryptoDecimals/useCryptoDecimals";
import { useCryptoSymbol } from "efi-ui/crypto/hooks/useCryptoSymbol/useCryptoSymbol";
import { PrincipalDiscountPreview } from "efi-ui/earn/EarnCard/PrincipalDiscountPreview";
import { EarnInput } from "efi-ui/earn/EarnInput/EarnInput";
import { EarnTermPicker } from "efi-ui/earn/EarnTermPicker/EarnTermPicker";
import { useActiveTranche } from "efi-ui/earn/hooks/useActiveTranche";
import { usePoolForToken } from "efi-ui/pools/usePoolForToken/usePoolForToken";
import { usePoolPairedToken } from "efi-ui/pools/usePoolPairedToken/usePoolPairedToken";
import { usePoolTokenPrices } from "efi-ui/pools/usePoolTokenPrices/usePoolTokenPrices";
import { usePoolTokens } from "efi-ui/pools/usePoolTokens/usePoolTokens";
import { BuyPrincipalTokensTransactionConfirmationDrawer } from "efi-ui/swaps/BuyPrincipalTokensTransactionConfirmationDrawer/BuyPrincipalTokensTransactionConfirmationDrawer";
import { useTokenDecimals } from "efi-ui/token/hooks/useTokenDecimals";
import { formatBalance } from "efi/base/formatBalance";
import { CryptoAsset } from "efi/crypto/CryptoAsset";
import { parseSortedTokensForPool } from "efi/pools/parseSortedTokensForPool";
import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";
import { useCryptoAssetForToken } from "efi-ui/crypto/hooks/useCryptoAssetForToken";

export interface EarnCardProps {
  library: Web3Provider | undefined;
  account: string | null | undefined;
  chainId: number | undefined;
  walletConnectionActive: boolean;
  connector: AbstractConnector | undefined;
  baseAssets: (CryptoAsset | undefined)[];
  tranchesByBaseAsset: Record<string, Tranche[]>;
}

export function EarnCard({
  library,
  account,
  baseAssets,
  chainId,
  connector,
  walletConnectionActive,
  tranchesByBaseAsset,
}: EarnCardProps): ReactElement {
  // local state
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);

  // base asset
  const { activeBaseAsset, setActiveBaseAsset } = useActiveBaseAsset(
    baseAssets
  );

  // tranche
  const {
    activeTrancheIndex,
    activeTranche,
    availableTranches,
    setActiveTranche,
  } = useActiveTranche(tranchesByBaseAsset, activeBaseAsset);
  const { data: trancheDecimals } = useTokenDecimals(activeTranche);
  const activeBaseAssetSymbol = useCryptoSymbol(activeBaseAsset);
  const activeBaseAssetDecimals = useCryptoDecimals(activeBaseAsset);
  const activeBaseAssetBalance = useCryptoBalance(
    library,
    account,
    activeBaseAsset
  );
  const activeBaseAssetDisplayBalance = formatBalance(
    activeBaseAssetBalance,
    activeBaseAssetDecimals
  );

  const principalTokenAddress = activeTranche?.address;
  const principalTokenAsset = useCryptoAssetForToken(principalTokenAddress);
  const principalTokenDecimals = useCryptoDecimals(principalTokenAsset);
  const principalTokenBalanceOf = useCryptoBalance(
    library,
    account,
    principalTokenAsset
  );
  const principalTokenDisplayBalance = formatBalance(
    principalTokenBalanceOf,
    principalTokenDecimals
  );

  const pool = usePoolForToken(activeTranche as ERC20Shim, jsonRpcProvider);
  const { data: [tokens] = [] } = usePoolTokens(pool);
  const { baseAssetIndex, yieldAssetIndex } = parseSortedTokensForPool(tokens);

  // the tranche's pool
  const baseAssetPoolToken = usePoolPairedToken(
    pool,
    activeTranche as ERC20Shim
  );
  const {
    spotPriceBaseAssetForOneToken: amountOfEthForOnePrincipalEth,
  } = usePoolTokenPrices(pool, baseAssetPoolToken);
  const inputTokenSymbol = useCryptoSymbol(activeBaseAsset);
  const baseAssetIcon = findAssetIcon(inputTokenSymbol);

  const { stringValue: amountIn, setValue: onChangeIn } = useNumericInput();
  const { stringValue: amountOut, setValue: onChangeOut } = useNumericInput();

  const roundedPrincipalPrice = amountOfEthForOnePrincipalEth?.toFixed(4);
  const marketRateLabel = t`1 ${inputTokenSymbol} Principal Token ≈ ${roundedPrincipalPrice} ${activeBaseAssetSymbol}`;

  return (
    <Fragment>
      <Card
        elevation={isDrawerOpen ? Elevation.ZERO : Elevation.TWO}
        className={tw("flex", "flex-col", "p-10", "flex-1", "space-y-10")}
      >
        <div className={tw("flex", "flex-col", "space-y-2")}>
          <div className={tw("flex", "justify-between")}>
            <span
              className={classNames(tw("text-base"), Classes.TEXT_MUTED)}
            >{t`From`}</span>
            {!!account && (
              <span
                className={classNames(tw("text-base"), Classes.TEXT_MUTED)}
              >{t`Balance: ${activeBaseAssetDisplayBalance} ${activeBaseAssetSymbol}`}</span>
            )}
          </div>
          <div
            className={tw(
              "flex",
              "space-x-1",
              "h-24",
              "border",
              "rounded",
              "border-gray-500"
            )}
          >
            <EarnInput
              showMaxButton={!!account}
              assetPicker={
                <CryptoAssetPicker
                  cryptoAssets={baseAssets}
                  activeCryptoAsset={activeBaseAsset}
                  onCryptoAssetChange={setActiveBaseAsset}
                />
              }
              placeholder="0.00"
              value={amountIn}
              onValueChange={onChangeIn}
              assetBalance={+activeBaseAssetDisplayBalance}
              cryptoAddress={baseAssetPoolToken?.address}
              cryptoDecimals={activeBaseAssetDecimals}
              cryptoBalanceOf={activeBaseAssetBalance}
              cryptoDisplayBalance={activeBaseAssetDisplayBalance || ""}
              previewCryptoAddress={principalTokenAddress}
              previewCryptoPoolIndex={yieldAssetIndex}
              pool={pool}
              onPreviewUpdate={onChangeOut}
              swapKind={SwapKind.GIVEN_IN}
            />
          </div>
        </div>
        <div className={tw("flex", "flex-col", "space-y-2")}>
          <div className={tw("flex", "justify-between")}>
            <span
              className={classNames(tw("text-base"), Classes.TEXT_MUTED)}
            >{t`To`}</span>
            <span className={classNames(tw("text-base"), Classes.TEXT_MUTED)}>
              {marketRateLabel}
            </span>
          </div>
          <div
            className={tw(
              "flex",
              "space-x-1",
              "h-24",
              "border",
              "rounded",
              "border-gray-500"
            )}
          >
            <EarnInput
              showMaxButton={false}
              assetPicker={
                <EarnTermPicker
                  library={library}
                  account={account}
                  onTrancheChange={setActiveTranche}
                  baseAsset={activeBaseAsset}
                  tranches={availableTranches}
                  activeTrancheIndex={activeTrancheIndex}
                />
              }
              placeholder="0.00"
              value={amountOut}
              onValueChange={onChangeOut}
              onPreviewUpdate={onChangeIn}
              assetBalance={+activeBaseAssetDisplayBalance}
              cryptoAddress={principalTokenAddress}
              cryptoDecimals={trancheDecimals}
              cryptoBalanceOf={principalTokenBalanceOf}
              cryptoDisplayBalance={principalTokenDisplayBalance}
              previewCryptoAddress={baseAssetPoolToken?.address}
              previewCryptoPoolIndex={baseAssetIndex}
              pool={pool}
              swapKind={SwapKind.GIVEN_OUT}
            />
          </div>
        </div>

        <div className={tw("flex", "space-x-10", "h-24", "mt-10")}>
          <PrincipalDiscountPreview
            amountIn={amountIn}
            baseAssetSymbol={activeBaseAssetSymbol}
            amountOut={amountOut}
          />
          <Button
            large
            outlined
            intent={Intent.PRIMARY}
            className={tw("flex-1")}
            disabled={!amountIn}
            onClick={openDrawer}
          >
            <div className={tw("p-4", "text-lg")}>{t`Buy`}</div>
          </Button>
        </div>
      </Card>

      {!activeBaseAsset ? null : (
        <BuyPrincipalTokensTransactionConfirmationDrawer
          baseAsset={activeBaseAsset}
          baseAssetIcon={baseAssetIcon}
          tranche={activeTranche}
          account={account}
          library={library}
          chainId={chainId}
          pool={pool}
          walletConnectionActive={walletConnectionActive}
          connector={connector}
          amountIn={amountIn}
          isOpen={isDrawerOpen}
          onClose={closeDrawer}
        />
      )}
    </Fragment>
  );
}

function useSetDefaultActiveBaseAsset(
  activeBaseAsset: CryptoAsset | undefined,
  setActiveBaseAsset: (baseAsset: CryptoAsset | undefined) => void,
  defaultBaseAsset: CryptoAsset | undefined
) {
  useEffect(() => {
    if (activeBaseAsset === undefined) {
      setActiveBaseAsset(defaultBaseAsset);
    }
  }, [activeBaseAsset, defaultBaseAsset, setActiveBaseAsset]);
}

function useActiveBaseAsset(allBaseAssets: (CryptoAsset | undefined)[]) {
  const [activeBaseAsset, setActiveBaseAssetState] = useState<
    CryptoAsset | undefined
  >();
  const setActiveBaseAsset = useCallback(
    (baseAsset: CryptoAsset | undefined) => {
      setActiveBaseAssetState(baseAsset);
    },
    []
  );
  // The list of base assets will be empty while the data loads, so we want to
  // set the default after it's been populated
  useSetDefaultActiveBaseAsset(
    activeBaseAsset,
    setActiveBaseAsset,
    allBaseAssets[0]
  );
  return { activeBaseAsset, setActiveBaseAsset };
}
