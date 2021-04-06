import React, { FC, Fragment, useCallback, useEffect, useState } from "react";

import { Button, Card, Classes, Elevation, Intent } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { AbstractConnector } from "@web3-react/abstract-connector";
import classNames from "classnames";
import { Tranche } from "elf-contracts/types/Tranche";
import { parseUnits } from "ethers/lib/utils";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { useBalancerTransactionInputs } from "efi-ui/balancer/useBalancerTransactionInputs";
import { ERC20Shim } from "efi-ui/contracts/ERC20Shim";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { CryptoAssetPicker } from "efi-ui/crypto/CryptoAssetPicker/CryptoAssetPicker";
import { CryptoAssetWithIcon } from "efi-ui/crypto/CryptoAssetWithIcon";
import { useCryptoBalance } from "efi-ui/crypto/hooks/useCryptoBalance/useCryptoBalance";
import { useCryptoDecimals } from "efi-ui/crypto/hooks/useCryptoDecimals/useCryptoDecimals";
import { useCryptoSymbol } from "efi-ui/crypto/hooks/useCryptoSymbol/useCryptoSymbol";
import { PrincipalDiscountPreview } from "efi-ui/earn/EarnCard/PrincipalDiscountPreview";
import { EarnInput } from "efi-ui/earn/EarnInput/EarnInput";
import { useActiveTranche } from "efi-ui/earn/hooks/useActiveTranche";
import { TranchePicker } from "efi-ui/earn/TranchePicker/TranchePicker";
import { usePoolForToken } from "efi-ui/pools/usePoolForToken/usePoolForToken";
import { usePoolPairedToken } from "efi-ui/pools/usePoolPairedToken/usePoolPairedToken";
import { usePoolTokenPrices } from "efi-ui/pools/usePoolTokenPrices/usePoolTokenPrices";
import { getTokenAddressForBalancer } from "efi-ui/swaps/getTokenAddressForBalancer";
import { BuyPrincipalTokensTransactionConfirmationDrawer } from "efi-ui/tranche/BuyPrincipalTokensTransactionConfirmationDrawer/BuyPrincipalTokensTransactionConfirmationDrawer";
import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";
import { PrincipalTokenPreview } from "efi-ui/mint/MintCard/PrincipalTokenPreview";
import { YieldTokenPreview } from "efi-ui/mint/MintCard/YieldTokenPreview";

export interface MintCardProps {
  library: Web3Provider | undefined;
  account: string | null | undefined;
  chainId: number | undefined;
  walletConnectionActive: boolean;
  connector: AbstractConnector | undefined;
  baseAssets: (CryptoAssetWithIcon | undefined)[];
  tranchesByBaseAsset: Record<string, Tranche[]>;
}

