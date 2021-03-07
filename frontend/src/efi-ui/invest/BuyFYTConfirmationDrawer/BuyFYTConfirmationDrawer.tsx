import React, { FC, useCallback } from "react";
import { useQueryClient } from "react-query";

import {
  Button,
  Callout,
  Classes,
  Divider,
  Drawer,
  Intent,
} from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Web3Provider } from "@ethersproject/providers";
import { AbstractConnector } from "@web3-react/abstract-connector";
import classNames from "classnames";
import { BPool, ERC20 } from "elf-contracts/types";
import { Tranche } from "elf-contracts/types/Tranche";
import { BigNumber, Signer } from "ethers";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { matchSmartContractReadCallQuery } from "efi-ui/contracts/matchSmartContractReadCallQuery/matchSmartContractReadCallQuery";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { useSmartContractTransaction } from "efi-ui/contracts/useSmartContractTransaction/useSmartContractTransaction";
import { CryptoAssetWithIcon } from "efi-ui/crypto/CryptoAssetWithIcon";
import { useCryptoName } from "efi-ui/crypto/hooks/useCryptoName/useCryptoName";
import { useCryptoSymbol } from "efi-ui/crypto/hooks/useCryptoSymbol/useCryptoSymbol";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { WalletConnectionCard } from "efi-ui/wallets/WalletConnectionCard/WalletConnectionCard";
import { convertEpochSecondsToDate } from "efi/base/convertEpochSecondsToDate";
import { formatFullDate } from "efi/base/dates";
import { MAX_ALLOWANCE } from "efi/contracts/token";
import { CryptoAssetType } from "efi/crypto/CryptoAsset";
import { getConnectorName } from "efi/wallets/connectors";

import { isApprovalRequiredForTransactions } from "../../crypto/isApprovalRequiredForTransactions";
import { PoolContract } from "efi/pools/PoolContract";

interface BuyFYTConfirmationDrawerProps {
  chainId: number | undefined;
  account: string | null | undefined;
  walletConnectionActive: boolean;
  connector: AbstractConnector | undefined;
  library: Web3Provider | undefined;
  /**
   * @deprecated use pool instead
   */
  market?: BPool | undefined;
  pool: PoolContract | undefined;

  amount: BigNumber | undefined;
  baseAsset: CryptoAssetWithIcon;

  tranche: Tranche | undefined;
  isOpen: boolean;
  onClose: () => void;
}

