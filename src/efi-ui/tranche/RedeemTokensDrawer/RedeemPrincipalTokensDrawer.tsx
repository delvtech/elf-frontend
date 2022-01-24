import { ReactElement, useCallback, useEffect, useState } from "react";

import { Button, Callout, Intent, Switch } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { Tranche } from "elf-contracts-typechain/dist/types";
import { BigNumber, Signer } from "ethers";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { PrincipalTokenInfo } from "@elementfi/tokenlist";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { useNumericInput } from "efi-ui/base/hooks/useNumericInput/useNumericInput";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { findAssetIcon } from "efi-ui/crypto/CryptoIcon";
import { useSigner } from "efi-ui/provider/useBlockFromTag/useSigner/useSigner";
import { useTokenBalanceOf } from "efi-ui/token/hooks/useTokenBalanceOf";
import { RedeemForm } from "efi-ui/tranche/RedeemForm/RedeemForm";
import { WalletApprovalCallout } from "efi-ui/transactions/TransactionDrawer/WalletApprovalCallout";
import { useRedeemTermAssetsToEth } from "efi-ui/userProxy/useRedeemTermAssetsToEth";
import { WalletDrawer } from "efi-ui/wallets/WalletDrawer/WalletDrawer";
import ContractAddresses from "efi/addresses/addresses";
import { convertEpochSecondsToDate } from "efi/base/convertEpochSecondsToDate/convertEpochSecondsToDate";
import { formatFullDate } from "efi/base/dates/dates";
import { CryptoAsset, CryptoAssetType } from "efi/crypto/CryptoAsset";
import { getCryptoAssetForToken } from "efi/crypto/getCryptoAssetForToken";
import { getCryptoSymbol } from "efi/crypto/getCryptoSymbol";
import { trancheContractsByAddress } from "efi/tranche/tranches";

import { useWithdrawPrincipal } from "./useWithdrawPrincipal";

const { userProxyContractAddress } = ContractAddresses;
interface RedeemPrincipalTokensDrawerProps {
  account: string | null | undefined;
  library: Web3Provider | undefined;
  baseAsset: CryptoAsset;
  principalTokenInfo: PrincipalTokenInfo;
  userProxyAllowance: string;
  isOpen: boolean;
  onClose: () => void;
}

