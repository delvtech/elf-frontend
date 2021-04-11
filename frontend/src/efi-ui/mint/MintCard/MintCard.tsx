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
import { formatUnits } from "ethers/lib/utils";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { ERC20Shim } from "efi-ui/contracts/ERC20Shim";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { CryptoAssetPicker } from "efi-ui/crypto/CryptoAssetPicker/CryptoAssetPicker";
import { CryptoAssetWithIcon } from "efi-ui/crypto/CryptoAssetWithIcon";
import { useCryptoBalance } from "efi-ui/crypto/hooks/useCryptoBalance/useCryptoBalance";
import { useCryptoDecimals } from "efi-ui/crypto/hooks/useCryptoDecimals/useCryptoDecimals";
import { useCryptoSymbol } from "efi-ui/crypto/hooks/useCryptoSymbol/useCryptoSymbol";
import { EarnInput } from "efi-ui/earn/EarnInput/EarnInput";
import { useActiveTranche } from "efi-ui/earn/hooks/useActiveTranche";
import { PrincipalTokenPreview } from "efi-ui/mint/MintCard/PrincipalTokenPreview";
import { YieldTokenPreview } from "efi-ui/mint/MintCard/YieldTokenPreview";
import { MintTermPicker } from "efi-ui/mint/MintTermPicker/MintTermPicker";
import { usePoolForToken } from "efi-ui/pools/usePoolForToken/usePoolForToken";
import { usePoolPairedToken } from "efi-ui/pools/usePoolPairedToken/usePoolPairedToken";
import { usePoolTokenPrices } from "efi-ui/pools/usePoolTokenPrices/usePoolTokenPrices";
import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";
import { useMintPreview } from "efi-ui/mint/hooks/useMintPreview";
import { MintTransactionConfirmationDrawer } from "efi-ui/mint/MintTransactionConfirmationDrawer/MintTransactionConfirmationDrawer";

export interface MintCardProps {
  library: Web3Provider | undefined;
  account: string | null | undefined;
  chainId: number | undefined;
  walletConnectionActive: boolean;
  connector: AbstractConnector | undefined;
  baseAssets: (CryptoAssetWithIcon | undefined)[];
  tranchesByBaseAsset: Record<string, Tranche[]>;
}

export function MintCard({
  library,
  account,
  baseAssets,
  chainId,
  connector,
  walletConnectionActive,
  tranchesByBaseAsset,
}: MintCardProps): ReactElement {
  // local state
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [amountInString, setAmountIn] = useState<string | undefined>(undefined);
  const amountIn = +(amountInString || 0);

  // active base asset
  const { activeBaseAsset, setActiveBaseAsset } = useActiveBaseAsset(
    baseAssets
  );
  const activeBaseAssetSymbol = useCryptoSymbol(activeBaseAsset);
  const activeBaseAssetDecimals = useCryptoDecimals(activeBaseAsset);
  const activeBaseAssetBalance = useCryptoBalance(
    library,
    account,
    activeBaseAsset
  );

  // active tranche
  const {
    activeTrancheIndex,
    activeTranche,
    availableTranches,
    setActiveTranche,
  } = useActiveTranche(tranchesByBaseAsset, activeBaseAsset);

  const { data: mintPreview } = useMintPreview(
    activeBaseAsset,
    activeTranche,
    amountIn
  );
  const { data: trancheDecimals } = useSmartContractReadCall(
    activeTranche,
    "decimals"
  );
  const numPrincipalTokensOut = mintPreview
    ? +formatUnits(mintPreview, trancheDecimals)
    : undefined;

  // active pool
  const pool = usePoolForToken(activeTranche as ERC20Shim, jsonRpcProvider);
  const poolBaseAssetToken = usePoolPairedToken(
    pool,
    activeTranche as ERC20Shim
  );
  const {
    spotPriceBaseAssetForOneToken: spotPriceBaseAssetForOnePrincipalToken,
  } = usePoolTokenPrices(pool, poolBaseAssetToken);

  // input calculations
  const formattedPrincipalTokenPrice = spotPriceBaseAssetForOnePrincipalToken?.toFixed(
    4
  );

  // TODO: Figure out where to lay these out
  const ptMarketRateLabel = t`Principal Token ≈ ${formattedPrincipalTokenPrice} ${activeBaseAssetSymbol}`;
  const ytMarketRateLabel = t`Yield Token ≈ ${formattedPrincipalTokenPrice} ${activeBaseAssetSymbol}`;

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
              value={amountInString}
              onValueChange={setAmountIn}
              assetBalance={activeBaseAssetBalance}
            />
          </div>
        </div>
        <div className={tw("flex", "flex-col", "space-y-2")}>
          <div className={tw("flex", "justify-between")}>
            <span
              className={classNames(tw("text-base"), Classes.TEXT_MUTED)}
            >{t`Term and Vault`}</span>
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
            <MintTermPicker
              library={library}
              account={account}
              onTrancheChange={setActiveTranche}
              baseAsset={activeBaseAsset}
              tranches={availableTranches}
              activeTrancheIndex={activeTrancheIndex}
            />
          </div>
        </div>

        <div className={tw("flex", "space-x-10", "h-24", "mt-10")}>
          <PrincipalTokenPreview
            amount={numPrincipalTokensOut}
            baseAssetSymbol={activeBaseAssetSymbol}
          />
          <YieldTokenPreview
            amount={amountIn}
            baseAssetSymbol={activeBaseAssetSymbol}
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
        <MintTransactionConfirmationDrawer
          baseAsset={activeBaseAsset}
          tranche={activeTranche}
          account={account}
          library={library}
          chainId={chainId}
          walletConnectionActive={walletConnectionActive}
          connector={connector}
          amountIn={amountInString}
          isOpen={isDrawerOpen}
          onClose={() => setDrawerOpen(false)}
        />
      )}
    </Fragment>
  );
}

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