export const BuyFYTConfirmationDrawer: FC<BuyFYTConfirmationDrawerProps> = ({
  connector,
  walletConnectionActive,
  library,
  chainId,
  account,
  baseAsset: { assetIcon: AssetIcon },
  baseAsset,
  market,
  tranche,
  amount,
  isOpen,
  onClose,
}) => {
  let baseAssetContract: ERC20 | undefined;
  if (baseAsset.type === CryptoAssetType.ERC20) {
    baseAssetContract = baseAsset.tokenContract;
  }

  const signer = account ? (library?.getSigner(account) as Signer) : undefined;
  const onApproveClick = useOnApproveClick(
    baseAssetContract,
    signer,
    account,
    market
  );

  const { isDarkMode, darkModeClassName } = useDarkMode();
  const baseAssetName = useCryptoName(baseAsset);
  const baseAssetSymbol = useCryptoSymbol(baseAsset);
  const { data: trancheUnlockTimestamp } = useSmartContractReadCall(
    tranche,
    "unlockTimestamp"
  );

  const {
    data: marketAllowance,
    isLoading: isMarketAllowanceLoading,
  } = useSmartContractReadCall(baseAssetContract, "allowance", {
    enabled: !!account && !!market?.address,
    callArgs: [account as string, market?.address as string],
  });

  const connectorName = getConnectorName(connector, library);

  const unlockTimeStampDate = convertEpochSecondsToDate(trancheUnlockTimestamp);
  const unlockTimeStampLabel = unlockTimeStampDate
    ? formatFullDate(unlockTimeStampDate)
    : undefined;

  const hasApproval = amount && marketAllowance?.gte(amount);
  const requiresApproval = isApprovalRequiredForTransactions(baseAsset);
  const showApprovalCallout =
    account && !isMarketAllowanceLoading && requiresApproval && !hasApproval;

  const redeemableQuantity = 444;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      size={500}
      style={!isDarkMode ? { background: "var(--bp3-bg-color)" } : {}}
      className={classNames(
        darkModeClassName,
        tw("flex", "flex-col", "text-base", {
          "text-gray-700": !isDarkMode,
          "text-white": isDarkMode,
        })
      )}
    >
      <WalletConnectionCard
        active={walletConnectionActive}
        connectorName={connectorName}
        account={account}
        chainId={chainId}
      />
      <div className={tw("flex", "flex-col", "flex-1", "p-10", "space-y-10")}>
        <div className={tw("flex", "flex-col", "space-y-16")}>
          <div className={tw("flex", "flex-col", "space-y-10")}>
            <span
              className={tw("text-lg")}
            >{t`Investing an initial amount of:`}</span>
            <div className={tw("grid", "w-full", "grid-cols-2", "ml-8")}>
              <div
                className={classNames(
                  tw("flex", "items-center", "font-semibold"),
                  "h3"
                )}
              >{t`${amount}`}</div>
              <LabeledText
                iconClassName={tw("mr-4")}
                icon={<AssetIcon height={42} width={42} />}
                text={baseAssetSymbol}
                label={baseAssetName}
              />
            </div>
          </div>
          <div className={tw("flex", "flex-col", "space-y-10")}>
            <span
              className={classNames(tw("text-lg"), Classes.RUNNING_TEXT)}
            >{t`Will be redeemable on ${unlockTimeStampLabel} for:`}</span>

            <div className={tw("grid", "w-full", "grid-cols-2", "ml-8")}>
              <div
                className={classNames(
                  tw("flex", "items-center", "font-semibold"),
                  "h3"
                )}
              >{t`${redeemableQuantity.toFixed(9)}`}</div>
              <LabeledText
                iconClassName={tw("mr-4")}
                icon={<AssetIcon height={42} width={42} />}
                text={baseAssetSymbol}
                label={baseAssetName}
              />
            </div>
          </div>
        </div>

        <Divider />

        {showApprovalCallout ? (
          <Callout
            intent={Intent.WARNING}
            title={t`Wallet approval required`}
            icon={null}
            className={tw("p-4")}
          >
            <div
              className={"pt-1"}
            >{t`Element uses Balancer Pools for trading. You'll need to grant Balancer approval to spend your ${baseAssetSymbol} in order to swap for FYTs.`}</div>
          </Callout>
        ) : null}
        <div className={tw("flex", "space-x-2")}>
          {account && requiresApproval ? (
            <Button
              fill
              large
              outlined
              icon={hasApproval ? IconNames.TICK : null}
              disabled={hasApproval}
              intent={hasApproval ? Intent.SUCCESS : Intent.PRIMARY}
              onClick={onApproveClick}
            >
              {hasApproval
                ? t`${baseAssetSymbol} approved`
                : t`Approve ${baseAssetSymbol}`}
            </Button>
          ) : null}
          <Button
            fill
            disabled={!hasApproval}
            intent={hasApproval ? Intent.PRIMARY : Intent.NONE}
            large
            outlined
            onClick={onClose}
          >{t`Confirm transaction`}</Button>
        </div>
      </div>
    </Drawer>
  );
};

function useOnApproveClick(
  baseAssetContract: ERC20 | undefined,
  signer: Signer | undefined,
  account: string | null | undefined,
  market: BPool | undefined
) {
  const queryClient = useQueryClient();
  const { mutate: approve } = useSmartContractTransaction(
    baseAssetContract,
    "approve",
    signer,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          predicate: (query) => {
            const match = matchSmartContractReadCallQuery(
              query,
              baseAssetContract,
              "allowance",
              [account as string, market?.address as string]
            );
            return match;
          },
        });
      },
    }
  );

  const onApproveClick = useCallback(() => {
    if (market) {
      approve([market.address, MAX_ALLOWANCE]);
    }
  }, [approve, market]);
  return onApproveClick;
}
