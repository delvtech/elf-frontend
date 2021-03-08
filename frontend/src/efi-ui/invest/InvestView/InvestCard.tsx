import React, { FC, Fragment, useState } from "react";

import { Button, Callout, Card, Intent } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { formatUnits, parseUnits } from "@ethersproject/units";
import { AbstractConnector } from "@web3-react/abstract-connector";
import { ERC20, WETH, WETH__factory } from "elf-contracts/types";
import { Tranche } from "elf-contracts/types/Tranche";
import { BigNumber } from "ethers";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { getQueryData } from "efi-ui/base/queryResults";
import { useSmartContractFromFactory } from "efi-ui/contracts/useSmartContractFromFactory/useSmartContractFromFactory";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { CryptoAssetWithIcon } from "efi-ui/crypto/CryptoAssetWithIcon";
import { useCryptoBalance } from "efi-ui/crypto/hooks/useCryptoBalance/useCryptoBalance";
import { useCryptoDecimals } from "efi-ui/crypto/hooks/useCryptoDecimals/useCryptoDecimals";
import { useCryptoSymbol } from "efi-ui/crypto/hooks/useCryptoSymbol/useCryptoSymbol";
import { BaseAssetPicker } from "efi-ui/invest/BaseAssetPicker/BaseAssetPicker";
import { BuyFYTConfirmationDrawer } from "efi-ui/invest/BuyFYTConfirmationDrawer/BuyFYTConfirmationDrawer";
import { useActiveTranche } from "efi-ui/invest/hooks/useActiveTranche";
import { TranchePicker } from "efi-ui/invest/TranchePicker/TranchePicker";
import { useOnSwapGivenIn } from "efi-ui/pools/useOnSwapGivenIn/useOnSwapGivenIn";
import { usePoolForToken } from "efi-ui/pools/usePoolForToken/usePoolForToken";
import { convertEpochSecondsToDate } from "efi/base/convertEpochSecondsToDate";
import { formatCurrency } from "efi/base/formatCurrency/formatCurrency";
import ContractAddresses from "efi/contracts/contractsJson";
import { CryptoAssetType } from "efi/crypto/CryptoAsset";
import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";
import { calculateTrancheAPY } from "efi/tranche/calculateTrancheAPY";

import { InvestmentAmountInput } from "./InvestmentAmountInput";

export interface InvestCardProps {
  library: Web3Provider | undefined;
  account: string | null | undefined;

  chainId: number | undefined;
  walletConnectionActive: boolean;
  connector: AbstractConnector | undefined;
  baseAssets: CryptoAssetWithIcon[];

  tranchesByBaseAsset: Record<string, Tranche[]>;
}

