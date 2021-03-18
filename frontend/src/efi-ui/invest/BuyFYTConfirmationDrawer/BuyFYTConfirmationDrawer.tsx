import React, { FC, useCallback } from "react";
import { useQueryClient } from "react-query";

import { Button, Drawer, Intent } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Web3Provider } from "@ethersproject/providers";
import { formatUnits, parseUnits } from "@ethersproject/units";
import { AbstractConnector } from "@web3-react/abstract-connector";
import classNames from "classnames";
import { ERC20 } from "elf-contracts/types/ERC20";
import { Tranche } from "elf-contracts/types/Tranche";
import { Signer } from "ethers";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { useBalancerVault } from "efi-ui/balancer/useBalancerVault";
import { useBatchSwapGivenIn } from "efi-ui/balancer/useBatchSwapGivenIn";
import { matchSmartContractReadCallQuery } from "efi-ui/contracts/matchSmartContractReadCallQuery/matchSmartContractReadCallQuery";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { useSmartContractTransaction } from "efi-ui/contracts/useSmartContractTransaction/useSmartContractTransaction";
import { CryptoAssetWithIcon } from "efi-ui/crypto/CryptoAssetWithIcon";
import { useCryptoDecimals } from "efi-ui/crypto/hooks/useCryptoDecimals/useCryptoDecimals";
import { useCryptoName } from "efi-ui/crypto/hooks/useCryptoName/useCryptoName";
import { useCryptoSymbol } from "efi-ui/crypto/hooks/useCryptoSymbol/useCryptoSymbol";
import { useOnSwapGivenIn } from "efi-ui/pools/useOnSwapGivenIn/useOnSwapGivenIn";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { convertEpochSecondsToDate } from "efi/base/convertEpochSecondsToDate";
import { formatFullDate } from "efi/base/dates";
import { MAX_ALLOWANCE } from "efi/contracts/token";
import { CryptoAssetType } from "efi/crypto/CryptoAsset";
import { PoolContract } from "efi/pools/PoolContract";

import { isApprovalRequiredForTransactions } from "efi-ui/crypto/isApprovalRequiredForTransactions";
import { TransactionDetailsCallout } from "./TransactionDetailsCallout";
import { WalletApprovalCallout } from "./WalletApprovalCallout";
import { ConnectWalletCalloutWarning } from "./ConnectWalletCalloutWarning";
import { ConnectWalletCallout } from "./ConnectWalletCallout";

interface BuyFYTConfirmationDrawerProps {
  chainId: number | undefined;
  account: string | null | undefined;
  walletConnectionActive: boolean;
  connector: AbstractConnector | undefined;
  library: Web3Provider | undefined;
  pool: PoolContract | undefined;

  amountIn: string | undefined;
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
  tranche,
  amountIn,
  isOpen,
  onClose,
  pool,
}) => {
  const signer = account ? (library?.getSigner(account) as Signer) : undefined;

  let baseAssetContract: ERC20 | undefined;
  if (baseAsset.type === CryptoAssetType.ERC20) {
    baseAssetContract = baseAsset.tokenContract;
  }
  const onApproveClick = useOnApproveClick(baseAssetContract, signer, account);

  const { isDarkMode, darkModeClassName } = useDarkMode();
  const baseAssetName = useCryptoName(baseAsset);
  const baseAssetSymbol = useCryptoSymbol(baseAsset);
  const baseAssetDecimals = useCryptoDecimals(baseAsset);
  const { data: trancheUnlockTimestamp } = useSmartContractReadCall(
    tranche,
    "unlockTimestamp"
  );

  const balancerVault = useBalancerVault();
  const {
    data: marketAllowance,
    isLoading: isMarketAllowanceLoading,
  } = useSmartContractReadCall(baseAssetContract, "allowance", {
    enabled: !!account && !!balancerVault?.address,
    callArgs: [account as string, balancerVault?.address as string],
  });

  const amountAsBigNumber = parseUnits(amountIn || "0", baseAssetDecimals);
  const { data: amountOut } = useOnSwapGivenIn(
    pool,
    baseAssetContract,
    amountAsBigNumber
  );
  const onTransaction = useBatchSwapGivenIn(
    account,
    signer,
    pool,
    baseAssetContract,
    amountAsBigNumber
  );

  const unlockTimeStampDate = convertEpochSecondsToDate(trancheUnlockTimestamp);
  const unlockTimeStampLabel = unlockTimeStampDate
    ? formatFullDate(unlockTimeStampDate)
    : undefined;

  const hasApproval = !!amountIn && marketAllowance?.gte(amountIn);
  const requiresApproval = isApprovalRequiredForTransactions(baseAsset);
  const showApprovalCallout =
    account && !isMarketAllowanceLoading && requiresApproval && !hasApproval;

  const amountOutFormatted = formatUnits(amountOut || 0, baseAssetDecimals);

  const showWalletApprovalButton = account && requiresApproval;
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
      {!account ? (
        <div className={tw("p-4")}>
          <ConnectWalletCallout />
        </div>
      ) : null}

      <div
        className={tw(
          "flex",
          "flex-col",
          "flex-1",
          "p-10",
          "space-y-10",
          "justify-end"
        )}
      >
        <TransactionDetailsCallout
          amountOut={amountOutFormatted}
          assetInIcon={AssetIcon}
          assetOutIcon={null}
          amountIn={amountIn}
        />

        {!account ? <ConnectWalletCalloutWarning /> : null}

        {showApprovalCallout ? (
          <WalletApprovalCallout baseAssetSymbol={baseAssetSymbol} />
        ) : null}

        <div className={tw("flex", "space-x-2")}>
          {showWalletApprovalButton ? (
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
            onClick={onTransaction}
          >{t`Confirm transaction`}</Button>
        </div>
      </div>
    </Drawer>
  );
};

function useOnApproveClick(
  baseAssetContract: ERC20 | undefined,
  signer: Signer | undefined,
  account: string | null | undefined
) {
  const queryClient = useQueryClient();
  const balancerVault = useBalancerVault();
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
              [account as string, balancerVault?.address as string]
            );
            return match;
          },
        });
      },
    }
  );

  const onApproveClick = useCallback(() => {
    if (balancerVault) {
      approve([balancerVault.address, MAX_ALLOWANCE]);
    }
  }, [approve, balancerVault]);
  return onApproveClick;
}