export function RedeemPrincipalTokensDrawer({
  library,
  account,
  baseAsset,
  principalTokenInfo,
  userProxyAllowance,
  isOpen,
  onClose,
}: RedeemPrincipalTokensDrawerProps): ReactElement {
  const signer = useSigner(account, library);

  // base asset calls
  const baseAssetSymbol = getCryptoSymbol(baseAsset);
  const baseAssetIcon = findAssetIcon(baseAsset);

  // tranche calls
  const { decimals: principalTokenDecimals } = principalTokenInfo;
  const { unlockTimestamp } = principalTokenInfo.extensions;
  const unlockTimestampDate = convertEpochSecondsToDate(unlockTimestamp);
  const unlockTimestampLabel = unlockTimestampDate
    ? formatFullDate(unlockTimestampDate)
    : undefined;

  const { stringValue: principalTokenValue, setValue: setPrincipalTokenValue } =
    useNumericInput({
      min: 0,
      maxPrecision: principalTokenDecimals ?? 18,
    });

  const tranche = trancheContractsByAddress[principalTokenInfo.address];
  const [enoughAllowance, setEnoughAllowance] = useState(!!+userProxyAllowance);
  const [includePermits, setIncludePermits] = useState(true);
  const showPermitCallout =
    !enoughAllowance && baseAsset.type === CryptoAssetType.ETHEREUM;
  const showApprovalCallout = showPermitCallout && !includePermits;
  useEffect(() => {
    if (
      parseUnits(userProxyAllowance || "0").lt(
        parseUnits(principalTokenValue || "0")
      )
    ) {
      setEnoughAllowance(false);
    }
  }, [userProxyAllowance, principalTokenValue]);
  const { data: principalTokenBalanceOf } = useTokenBalanceOf(tranche, account);
  const onSetMaxAmount = useCallback(() => {
    setPrincipalTokenValue(
      formatUnits(principalTokenBalanceOf ?? 0, principalTokenDecimals)
    );
  }, [principalTokenBalanceOf, setPrincipalTokenValue, principalTokenDecimals]);

  const principalTokenValueBN = parseUnits(
    principalTokenValue || "0",
    principalTokenDecimals
  );

  const {
    withdraw: redeemPrincipalTokens,
    isError,
    isLoading,
    reset,
  } = useRedeemPrincipalTokens(
    signer,
    tranche,
    account,
    principalTokenValueBN,
    baseAsset,
    onClose
  );

  const confirmButtonLabel = getConfirmButtonLabel(
    account,
    principalTokenValueBN,
    principalTokenBalanceOf
  );

  const confirmButtonDisabled = getConfirmButtonDisabled(
    account,
    principalTokenValueBN,
    principalTokenBalanceOf,
    enoughAllowance,
    showApprovalCallout
  );

  let buttonIntent = isError ? Intent.DANGER : Intent.PRIMARY;
  if (
    principalTokenBalanceOf &&
    principalTokenValueBN.gt(principalTokenBalanceOf)
  ) {
    buttonIntent = Intent.DANGER;
  }

  const onCloseDrawer = useCallback(() => {
    setPrincipalTokenValue("");
    reset();
    onClose();
  }, [onClose, reset, setPrincipalTokenValue]);

  return (
    <WalletDrawer
      isOpen={isOpen}
      onClose={onCloseDrawer}
      className={tw("justify-between")}
    >
      <div className={tw("flex", "flex-col", "space-y-4")}>
        {showApprovalCallout && (
          <WalletApprovalCallout
            spenderAddress={userProxyContractAddress}
            amount={principalTokenValue || "0"}
            messageRenderer={() =>
              `Approval needed for ${principalTokenInfo.name}`
            }
            signer={signer}
            ownerAddress={account}
            cryptoAsset={getCryptoAssetForToken(principalTokenInfo.address)}
          />
        )}
        {showPermitCallout && (
          <Callout>
            <div>
              <Switch
                label={t`Include pre-approvals with permit data. (Turn this off for ledger)`}
                checked={includePermits}
                onChange={() => setIncludePermits(!includePermits)}
              />
            </div>
          </Callout>
        )}
        <RedeemForm
          onSetMaxAmount={onSetMaxAmount}
          heading={t`Redeem ${baseAssetSymbol} Principal Tokens`}
          tranche={tranche}
          amount={principalTokenValue}
          intent={buttonIntent}
          assetSymbol={t`${baseAssetSymbol} Principal Token`}
          assetIcon={baseAssetIcon}
          onAmountChange={setPrincipalTokenValue}
        >
          <div className={tw("flex", "flex-col", "space-y-6", "items-center")}>
            <LabeledText
              bold
              muted={false}
              containerClassName={tw("justify-center")}
              className={tw("items-center")}
              text={<span>{t`Term date`}</span>}
              label={
                <span className={tw("text-base")}>{unlockTimestampLabel}</span>
              }
            />
          </div>
        </RedeemForm>
        <Button
          fill
          disabled={confirmButtonDisabled}
          intent={buttonIntent}
          loading={isLoading}
          className={tw("h-16")}
          large
          outlined
          onClick={redeemPrincipalTokens}
        >
          {confirmButtonLabel}
        </Button>
      </div>
    </WalletDrawer>
  );
}

function useRedeemPrincipalTokens(
  signer: Signer | undefined,
  tranche: Tranche,
  account: string | null | undefined,
  trancheAmountBigNumber: BigNumber | undefined,
  baseAsset: CryptoAsset,
  onTransactionSubmitted: () => void
): {
  withdraw: () => void;
  reset: () => void;
  isError: boolean;
  isLoading: boolean;
} {
  const withdrawPrincipal = useWithdrawPrincipal(
    signer,
    tranche,
    account,
    trancheAmountBigNumber,
    onTransactionSubmitted
  );

  const withdrawEth = useRedeemTermAssetsToEth(
    signer,
    tranche,
    account,
    trancheAmountBigNumber || BigNumber.from(0),
    BigNumber.from(0),
    onTransactionSubmitted
  );

  if (baseAsset.type === CryptoAssetType.ETHEREUM) {
    return withdrawEth;
  }

  return withdrawPrincipal;
}

function getConfirmButtonLabel(
  account: string | null | undefined,
  amountIn: BigNumber | undefined,
  balanceOf: BigNumber | undefined
) {
  if (!account) {
    return t`Connect your wallet to continue`;
  }

  if (amountIn && balanceOf && amountIn.gt(balanceOf)) {
    return t`Insufficient balance`;
  }

  return t`Confirm transaction`;
}

function getConfirmButtonDisabled(
  account: string | null | undefined,
  amountIn: BigNumber | undefined,
  balanceOf: BigNumber | undefined,
  enoughAllowance: boolean,
  useApprovals: boolean
) {
  // must be connected to click this button
  if (!account) {
    return true;
  }

  // disabled when no amount is entered
  if (!amountIn || !balanceOf) {
    return true;
  }

  if (amountIn.gt(balanceOf)) {
    return true;
  }

  if (!enoughAllowance && useApprovals) {
    return true;
  }

  // otherwise the button should not be disabled
  return false;
}
