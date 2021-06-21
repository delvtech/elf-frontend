import { ReactElement, useCallback } from "react";

import { Button, Intent } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { BigNumber } from "ethers";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { PrincipalTokenInfo } from "tokenlists/types";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { useNumericInput } from "efi-ui/base/hooks/useNumericInput/useNumericInput";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { findAssetIcon2 } from "efi-ui/crypto/CryptoIcon";
import { useSigner } from "efi-ui/provider/useBlockFromTag/useSigner/useSigner";
import { useTokenBalanceOf } from "efi-ui/token/hooks/useTokenBalanceOf";
import { RedeemForm } from "efi-ui/tranche/RedeemForm/RedeemForm";
import { useRedeemTermAssetsToEth } from "efi-ui/userProxy/useRedeemTermAssetsToEth";
import { WalletDrawer } from "efi-ui/wallets/WalletDrawer/WalletDrawer";
import { convertEpochSecondsToDate2 } from "efi/base/convertEpochSecondsToDate";
import { formatFullDate } from "efi/base/dates";
import { CryptoAsset, CryptoAssetType } from "efi/crypto/CryptoAsset";
import { getCryptoSymbol } from "efi/crypto/getCryptoSymbol";
import { trancheContractsByAddress } from "efi/tranche/tranches";

import { useWithdrawPrincipal } from "./useWithdrawPrincipal";

interface RedeemPrincipalTokensDrawerProps {
  account: string | null | undefined;
  library: Web3Provider | undefined;
  baseAsset: CryptoAsset;
  principalTokenInfo: PrincipalTokenInfo;
  isOpen: boolean;
  onClose: () => void;
}

export function RedeemPrincipalTokensDrawer({
  library,
  account,
  baseAsset,
  principalTokenInfo,
  isOpen,
  onClose,
}: RedeemPrincipalTokensDrawerProps): ReactElement {
  const signer = useSigner(account, library);

  // base asset calls
  const baseAssetSymbol = getCryptoSymbol(baseAsset);
  const baseAssetIcon = findAssetIcon2(baseAsset);

  // tranche calls
  const { decimals: principalTokenDecimals } = principalTokenInfo;
  const { unlockTimestamp } = principalTokenInfo.extensions;
  const unlockTimestampDate = convertEpochSecondsToDate2(unlockTimestamp);
  const unlockTimestampLabel = unlockTimestampDate
    ? formatFullDate(unlockTimestampDate)
    : undefined;

  const { stringValue: trancheAmountString, setValue: setTrancheAmountString } =
    useNumericInput({
      min: 0,
      maxPrecision: principalTokenDecimals ?? 18,
    });

  const tranche = trancheContractsByAddress[principalTokenInfo.address];
  const { data: accountTrancheBalance } = useTokenBalanceOf(tranche, account);
  const onSetMaxAmount = useCallback(() => {
    setTrancheAmountString(
      formatUnits(accountTrancheBalance ?? 0, principalTokenDecimals)
    );
  }, [accountTrancheBalance, setTrancheAmountString, principalTokenDecimals]);

  const confirmButtonLabel = getConfirmButtonLabel(account);
  const trancheAmountBigNumber =
    trancheAmountString && principalTokenDecimals
      ? parseUnits(trancheAmountString, principalTokenDecimals)
      : undefined;
  const confirmButtonDisabled = getConfirmButtonDisabled(
    account,
    trancheAmountBigNumber
  );

  const withdrawPrincipal = useWithdrawPrincipal(
    signer,
    tranche,
    account,
    trancheAmountBigNumber
  );

  const withdrawToEth = useRedeemTermAssetsToEth(
    signer,
    tranche,
    account,
    trancheAmountBigNumber || BigNumber.from(0),
    BigNumber.from(0)
  );

  const redeemPrincipalTokens = useCallback(() => {
    if (baseAsset.type === CryptoAssetType.ETHEREUM) {
      withdrawToEth();
    } else {
      withdrawPrincipal();
    }
  }, [baseAsset.type, withdrawPrincipal, withdrawToEth]);

  return (
    <WalletDrawer
      isOpen={isOpen}
      onClose={onClose}
      className={tw("justify-between")}
    >
      <div className={tw("flex", "flex-col", "space-y-4")}>
        <RedeemForm
          onSetMaxAmount={onSetMaxAmount}
          heading={t`Redeem ${baseAssetSymbol} Principal Tokens`}
          tranche={tranche}
          amount={trancheAmountString}
          assetSymbol={t`${baseAssetSymbol} Principal Token`}
          assetIcon={baseAssetIcon}
          onAmountChange={setTrancheAmountString}
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
          intent={Intent.PRIMARY}
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

function getConfirmButtonLabel(account: string | null | undefined) {
  if (!account) {
    return t`Connect your wallet to continue`;
  }

  return t`Confirm transaction`;
}

function getConfirmButtonDisabled(
  account: string | null | undefined,
  amountIn: BigNumber | undefined
) {
  // must be connected to click this button
  if (!account) {
    return true;
  }

  // disabled when no amount is entered
  if (!amountIn) {
    return true;
  }

  // otherwise the button should not be disabled
  return false;
}
