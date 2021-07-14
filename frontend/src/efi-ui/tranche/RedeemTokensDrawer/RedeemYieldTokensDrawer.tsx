import { ReactElement, useCallback, useEffect, useState } from "react";

import { Button, Callout, Intent, Switch } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { Tranche } from "elf-contracts/types";
import { BigNumber, Signer } from "ethers";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { YieldTokenInfo } from "tokenlists/types";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { useNumericInput } from "efi-ui/base/hooks/useNumericInput/useNumericInput";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { useSigner } from "efi-ui/provider/useBlockFromTag/useSigner/useSigner";
import { useTokenBalanceOf } from "efi-ui/token/hooks/useTokenBalanceOf";
import { RedeemForm } from "efi-ui/tranche/RedeemForm/RedeemForm";
import { useWithdrawInterest } from "efi-ui/tranche/RedeemTokensDrawer/useWithdrawInterest";
import { useRedeemTermAssetsToEth } from "efi-ui/userProxy/useRedeemTermAssetsToEth";
import { WalletDrawer } from "efi-ui/wallets/WalletDrawer/WalletDrawer";
import ContractAddresses from "efi/addresses";
import { convertEpochSecondsToDate } from "efi/base/convertEpochSecondsToDate";
import { formatFullDate } from "efi/base/dates";
import { CryptoAsset, CryptoAssetType } from "efi/crypto/CryptoAsset";
import { getCryptoSymbol } from "efi/crypto/getCryptoSymbol";
import { trancheContractsByAddress } from "efi/tranche/tranches";
import { WalletApprovalCallout } from "efi-ui/transactions/TransactionDrawer/WalletApprovalCallout";
import { getCryptoAssetForToken } from "efi/crypto/getCryptoAssetForToken";
import { interestTokenContractsByAddress } from "efi/interestToken/interestToken";

const { userProxyContractAddress } = ContractAddresses;

interface RedeemYieldTokensDrawerProps {
  account: string | null | undefined;
  library: Web3Provider | undefined;
  baseAsset: CryptoAsset;
  yieldTokenInfo: YieldTokenInfo;
  userProxyAllowance: string;
  isOpen: boolean;
  onClose: () => void;
}

export function RedeemYieldTokensDrawer({
  library,
  account,
  baseAsset,
  yieldTokenInfo,
  userProxyAllowance,
  isOpen,
  onClose,
}: RedeemYieldTokensDrawerProps): ReactElement {
  const signer = useSigner(account, library);

  // base asset calls
  const baseAssetSymbol = getCryptoSymbol(baseAsset);

  const {
    address: yieldTokenAddress,
    decimals: yieldTokenDecimals,
    extensions: { tranche: trancheAddress, unlockTimestamp },
  } = yieldTokenInfo;
  const unlockTimestampDate = convertEpochSecondsToDate(unlockTimestamp);
  const unlockTimestampLabel = unlockTimestampDate
    ? formatFullDate(unlockTimestampDate)
    : undefined;
  const yieldTokenContract = interestTokenContractsByAddress[yieldTokenAddress];
  const trancheContract = trancheContractsByAddress[trancheAddress];

  // input
  const { stringValue: yieldTokenValue, setValue: setYieldTokenValue } =
    useNumericInput({
      min: 0,
      maxPrecision: yieldTokenDecimals,
    });

  const [enoughAllowance, setEnoughAllowance] = useState(!!+userProxyAllowance);
  const [includePermits, setIncludePermits] = useState(true);
  const showPermitCallout =
    !enoughAllowance && baseAsset.type === CryptoAssetType.ETHEREUM;
  const showApprovalCallout = showPermitCallout && !includePermits;
  useEffect(() => {
    if (
      parseUnits(userProxyAllowance || "0").lt(
        parseUnits(yieldTokenValue || "0")
      )
    ) {
      setEnoughAllowance(false);
    }
  }, [userProxyAllowance, yieldTokenValue]);

  const { data: yieldTokenBalanceOf } = useTokenBalanceOf(
    yieldTokenContract,
    account
  );
  const onSetMaxAmount = useCallback(() => {
    setYieldTokenValue(
      formatUnits(yieldTokenBalanceOf ?? 0, yieldTokenDecimals)
    );
  }, [yieldTokenBalanceOf, yieldTokenDecimals, setYieldTokenValue]);

  const yieldTokenValueBN = parseUnits(
    yieldTokenValue || "0",
    yieldTokenDecimals
  );

  const {
    withdraw: redeemYieldTokens,
    isError,
    isLoading,
    reset,
  } = useRedeemYieldTokens(
    signer,
    trancheContract,
    account,
    yieldTokenValueBN,
    baseAsset,
    onClose
  );

  const confirmButtonLabel = getConfirmButtonLabel(
    account,
    yieldTokenValueBN,
    yieldTokenBalanceOf
  );
  const confirmButtonDisabled = getConfirmButtonDisabled(
    account,
    yieldTokenValueBN,
    yieldTokenBalanceOf,
    enoughAllowance,
    showApprovalCallout
  );

  let buttonIntent = isError ? Intent.DANGER : Intent.PRIMARY;
  if (yieldTokenBalanceOf && yieldTokenValueBN.gt(yieldTokenBalanceOf)) {
    buttonIntent = Intent.DANGER;
  }

  const onCloseDrawer = useCallback(() => {
    setYieldTokenValue("");
    reset();
    onClose();
  }, [onClose, reset, setYieldTokenValue]);

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
            messageRenderer={() => `Approval needed for ${yieldTokenInfo.name}`}
            signer={signer}
            ownerAddress={account}
            cryptoAsset={getCryptoAssetForToken(yieldTokenInfo.address)}
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
          heading={t`Redeem ${baseAssetSymbol} Yield Tokens`}
          tranche={trancheContract}
          intent={buttonIntent}
          amount={yieldTokenValue}
          assetSymbol={t`${baseAssetSymbol} Yield Token`}
          onAmountChange={setYieldTokenValue}
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
          disabled={isLoading || confirmButtonDisabled}
          loading={isLoading}
          intent={buttonIntent}
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
  baseAsset: CryptoAsset,
  onClose: () => void
): {
  withdraw: () => void;
  reset: () => void;
  isError: boolean;
  isLoading: boolean;
} {
  const redeemYield = useWithdrawInterest(
    signer,
    tranche,
    account,
    interestTokenAmountBigNumber,
    onClose
  );

  const redeemEth = useRedeemTermAssetsToEth(
    signer,
    tranche,
    account,
    BigNumber.from(0),
    interestTokenAmountBigNumber,
    onClose
  );

  if (baseAsset.type === CryptoAssetType.ETHEREUM) {
    return redeemEth;
  }
  return redeemYield;
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
