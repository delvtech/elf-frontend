import { ReactElement } from "react";

import { Callout, Card, Classes, Intent } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { Tranche } from "elf-contracts/types/Tranche";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { useNewPrincipalTokensPendingTransaction } from "efi-ui/portfolio/hooks/useNewPrincipalTokensPendingTransaction";
import { PrincipalTokenCard } from "efi-ui/portfolio/PrincipalTokenCard/PrincipalTokenCard";
import { NoPrincipalTokensInWalletNonIdealState } from "efi-ui/wallets/NoPrincipalTokensInWalletNonIdealState/NoPrincipalTokensInWalletNonIdealState";
import { NoWalletConnectedNonIdealState } from "efi-ui/wallets/NoWalletConnectedNonIdealState/NoWalletConnectedNonIdealState";
import classNames from "classnames";
import React from "react";

interface PrincipalTokenPortfolioProps {
  chainId: number | undefined;
  library: Web3Provider | undefined;
  account: string | null | undefined;
  tranches: Tranche[];
}

export function PrincipalTokenPortfolio({
  library,
  account,
  chainId,
  tranches,
}: PrincipalTokenPortfolioProps): ReactElement {
  const pendingPrincipalTokenTransaction = useNewPrincipalTokensPendingTransaction();

  const hasFYTs = tranches.length || !!pendingPrincipalTokenTransaction;
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
        <div className={tw("flex", "w-full", "justify-center", "items-center")}>
          {pendingPrincipalTokenTransaction ? (
            <Card
              style={{ width: 512, height: 632 }}
              className={classNames(
                tw("p-8", "flex", "h-full", "flex-col", "m-4", "space-y-5")
              )}
            >
              <Callout className={classNames(tw("flex-1"), Classes.SKELETON)} />
              <Callout className={classNames(tw("flex-1"), Classes.SKELETON)} />
              <Callout
                intent={Intent.PRIMARY}
                icon={null}
                className={tw("p-4")}
                title={t`Principal tokens pending`}
              >
                {pendingPrincipalTokenTransaction.methodName === "mint"
                  ? t`Stake or sell your principal token to gain liquidity again`
                  : null}
                {pendingPrincipalTokenTransaction.methodName === "batchSwap"
                  ? t`Stake when the transaction is confirmed to boost your apy further`
                  : null}
              </Callout>
            </Card>
          ) : null}

          {tranches.map((tranche) => [
            <div key={tranche.address}>
              <PrincipalTokenCard
                chainId={chainId}
                library={library}
                account={account}
                tranche={tranche}
              />
            </div>,
          ])}
        </div>
      )}
    </div>
  );
}
