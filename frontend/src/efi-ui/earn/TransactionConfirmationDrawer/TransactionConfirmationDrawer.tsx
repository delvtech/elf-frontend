import React, { FC } from "react";

import { Button, Drawer, Intent } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { formatUnits, parseUnits } from "@ethersproject/units";
import { AbstractConnector } from "@web3-react/abstract-connector";
import classNames from "classnames";
import { ERC20 } from "elf-contracts/types/ERC20";
import { Tranche } from "elf-contracts/types/Tranche";
import { BigNumber, Signer } from "ethers";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { SwapKind } from "efi-ui/balancer/SwapKind";
import { useBalancerVault } from "efi-ui/balancer/useBalancerVault";
import { useBatchSwapGivenIn } from "efi-ui/balancer/useBatchSwapGivenIn/useBatchSwapGivenIn";
import { parseQueryBatchSwapResult } from "efi-ui/balancer/useQueryBatchSwap/parseQueryBatchSwapResult";
import { useQueryBatchSwap } from "efi-ui/balancer/useQueryBatchSwap/useQueryBatchSwap";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { ERC20Shim } from "efi-ui/contracts/ERC20Shim";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { CryptoAssetWithIcon } from "efi-ui/crypto/CryptoAssetWithIcon";
import { useCryptoDecimals } from "efi-ui/crypto/hooks/useCryptoDecimals/useCryptoDecimals";
import { useCryptoSymbol } from "efi-ui/crypto/hooks/useCryptoSymbol/useCryptoSymbol";
import { TransactionDetailsPreview } from "efi-ui/earn/TransactionDetailsPreview/TransactionDetailsCallout";
import { usePoolSpotPrice } from "efi-ui/pools/usePoolSpotPrice/usePoolSpotPrice";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { getTokenAddressForBalancer } from "efi-ui/swaps/getTokenAddressForBalancer";
import { ERC20ApproveButton } from "efi-ui/token/ERC20ApproveButton/ERC20ApproveButton";
import { useTokenAllowance } from "efi-ui/token/hooks/useTokenAllowance";
import { convertEpochSecondsToDate } from "efi/base/convertEpochSecondsToDate";
import { formatFullDate } from "efi/base/dates";
import {
  CryptoAsset,
  CryptoAssetType,
  findTokenContract,
} from "efi/crypto/CryptoAsset";
import { PoolContract } from "efi/pools/PoolContract";

import { ConnectWalletCallout } from "./ConnectWalletCallout";
import { WalletApprovalCallout } from "./WalletApprovalCallout";

