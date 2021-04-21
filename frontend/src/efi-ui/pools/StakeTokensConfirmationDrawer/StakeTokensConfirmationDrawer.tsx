import { ReactElement } from "react";

import { Button, Intent } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { BigNumber, Signer } from "ethers";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { getBalancerApprovalMessage } from "efi-ui/balancer/balancerApprovalMessage";
import { useBalancerVault } from "efi-ui/balancer/useBalancerVault";
import { ERC20Shim } from "efi-ui/contracts/ERC20Shim";
import { useCryptoAssetMetadata } from "efi-ui/crypto/hooks/useCryptoAssetMetadata/useCryptAssetMetadata";
import { StakeConfirmationForm } from "efi-ui/pools/StakeTokensConfirmationDrawer/StakeConfirmationForm";
import { useTokenAllowance } from "efi-ui/token/hooks/useTokenAllowance";
import { WalletApprovalCallout } from "efi-ui/transactions/TransactionDrawer/WalletApprovalCallout";
import { WalletDrawer } from "efi-ui/wallets/WalletDrawer/WalletDrawer";
import {
  CryptoAsset,
  CryptoAssetType,
  findTokenContract,
} from "efi/crypto/CryptoAsset";

interface StakingConfirmationDrawerProps {
  account: string | null | undefined;
  library: Web3Provider | undefined;
  baseAsset: CryptoAsset;
  trancheAsset: CryptoAsset;
  baseAssetIn: BigNumber | undefined;
  trancheAssetIn: BigNumber | undefined;
  isOpen: boolean;
  onClose: () => void;
  onStake: () => void;
}

export function StakingConfirmationDrawer({
  library,
  account,
  baseAsset,
  trancheAsset,
  baseAssetIn,
  trancheAssetIn,
  isOpen,
  onClose,
  onStake,
}: StakingConfirmationDrawerProps): ReactElement {
  const signer = account ? (library?.getSigner(account) as Signer) : undefined;
  const balancerVault = useBalancerVault();

  // base asset calls
  const {
    symbol: baseAssetSymbol,
    icon: baseAssetIcon,
  } = useCryptoAssetMetadata(baseAsset);
  const { data: allowance } = useTokenAllowance(
    findTokenContract(baseAsset) as ERC20Shim,
    account,
    balancerVault?.address
  );
  const { icon: trancheAssetIcon } = useCryptoAssetMetadata(trancheAsset);

  const confirmButtonLabel = getConfirmButtonLabel(account);
  const confirmButtonDisabled = getConfirmButtonDisabled(
    account,
    baseAsset,
    trancheAssetIn,
    allowance
  );

  return (
    <WalletDrawer
      isOpen={isOpen}
      onClose={onClose}
      className={tw("justify-between")}
    >
      <div className={tw("flex", "flex-col", "space-y-4")}>
        <StakeConfirmationForm
          assetOneSymbol={baseAssetSymbol}
          assetTwoSymbol={t`${baseAssetSymbol} Principal Token`}
          heading={t`Confirm Staking`}
          AssetOneIcon={baseAssetIcon}
          AssetTwoIcon={trancheAssetIcon}
          assetOneValueLabel={"assetOneValueLabel"}
          assetTwoValueLabel={"assetTwoValueLabel"}
          assetOneSymbolLabel={"assetOneSymbolLabel"}
          assetTwoSymbolLabel={"assetTwoSymbolLabel"}
        />
        {baseAsset.type === CryptoAssetType.ERC20 ||
        baseAsset.type === CryptoAssetType.ERC20PERMIT ? (
          <WalletApprovalCallout
            account={account}
            cryptoAsset={baseAsset}
            approvalAmount={baseAssetIn}
            signer={signer}
            message={getBalancerApprovalMessage(baseAssetSymbol || "")}
          />
        ) : null}

        {trancheAsset?.type === CryptoAssetType.ERC20 ||
        trancheAsset?.type === CryptoAssetType.ERC20PERMIT ? (
          <WalletApprovalCallout
            account={account}
            cryptoAsset={trancheAsset}
            approvalAmount={trancheAssetIn}
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