export const InvestCard: FC<InvestCardProps> = ({
  library,
  account,
  baseAssets,
  chainId,
  connector,
  walletConnectionActive,
  tranchesByBaseAsset,
}) => {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [amountIn, setAmountIn] = useState<string | undefined>();

  const [activeBaseAsset, setActiveBaseAsset] = useState(baseAssets[0]);
  const activeBaseAssetSymbol = useCryptoSymbol(activeBaseAsset);
  const activeBaseAssetDecimals = useCryptoDecimals(activeBaseAsset);
  const activeBaseAssetBalance = useCryptoBalance(
    library,
    account,
    activeBaseAsset
  );

  const {
    activeTrancheIndex,
    activeTranche,
    availableTranches,
    setActiveTranche,
  } = useActiveTranche(tranchesByBaseAsset, activeBaseAsset);

  const unlockTimestampResult = useSmartContractReadCall(
    activeTranche,
    "unlockTimestamp"
  );
  const trancheDecimalsResult = useSmartContractReadCall(
    activeTranche,
    "decimals"
  );
  const poolContract = usePoolForToken(activeTranche, jsonRpcProvider);
  const tranchePriceResult = useOnSwapGivenIn(
    poolContract,
    activeTranche,
    BigNumber.from(1)
  );

  const wethContract = useSmartContractFromFactory(
    ContractAddresses.wethAddress,
    WETH__factory.connect
  );
  let inputTokenContract: WETH | ERC20 | undefined = wethContract;
  if (activeBaseAsset.type === CryptoAssetType.ERC20) {
    inputTokenContract = activeBaseAsset.tokenContract;
  }

  const amountInAsBigNumber = amountIn
    ? parseUnits(amountIn, activeBaseAssetDecimals)
    : undefined;

  const { data: amountOut } = useOnSwapGivenIn(
    poolContract,
    inputTokenContract,
    amountInAsBigNumber
  );

  const tranchePriceBigNumber = getQueryData(tranchePriceResult);
  const tranchePrice = +formatCurrency(
    tranchePriceBigNumber,
    getQueryData(trancheDecimalsResult)
  );

  const trancheAPY = formatTrancheAPY(
    getQueryData(unlockTimestampResult),
    tranchePrice
  );

  return (
    <Fragment>
      <Card className={tw("flex", "flex-col", "p-10", "space-y-10", "flex-1")}>
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
          <InvestmentAmountInput
            showMaxButton={!!account}
            baseAssetPicker={
              <BaseAssetPicker
                baseAssets={baseAssets}
                activeBaseAsset={activeBaseAsset}
                onBaseAssetChange={setActiveBaseAsset}
              />
            }
            placeholder="0.00"
            value={amountIn}
            onValueChange={setAmountIn}
            assetBalance={activeBaseAssetBalance}
          />
        </div>

        <div className={tw("flex", "space-x-10")}>
          <TranchePicker
            onTrancheChange={setActiveTranche}
            tranches={availableTranches}
            activeTrancheIndex={activeTrancheIndex}
          />
          <Button
            large
            outlined
            intent={Intent.PRIMARY}
            className={tw("w-1/3")}
            disabled={!amountIn}
            onClick={() => setDrawerOpen(true)}
          >
            <div className={tw("p-4", "text-lg")}>{t`Buy`}</div>
          </Button>
        </div>

        {!!amountIn && (
          <Callout icon={null} intent={Intent.SUCCESS} className={tw("p-6")}>
            <div
              className={tw("flex", "w-full", "space-x-4", "justify-between")}
            >
              <div
                className={tw("flex", "space-x-4", "items-center", "text-lg")}
              >
                <LabeledText
                  text={t`${trancheAPY.toFixed(2)}%`}
                  label={
                    <div className={tw("flex", "justify-center")}>
                      <span>{t`Estimated yield`}</span>
                    </div>
                  }
                />
              </div>
              <div
                className={tw("flex", "space-x-4", "items-center", "text-lg")}
              >
                <LabeledText
                  text={`${(+formatUnits(
                    amountOut || 0,
                    activeBaseAssetDecimals
                  )).toFixed(6)} ${activeBaseAssetSymbol}`}
                  label={"Redeemable at maturity"}
                />
              </div>
            </div>
          </Callout>
        )}
      </Card>

      <BuyFYTConfirmationDrawer
        account={account}
        library={library}
        chainId={chainId}
        pool={poolContract}
        walletConnectionActive={walletConnectionActive}
        connector={connector}
        baseAsset={activeBaseAsset}
        amount={amountInAsBigNumber}
        tranche={activeTranche}
        isOpen={isDrawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </Fragment>
  );
};

function formatTrancheAPY(
  unlockTimestamp: BigNumber | undefined,
  tranchePrice: number
): number {
  let trancheAPY = 0;
  const unlockDate = convertEpochSecondsToDate(unlockTimestamp);
  if (tranchePrice && unlockDate) {
    trancheAPY = calculateTrancheAPY(
      tranchePrice,
      Date.now(),
      unlockDate.getTime()
    );
  }
  return trancheAPY;
}