interface TransactionConfirmationDrawerProps {
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

/**
 * Generalize this further to handle any transaction confirmation
 */
export const TransactionConfirmationDrawer: FC<TransactionConfirmationDrawerProps> = ({
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
  const { isDarkMode, darkModeClassName } = useDarkMode();
  const signer = account ? (library?.getSigner(account) as Signer) : undefined;

  // base asset calls
  const baseAssetContract = findTokenContract(baseAsset);
  const baseAssetSymbol = useCryptoSymbol(baseAsset);
  const baseAssetDecimals = useCryptoDecimals(baseAsset);

  // tranche calls
  const { data: trancheUnlockTimestamp } = useSmartContractReadCall(
    tranche,
    "unlockTimestamp"
  );
  const tranchePrice = usePoolSpotPrice(pool, tranche as ERC20Shim);
  const roundedTranchePrice = tranchePrice.toFixed(4);

  // vault calls
  const balancerVault = useBalancerVault();
  const { data: marketAllowance } = useTokenAllowance(
    baseAssetContract as ERC20,
    account,
    balancerVault?.address
  );

  // pool calls
  const amountAsBigNumber = parseUnits(amountIn || "0", baseAssetDecimals);
  const tokenInAddress = getTokenAddressForBalancer(baseAsset);
  const tokenOutAddress = tranche?.address;
  const { data: queryBatchSwapInResult = [] } = useQueryBatchSwap(
    SwapKind.GIVEN_IN,
    pool,
    tokenInAddress,
    tokenOutAddress,
    amountAsBigNumber
  );
  const { tokenOut: amountOut } = parseQueryBatchSwapResult(
    tokenInAddress,
    tokenOutAddress,
    queryBatchSwapInResult
  );

  const onTransaction = useBatchSwapGivenIn(
    account,
    signer,
    pool,
    tokenInAddress,
    tranche?.address,
    amountAsBigNumber
  );

  const unlockTimeStampDate = convertEpochSecondsToDate(trancheUnlockTimestamp);
  const unlockTimeStampLabel = unlockTimeStampDate
    ? formatFullDate(unlockTimeStampDate)
    : undefined;

  const amountOutNumber = +formatUnits(
    amountOut?.abs() || 0,
    baseAssetDecimals
  );
  const amountOutFormatted = amountOutNumber.toFixed(4);

  const confirmButtonDisabled = getConfirmButtonDisabled(
    account,
    baseAsset,
    amountAsBigNumber,
    marketAllowance
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      size={500}
      style={!isDarkMode ? { background: "var(--bp3-bg-color)" } : {}}
      className={classNames(
        darkModeClassName,
        tw("flex", "flex-col", "text-base", "overflow-scroll", {
          "text-gray-700": !isDarkMode,
          "text-white": isDarkMode,
        })
      )}
    >
      {!account ? (
        <div className={tw("p-10")}>
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
        <TransactionDetailsPreview
          amountIn={amountIn}
          amountOut={amountOutFormatted}
          assetInIcon={AssetIcon}
          assetInSymbol={baseAssetSymbol}
          assetOutSymbol={`${baseAssetSymbol} Principal Token`}
          assetOutIcon={null}
        >
          <div className={tw("flex", "flex-col", "space-y-6")}>
            <LabeledText
              muted={false}
              text={<span>{t`Market rate`}</span>}
              label={
                <span
                  className={tw("text-base")}
                >{t`1 Principal Token ≈ ${roundedTranchePrice} ${baseAssetSymbol}`}</span>
              }
            />
            <LabeledText
              muted={false}
              text={<span>{t`Term date`}</span>}
              label={
                <span className={tw("text-base")}>{unlockTimeStampLabel}</span>
              }
            />
          </div>
        </TransactionDetailsPreview>

        {
          // we can't pull this out to a new variable because typescript can't
          // narrow the type of baseAssetContract when referencing a variable
          account && baseAsset.type !== CryptoAssetType.ETHEREUM ? (
            <WalletApprovalCallout
              account={account}
              contract={baseAssetContract as ERC20Shim}
              approvalAmount={amountAsBigNumber}
            />
          ) : null
        }

        <div className={tw("flex", "space-x-2")}>
          {
            // we can't pull this out to a new variable because typescript can't
            // narrow the type of baseAssetContract when referencing a variable
            account && baseAsset.type !== CryptoAssetType.ETHEREUM ? (
              <ERC20ApproveButton
                owner={account}
                spender={balancerVault?.address}
                approvalAmount={amountAsBigNumber}
                contract={baseAssetContract as ERC20Shim}
                signer={signer}
              />
            ) : null
          }

          <Button
            fill
            disabled={confirmButtonDisabled}
            intent={Intent.PRIMARY}
            large
            outlined
            onClick={onTransaction}
          >{t`Confirm transaction`}</Button>
        </div>
      </div>
    </Drawer>
  );
};

function getConfirmButtonDisabled(
  account: string | null | undefined,
  baseAsset: CryptoAsset,
  amountIn: BigNumber | undefined,
  marketAllowance: BigNumber | undefined
) {
  // must be connected to click this button
  if (!account) {
    return true;
  }

  // disabled when no amount is entered
  if (!amountIn) {
    return true;
  }

  // disabled if it's an erc20 w/out enough allowance
  if (baseAsset.type === CryptoAssetType.ERC20) {
    const hasEnoughAllowance = marketAllowance?.lt(amountIn);
    if (!hasEnoughAllowance) {
      return true;
    }
  }

  // otherwise the button should not be disabled
  return false;
}
