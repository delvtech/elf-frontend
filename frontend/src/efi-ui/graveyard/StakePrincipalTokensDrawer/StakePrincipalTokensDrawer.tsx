import { ReactElement } from "react";

import { Button, Intent } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { ERC20 } from "elf-contracts/types/ERC20";
import { Tranche } from "elf-contracts/types/Tranche";
import { BigNumber, Signer } from "ethers";
import zipObject from "lodash.zipobject";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { getBalancerApprovalMessage } from "efi-ui/balancer/balancerApprovalMessage";
import { useBalancerVault } from "efi-ui/balancer/useBalancerVault";
import { ERC20Shim } from "efi/contracts/ERC20Shim";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { getCryptoDecimals } from "efi/crypto/getCryptoDecimals";
import { getCryptoSymbol } from "efi/crypto/getCryptoSymbol";
import { StakeForm } from "efi-ui/pools/StakeForm/StakeForm";
import { useConvergentCurvePoolStakeInputs } from "efi-ui/pools/useConvergentCurvePoolStakeInputs/useConvergentCurvePoolStakeInputs";
import { useJoinConvergentPool } from "efi-ui/pools/useJoinConvergentPool/useJoinConvergentPool";
import { usePoolTokens } from "efi-ui/pools/usePoolTokens/usePoolTokens";
import { useTokenAllowance } from "efi-ui/token/hooks/useTokenAllowance";
import { WalletApprovalCalloutOld } from "efi-ui/transactions/TransactionDrawer/WalletApprovalCallout";
import { WalletDrawer } from "efi-ui/wallets/WalletDrawer/WalletDrawer";
import {
  CryptoAsset,
  CryptoAssetType,
  findTokenContract,
} from "efi/crypto/CryptoAsset";
import { findTokenAddressForPool } from "efi/pools/findTokenAddressForPool";
import { PoolContract } from "efi/pools/PoolContract";

interface StakePrincipalTokensDrawerProps {
  account: string | null | undefined;
  library: Web3Provider | undefined;
  pool: PoolContract | undefined;
  baseAsset: CryptoAsset;
  tranche: Tranche | undefined;
  isOpen: boolean;
  onClose: () => void;
}

export function StakePrincipalTokensDrawer({
  library,
  account,
  baseAsset,
  tranche,
  isOpen,
  onClose,
  pool,
}: StakePrincipalTokensDrawerProps): ReactElement {
  const signer = account ? (library?.getSigner(account) as Signer) : undefined;
  const balancerVault = useBalancerVault();

  // base asset calls
  const baseAssetSymbol = getCryptoSymbol(baseAsset);
  const baseAssetAddress = findTokenAddressForPool(baseAsset);
  const { data: allowance } = useTokenAllowance(
    findTokenContract(baseAsset) as ERC20Shim,
    account,
    balancerVault?.address
  );
  const baseAssetDecimals = getCryptoDecimals(baseAsset);

  // tranche calls
  const trancheCryptoAsset = makeCryptoAsset(tranche as ERC20Shim);
  const { data: trancheDecimals } = useSmartContractReadCall(
    tranche,
    "decimals"
  );

  // Pool calls
  const { data: totalSupply } = useSmartContractReadCall(pool, "totalSupply");
  const { data: [tokens, tokenBalances] = [] } = usePoolTokens(pool);
  const reservesByToken = getReservesByToken(tokens, tokenBalances);
  const trancheReserves = tranche
    ? reservesByToken?.[tranche.address]
    : undefined;
  const baseAssetReserves = baseAssetAddress
    ? reservesByToken?.[baseAssetAddress]
    : undefined;

  const {
    activeInput,
    baseAssetIn,
    baseAssetInBigNumber,
    principalTokenIn,
    principalTokenInBigNumber,
    onBaseAssetInChange,
    onPrincipalTokenInChange,
  } = useConvergentCurvePoolStakeInputs(
    baseAssetDecimals,
    trancheDecimals,
    baseAssetReserves,
    trancheReserves,
    totalSupply
  );

  const maxAmountsIn =
    principalTokenInBigNumber && baseAssetInBigNumber
      ? tokens?.map((tokenAddress) => {
          if (tokenAddress === tranche?.address) {
            return principalTokenInBigNumber;
          }
          return baseAssetInBigNumber;
        })
      : undefined;

  const { onJoinPool } = useJoinConvergentPool(
    signer,
    account,
    pool,
    maxAmountsIn
  );

  const confirmButtonLabel = getConfirmButtonLabel(account);
  const confirmButtonDisabled = getConfirmButtonDisabled(
    account,
    baseAsset,
    principalTokenInBigNumber,
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
          activeInput={activeInput}
          heading={t`Stake ${baseAssetSymbol} Principal Tokens`}
          assetOne={trancheCryptoAsset}
          assetOneAmount={principalTokenIn}
          onAssetOneAmountChange={onPrincipalTokenInChange}
          assetOneSymbol={t`${baseAssetSymbol} Principal Token`}
          assetTwo={baseAsset}
          onAssetTwoAmountChange={onBaseAssetInChange}
          assetTwoAmount={baseAssetIn}
        />
        {baseAsset.type === CryptoAssetType.ERC20 ||
        baseAsset.type === CryptoAssetType.ERC20PERMIT ? (
          <WalletApprovalCalloutOld
            ownerAddress={account}
            cryptoAsset={baseAsset}
            approvalAmount={baseAssetInBigNumber}
            signer={signer}
            spenderAddress={balancerVault?.address}
            message={getBalancerApprovalMessage(baseAssetSymbol || "")}
          />
        ) : null}
        {trancheCryptoAsset?.type === CryptoAssetType.ERC20 ||
        trancheCryptoAsset?.type === CryptoAssetType.ERC20PERMIT ? (
          <WalletApprovalCalloutOld
            ownerAddress={account}
            spenderAddress={balancerVault?.address}
            cryptoAsset={trancheCryptoAsset}
            approvalAmount={principalTokenInBigNumber}
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
          // onClick={onStake}
        >
          {confirmButtonLabel}
        </Button>
      </div>
    </WalletDrawer>
  );
}

function getReservesByToken(
  tokens: string[] | undefined,
  tokenBalances: BigNumber[] | undefined
): Record<string, BigNumber> | undefined {
  if (!tokens || !tokenBalances) {
    return;
  }

  return zipObject(tokens, tokenBalances);
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
