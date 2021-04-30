import React, { Fragment, ReactElement } from "react";

import { Web3Provider } from "@ethersproject/providers";
import { AbstractConnector } from "@web3-react/abstract-connector";
import { Tranche } from "elf-contracts/types/Tranche";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { PrincipalTokenCard } from "efi-ui/portfolio/PrincipalTokenCard/PrincipalTokenCard";
import { NoPrincipalTokensInWalletNonIdealState } from "efi-ui/wallets/NoPrincipalTokensInWalletNonIdealState/NoPrincipalTokensInWalletNonIdealState";
import { NoWalletConnectedNonIdealState } from "efi-ui/wallets/NoWalletConnectedNonIdealState/NoWalletConnectedNonIdealState";
import { usePendingTransaction } from "efi-ui/transactions/usePendingTransaction/usePendingTransaction";
import ContractAddresses from "efi/addresses";
import { LoadingCard } from "efi-ui/portfolio/LoadingCard";
import { PendingTransactionPref } from "efi-ui/prefs/usePendingTransactionPref/usePendingTransactionPref";

interface PrincipalTokenPortfolioProps {
  chainId: number | undefined;
  library: Web3Provider | undefined;
  connector: AbstractConnector | undefined;
  walletConnectionActive: boolean;
  account: string | null | undefined;
  tranches: Tranche[];
}

export function PrincipalTokenPortfolio({
  library,
  account,
  connector,
  walletConnectionActive,
  chainId,
  tranches,
}: PrincipalTokenPortfolioProps): ReactElement {
  const hasFYTs = tranches.length;
  const pendingTransaction = usePendingTransaction();
  const hasPendingTransactions = hasPendingPrincipalTokenTransactions(
    pendingTransaction
  );

  let nonIdealStateContent = null;
  if (!account) {
    nonIdealStateContent = (
      <NoWalletConnectedNonIdealState
        title={t`Connect your wallet to view your portfolio`}
      />
    );
  } else if (!hasFYTs) {
    nonIdealStateContent = <NoPrincipalTokensInWalletNonIdealState />;
  }

  return (
    <div className={tw("flex", "flex-1", "flex-wrap", "justify-center")}>
      {nonIdealStateContent ? (
        <div className={tw("flex", "flex-1", "justify-center", "items-center")}>
          {nonIdealStateContent}
        </div>
      ) : (
        <Fragment>
          {hasPendingTransactions ? <LoadingCard /> : null}

          {tranches.map((tranche) => [
            <div key={tranche.address}>
              <PrincipalTokenCard
                chainId={chainId}
                library={library}
                connector={connector}
                walletConnectionActive={walletConnectionActive}
                account={account}
                tranche={tranche}
              />
            </div>,
          ])}
        </Fragment>
      )}
    </div>
  );
}

function hasPendingPrincipalTokenTransactions(
  pendingTransactionPref: PendingTransactionPref
) {
  const { contractAddress, methodName } = pendingTransactionPref;
  // no pending transactions
  if (!contractAddress || !methodName) {
    return false;
  }

  // user proxy txs that affect principal tokens
  if (
    contractAddress === ContractAddresses.userProxyContractAddress &&
    ["mint"].includes(methodName)
  ) {
    return true;
  }

  // pending swap txs create principal tokens
  // TODO: figure out how to track if it's a pt swap specifically, right now
  // this just looks for any balancer swaps
  if (
    contractAddress === ContractAddresses.balancerVaultAddress &&
    ["batchSwap"].includes(methodName)
  ) {
    return true;
  }

  return false;
}
