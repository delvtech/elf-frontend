import React, { FC } from "react";

import { Button, Drawer, Intent } from "@blueprintjs/core";
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
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { ERC20Shim } from "efi-ui/contracts/ERC20Shim";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { CryptoAssetWithIcon } from "efi-ui/crypto/CryptoAssetWithIcon";
import { useCryptoDecimals } from "efi-ui/crypto/hooks/useCryptoDecimals/useCryptoDecimals";
import { useCryptoSymbol } from "efi-ui/crypto/hooks/useCryptoSymbol/useCryptoSymbol";
import { TransactionDetailsCallout } from "efi-ui/invest/BuyFYTConfirmationDrawer/TransactionDetailsCallout";
import { useOnSwapGivenIn } from "efi-ui/pools/useOnSwapGivenIn/useOnSwapGivenIn";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { useTokenAllowance } from "efi-ui/token/hooks/useTokenAllowance";
import { convertEpochSecondsToDate } from "efi/base/convertEpochSecondsToDate";
import { formatFullDate } from "efi/base/dates";
import { formatCurrency } from "efi/base/formatCurrency/formatCurrency";
import { isERC20Permit } from "efi/contracts/isERC20Permit";
import { CryptoAssetType, findTokenContract } from "efi/crypto/CryptoAsset";
import { PoolContract } from "efi/pools/PoolContract";

import { ERC20ApproveButton } from "../../token/ERC20ApproveButton/ERC20ApproveButton";
import { ConnectWalletCallout } from "./ConnectWalletCallout";
import { WalletApprovalCallout } from "./WalletApprovalCallout";

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
  const { isDarkMode, darkModeClassName } = useDarkMode();
  const signer = account ? (library?.getSigner(account) as Signer) : undefined;

  // base asset calls
  const baseAssetContract = findTokenContract(baseAsset);
  const baseAssetSymbol = useCryptoSymbol(baseAsset);
  const baseAssetDecimals = useCryptoDecimals(baseAsset);

  // tranche calls
  const { data: trancheDecimals } = useSmartContractReadCall(
    tranche,
    "decimals"
  );
  const { data: trancheUnlockTimestamp } = useSmartContractReadCall(
    tranche,
    "unlockTimestamp"
  );
  const { data: tranchePriceBigNumber } = useOnSwapGivenIn(
    pool,
    tranche as ERC20Shim,
    parseUnits("1", trancheDecimals)
  );
  const tranchePrice = +formatCurrency(tranchePriceBigNumber, trancheDecimals);
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

  const hasApproval =
    !!amountIn && marketAllowance?.gte(parseUnits(amountIn, baseAssetDecimals));

  const amountOutNumber = +formatUnits(amountOut || 0, baseAssetDecimals);
  const amountOutFormatted = amountOutNumber.toFixed(4);

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
        <TransactionDetailsCallout
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
        </TransactionDetailsCallout>

        {
          // we can't pull this out to a new variable because typescript can't
          // narrow the type of baseAssetContract when referencing a variable
          account &&
          baseAsset.type !== CryptoAssetType.ETHEREUM &&
          !isERC20Permit(baseAssetContract) ? (
            <WalletApprovalCallout
              account={account}
              contract={baseAssetContract}
              approvalAmount={amountAsBigNumber}
            />
          ) : null
        }

        <div className={tw("flex", "space-x-2")}>
          {
            // we can't pull this out to a new variable because typescript can't
            // narrow the type of baseAssetContract when referencing a variable
            account &&
            baseAsset.type !== CryptoAssetType.ETHEREUM &&
            !isERC20Permit(baseAssetContract) ? (
              <ERC20ApproveButton
                owner={account}
                spender={balancerVault?.address}
                approvalAmount={amountAsBigNumber}
                contract={baseAssetContract}
                signer={signer}
              />
            ) : null
          }

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