export const MintCard: FC<MintCardProps> = ({
  library,
  account,
  baseAssets,
  chainId,
  connector,
  walletConnectionActive,
  tranchesByBaseAsset,
}) => {
  // local state
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  // base asset
  const { activeBaseAsset, setActiveBaseAsset } = useActiveBaseAsset(
    baseAssets
  );
  const tokenInAddress = getTokenAddressForBalancer(activeBaseAsset);

  // tranche
  const {
    activeTrancheIndex,
    activeTranche,
    availableTranches,
    setActiveTranche,
  } = useActiveTranche(tranchesByBaseAsset, activeBaseAsset);
  const { data: trancheDecimals } = useSmartContractReadCall(
    activeTranche,
    "decimals"
  );
  const activeBaseAssetSymbol = useCryptoSymbol(activeBaseAsset);
  const activeBaseAssetDecimals = useCryptoDecimals(activeBaseAsset);
  const activeBaseAssetBalance = useCryptoBalance(
    library,
    account,
    activeBaseAsset
  );
  const tokenOutAddress = activeTranche?.address;

  const pool = usePoolForToken(activeTranche as ERC20Shim, jsonRpcProvider);

  const {
    amountIn,
    amountOut,
    onAmountOutChange,
    onAmountInChange,
  } = useBalancerTransactionInputs(
    pool,
    tokenInAddress,
    activeBaseAssetDecimals,
    tokenOutAddress,
    trancheDecimals
  );

  // the tranche's pool
  const baseAssetPoolToken = usePoolPairedToken(
    pool,
    activeTranche as ERC20Shim
  );
  const {
    spotPriceBaseAssetForOneToken: amountOfEthForOneTranche,
  } = usePoolTokenPrices(pool, baseAssetPoolToken);
  const inputTokenSymbol = useCryptoSymbol(activeBaseAsset);

  // input calculations
  const amountInAsBigNumber = amountIn
    ? parseUnits(amountIn, activeBaseAssetDecimals)
    : undefined;

  const amountOutAsBigNumber = amountOut
    ? parseUnits(amountOut, trancheDecimals)
    : undefined;

  const roundedTranchePrice = amountOfEthForOneTranche?.toFixed(4);
  const marketRateLabel = t`1 ${inputTokenSymbol} Principal Token ≈ ${roundedTranchePrice} ${activeBaseAssetSymbol}`;

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
            >{t`Term and Vault`}</span>
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
                <TranchePicker
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
              onValueChange={onAmountOutChange}
              assetBalance={activeBaseAssetBalance}
            />
          </div>
        </div>
        <div className={tw("flex", "flex-col", "space-y-2")}>
          <div className={tw("flex", "justify-between")}>
            <span
              className={classNames(tw("text-base"), Classes.TEXT_MUTED)}
            >{t`Deposit`}</span>
            {!!account && (
              <span
                className={classNames(tw("text-base"), Classes.TEXT_MUTED)}
              >{t`Balance: ${activeBaseAssetBalance.toFixed(
                4
              )} ${activeBaseAssetSymbol}`}</span>
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
              onValueChange={onAmountInChange}
              assetBalance={activeBaseAssetBalance}
            />
          </div>
        </div>

        <div className={tw("flex", "space-x-10", "h-24", "mt-10")}>
          <PrincipalTokenPreview
            amountIn={amountInAsBigNumber}
            baseAssetSymbol={activeBaseAssetSymbol}
            amountOut={amountOutAsBigNumber}
            baseAssetDecimals={activeBaseAssetDecimals}
          />
          <YieldTokenPreview
            amountIn={amountInAsBigNumber}
            baseAssetSymbol={activeBaseAssetSymbol}
            amountOut={amountOutAsBigNumber}
            baseAssetDecimals={activeBaseAssetDecimals}
          />
        </div>
        <Button
          large
          outlined
          intent={Intent.PRIMARY}
          className={tw("flex-1")}
          disabled={!amountIn}
          onClick={() => setDrawerOpen(true)}
        >
          <div className={tw("p-4", "text-lg")}>{t`Mint`}</div>
        </Button>
      </Card>

      {!activeBaseAsset ? null : (
        <BuyPrincipalTokensTransactionConfirmationDrawer
          baseAsset={activeBaseAsset}
          tranche={activeTranche}
          account={account}
          library={library}
          chainId={chainId}
          pool={pool}
          walletConnectionActive={walletConnectionActive}
          connector={connector}
          amountIn={amountIn}
          isOpen={isDrawerOpen}
          onClose={() => setDrawerOpen(false)}
        />
      )}
    </Fragment>
  );
};

function useSetDefaultActiveBaseAsset(
  activeBaseAsset: CryptoAssetWithIcon | undefined,
  setActiveBaseAsset: (baseAsset: CryptoAssetWithIcon | undefined) => void,
  defaultBaseAsset: CryptoAssetWithIcon | undefined
) {
  useEffect(() => {
    if (activeBaseAsset === undefined) {
      setActiveBaseAsset(defaultBaseAsset);
    }
  }, [activeBaseAsset, defaultBaseAsset, setActiveBaseAsset]);
}

function useActiveBaseAsset(
  allBaseAssets: (CryptoAssetWithIcon | undefined)[]
) {
  const [activeBaseAsset, setActiveBaseAssetState] = useState<
    CryptoAssetWithIcon | undefined
  >();
  const setActiveBaseAsset = useCallback(
    (baseAsset: CryptoAssetWithIcon | undefined) => {
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
