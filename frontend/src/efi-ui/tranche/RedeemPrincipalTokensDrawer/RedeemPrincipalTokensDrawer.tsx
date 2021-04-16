import React, { ReactElement } from "react";

import { Button, Intent } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { ERC20 } from "elf-contracts/types/ERC20";
import { Tranche } from "elf-contracts/types/Tranche";
import { BigNumber, Signer } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { getBalancerApprovalMessage } from "efi-ui/balancer/balancerApprovalMessage";
import { useBalancerVault } from "efi-ui/balancer/useBalancerVault";
import { useNumericInput } from "efi-ui/base/hooks/useNumericInput/useNumericInput";
import { ERC20Shim } from "efi-ui/contracts/ERC20Shim";
import { WalletApprovalCallout } from "efi-ui/contracts/TransactionDrawer/WalletApprovalCallout";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { useCryptoDecimals } from "efi-ui/crypto/hooks/useCryptoDecimals/useCryptoDecimals";
import { useCryptoSymbol } from "efi-ui/crypto/hooks/useCryptoSymbol/useCryptoSymbol";
import { StakeForm } from "efi-ui/pools/StakeForm/StakeForm";
import { useJoinPool } from "efi-ui/pools/useJoinPool/useJoinPool";
import { getTokenAddressForBalancer } from "efi-ui/swaps/getTokenAddressForBalancer";
import { useTokenAllowance } from "efi-ui/token/hooks/useTokenAllowance";
import { WalletDrawer } from "efi-ui/wallets/WalletDrawer/WalletDrawer";
import {
  CryptoAsset,
  CryptoAssetType,
  findTokenContract,
} from "efi/crypto/CryptoAsset";
import { PoolContract } from "efi/pools/PoolContract";

interface RedeemPrincipalTokensDrawerProps {
  account: string | null | undefined;
  library: Web3Provider | undefined;
  pool: PoolContract | undefined;
  baseAsset: CryptoAsset;
  tranche: Tranche | undefined;
  isOpen: boolean;
  onClose: () => void;
}

export function RedeemPrincipalTokensDrawer({
  library,
  account,
  baseAsset,
  tranche,
  isOpen,
  onClose,
  pool,
}: RedeemPrincipalTokensDrawerProps): ReactElement {
  const signer = account ? (library?.getSigner(account) as Signer) : undefined;
  const balancerVault = useBalancerVault();

  // base asset calls
  const baseAssetSymbol = useCryptoSymbol(baseAsset);
  const { data: allowance } = useTokenAllowance(
    findTokenContract(baseAsset) as ERC20Shim,
    account,
    balancerVault?.address
  );
  const baseAssetDecimals = useCryptoDecimals(baseAsset);
  const {
    stringValue: baseAssetAmountString,
    setValue: onBaseAssetAmountChange,
  } = useNumericInput({
    min: 0,
    maxPrecision: baseAssetDecimals,
  });
  const baseAssetBalancerAddress = getTokenAddressForBalancer(baseAsset);
  const baseAssetAmountBigNumber = baseAssetAmountString
    ? parseUnits(baseAssetAmountString, baseAssetDecimals)
    : undefined;

  // tranche calls
  const trancheCryptoAsset = makeCryptoAsset(tranche as ERC20Shim);
  const { data: trancheDecimals } = useSmartContractReadCall(
    tranche,
    "decimals"
  );
  const {
    stringValue: trancheAmountString,
    setValue: onTrancheAmountChange,
  } = useNumericInput({
    min: 0,
    maxPrecision: trancheDecimals,
  });
  const trancheBalancerAddress = getTokenAddressForBalancer(baseAsset);
  const trancheAmountBigNumber = trancheAmountString
    ? parseUnits(trancheAmountString, baseAssetDecimals)
    : undefined;

  const onStake = useJoinPool(signer, account, pool);

  const confirmButtonLabel = getConfirmButtonLabel(account);
  const confirmButtonDisabled = getConfirmButtonDisabled(
    account,
    baseAsset,
    baseAssetAmountBigNumber,
    allowance
  );

  return (
    <WalletDrawer
      isOpen={isOpen}
      onClose={onClose}
      className={tw("justify-between")}
    >
      <div className={tw("flex", "flex-col", "space-y-4")}>
        <StakeForm
          heading={t`Stake ${baseAssetSymbol} Principal Tokens`}
          assetOne={baseAsset}
          assetOneAmount={baseAssetAmountString}
          onAssetOneAmountChange={onBaseAssetAmountChange}
          assetTwo={trancheCryptoAsset}
          assetTwoSymbol={t`${baseAssetSymbol} Principal Token`}
          onAssetTwoAmountChange={onTrancheAmountChange}
          assetTwoAmount={trancheAmountString}
        />
        {baseAsset.type === CryptoAssetType.ERC20 ||
        baseAsset.type === CryptoAssetType.ERC20PERMIT ? (
          <WalletApprovalCallout
            account={account}
            cryptoAsset={baseAsset}
            approvalAmount={baseAssetAmountBigNumber}
            signer={signer}
            message={getBalancerApprovalMessage(baseAssetSymbol)}
          />
        ) : null}
        {trancheCryptoAsset?.type === CryptoAssetType.ERC20 ||
        trancheCryptoAsset?.type === CryptoAssetType.ERC20PERMIT ? (
          <WalletApprovalCallout
            account={account}
            cryptoAsset={trancheCryptoAsset}
            approvalAmount={trancheAmountBigNumber}
            signer={signer}
            message={getBalancerApprovalMessage(t`pt${baseAssetSymbol}`)}
          />
        ) : null}
        <Button
          fill
          disabled={confirmButtonDisabled}
          intent={Intent.PRIMARY}
          className={tw("h-16")}
          large
          outlined
          onClick={onStake}
        >
          {confirmButtonLabel}
        </Button>
      </div>
    </WalletDrawer>
  );
}

function makeCryptoAsset(token: ERC20 | undefined) {
  if (!token) {
    return;
  }

  const assetIn: CryptoAsset = {
    id: token?.address,
    type: CryptoAssetType.ERC20,
    tokenContract: token,
  };

  return assetIn;
}
function getConfirmButtonLabel(account: string | null | undefined) {
  if (!account) {
    return t`Connect your wallet to continue`;
  }

  return t`Confirm transaction`;
}

function getConfirmButtonDisabled(
  account: string | null | undefined,
  baseAsset: CryptoAsset | undefined,
  amountIn: BigNumber | undefined,
  marketAllowance: BigNumber | undefined
) {
  // can't confirm anything w/out a base asset
  if (!baseAsset) {
    return true;
  }

  // must be connected to click this button
  if (!account) {
    return true;
  }

  // disabled when no amount is entered
  if (!amountIn) {
    return true;
  }

  // disabled if it's an erc20 or erc20permits w/out enough allowance.
  // NOTE: we have to use approvals for erc20permits because balancer does not
  // support that
  if (
    [CryptoAssetType.ERC20, CryptoAssetType.ERC20PERMIT].includes(
      baseAsset.type
    )
  ) {
    const hasEnoughAllowance = marketAllowance?.gte(amountIn);
    if (!hasEnoughAllowance) {
      return true;
    }
  }

  // otherwise the button should not be disabled
  return false;
}
