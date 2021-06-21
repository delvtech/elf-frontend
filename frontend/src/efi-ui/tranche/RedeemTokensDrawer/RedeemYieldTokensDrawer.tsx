import { ReactElement, useCallback } from "react";

import { Button, Intent } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { Tranche } from "elf-contracts/types";
import { BigNumber, Signer } from "ethers";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import {
  PrincipalTokenInfo as TrancheInfo,
  YieldTokenInfo,
} from "tokenlists/types";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { useNumericInput } from "efi-ui/base/hooks/useNumericInput/useNumericInput";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { useSigner } from "efi-ui/provider/useBlockFromTag/useSigner/useSigner";
import { useTokenBalanceOf } from "efi-ui/token/hooks/useTokenBalanceOf";
import { RedeemForm } from "efi-ui/tranche/RedeemForm/RedeemForm";
import { useWithdrawInterest } from "efi-ui/tranche/RedeemTokensDrawer/useWithdrawInterest";
import { useInterestTokenForTranche } from "efi-ui/tranche/useTrancheInterestTokenMulti";
import { useRedeemTermAssetsToEth } from "efi-ui/userProxy/useRedeemTermAssetsToEth";
import { WalletDrawer } from "efi-ui/wallets/WalletDrawer/WalletDrawer";
import { convertEpochSecondsToDate2 } from "efi/base/convertEpochSecondsToDate";
import { formatFullDate } from "efi/base/dates";
import { CryptoAsset, CryptoAssetType } from "efi/crypto/CryptoAsset";
import { getCryptoSymbol } from "efi/crypto/getCryptoSymbol";
import { getTokenInfo } from "efi/tokenlists";
import { trancheContractsByAddress } from "efi/tranche/tranches";

interface RedeemYieldTokensDrawerProps {
  account: string | null | undefined;
  library: Web3Provider | undefined;
  baseAsset: CryptoAsset;
  yieldTokenInfo: YieldTokenInfo;
  isOpen: boolean;
  onClose: () => void;
}

export function RedeemYieldTokensDrawer({
  library,
  account,
  baseAsset,
  yieldTokenInfo,
  isOpen,
  onClose,
}: RedeemYieldTokensDrawerProps): ReactElement {
  const signer = useSigner(account, library);

  // base asset calls
  const baseAssetSymbol = getCryptoSymbol(baseAsset);

  const { decimals: yieldTokenDecimals } = yieldTokenInfo;
  const { tranche: trancheAddress } = yieldTokenInfo.extensions;
  const trancheInfo = getTokenInfo<TrancheInfo>(trancheAddress);
  const tranche = trancheContractsByAddress[trancheInfo.address];
  const { unlockTimestamp } = trancheInfo.extensions;
  const unlockTimestampDate = convertEpochSecondsToDate2(unlockTimestamp);
  const unlockTimestampLabel = unlockTimestampDate
    ? formatFullDate(unlockTimestampDate)
    : undefined;

  const interestToken = useInterestTokenForTranche(tranche);

  // input
  const {
    stringValue: interestTokenAmountString,
    setValue: setInterestTokenAmountString,
  } = useNumericInput({
    min: 0,
    maxPrecision: yieldTokenDecimals,
  });

  const { data: accountInterestTokenBalance } = useTokenBalanceOf(
    interestToken,
    account
  );
  const onSetMaxAmount = useCallback(() => {
    setInterestTokenAmountString(
      formatUnits(accountInterestTokenBalance ?? 0, yieldTokenDecimals)
    );
  }, [
    accountInterestTokenBalance,
    yieldTokenDecimals,
    setInterestTokenAmountString,
  ]);

  const confirmButtonLabel = getConfirmButtonLabel(account);
  const interestTokenAmountBigNumber =
    interestTokenAmountString && yieldTokenDecimals
      ? parseUnits(interestTokenAmountString, yieldTokenDecimals)
      : BigNumber.from(0);
  const confirmButtonDisabled = getConfirmButtonDisabled(
    account,
    interestTokenAmountBigNumber
  );

  const redeemYieldTokens = useRedeemYieldTokens(
    signer,
    tranche,
    account,
    interestTokenAmountBigNumber,
    baseAsset
  );

  return (
    <WalletDrawer
      isOpen={isOpen}
      onClose={onClose}
      className={tw("justify-between")}
    >
      <div className={tw("flex", "flex-col", "space-y-4")}>
        <RedeemForm
          onSetMaxAmount={onSetMaxAmount}
          heading={t`Redeem ${baseAssetSymbol} Yield Tokens`}
          tranche={tranche}
          amount={interestTokenAmountString}
          assetSymbol={t`${baseAssetSymbol} Yield Token`}
          onAmountChange={setInterestTokenAmountString}
        >
          <div className={tw("flex", "flex-col", "space-y-6", "items-center")}>
            <LabeledText
              bold
              containerClassName={tw("justify-center")}
              muted={false}
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
          onClick={redeemYieldTokens}
        >
          {confirmButtonLabel}
        </Button>
      </div>
    </WalletDrawer>
  );
}

function useRedeemYieldTokens(
  signer: Signer | undefined,
  tranche: Tranche,
  account: string | null | undefined,
  interestTokenAmountBigNumber: BigNumber,
  baseAsset: CryptoAsset
) {
  const { withdraw: withdrawInterest } = useWithdrawInterest(
    signer,
    tranche,
    account,
    interestTokenAmountBigNumber
  );

  const { withdraw: withdrawToEth } = useRedeemTermAssetsToEth(
    signer,
    tranche,
    account,
    BigNumber.from(0),
    interestTokenAmountBigNumber
  );

  const redeemYieldTokens = useCallback(() => {
    if (baseAsset.type === CryptoAssetType.ETHEREUM) {
      withdrawToEth();
    } else {
      withdrawInterest();
    }
  }, [baseAsset.type, withdrawInterest, withdrawToEth]);
  return redeemYieldTokens;
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
