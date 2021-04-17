import React, { Fragment, ReactElement } from "react";
import { Helmet } from "react-helmet";

import { Classes, H2 } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { RouteComponentProps } from "@reach/router";
import { useWeb3React } from "@web3-react/core";
import classNames from "classnames";
import { Signer } from "ethers";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { getQueryData } from "efi-ui/base/queryResults";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { PoolDetails } from "efi-ui/pools/PoolDetails/PoolDetails";
import { useAllPools } from "efi-ui/pools/useAllPools/useAllPools";
import { WalletConnectionCard } from "efi-ui/wallets/WalletConnectionCard/WalletConnectionCard";
import { getConnectorName } from "efi/wallets/connectors";

interface PoolViewProps extends RouteComponentProps {
  poolAddress?: string;
}

export function PoolView({ poolAddress }: PoolViewProps): ReactElement {
  const {
    active,
    account,
    chainId,
    connector,
    library,
  } = useWeb3React<Web3Provider>();

  const signer = account ? (library?.getSigner(account) as Signer) : undefined;
  const allPools = useAllPools(signer);

  const pool = allPools.find((pool) => pool?.address === poolAddress);
  const poolNameResult = useSmartContractReadCall(pool, "name");

  const poolName = getQueryData(poolNameResult);
  const connectorName = getConnectorName(connector, library);

  return (
    <Fragment>
      <Helmet>
        <title>{poolName}</title>
      </Helmet>
      <div
        data-testid="pool-view"
        className={tw(
          "flex",
          "p-12",
          "h-full",
          "space-x-12",
          "overflow-scroll"
        )}
      >
        {/* Main content */}
        <div className={tw("flex", "flex-col", "flex-1", "space-y-8")}>
          {/* page title */}
          <div className={tw("flex", "justify-between")}>
            <div className={tw("flex", "flex-col", "justify-start")}>
              <H2 className={tw("mb-4")}>{poolName}</H2>
              <span
                className={classNames(
                  Classes.RUNNING_TEXT,
                  Classes.TEXT_MUTED,
                  tw("text-base")
                )}
              >{t`Trade for either asset or provide liquidity for this pool.`}</span>
            </div>
            <WalletConnectionCard
              active={active}
              account={account}
              chainId={chainId}
              connectorName={connectorName}
            />
          </div>
          <div className={tw("flex", "flex-col", "justify-between")}>
            <PoolDetails
              library={library}
              signer={signer}
              account={account}
              chainId={chainId}
              connector={connector}
              walletActive={active}
              pool={pool}
            />
          </div>
        </div>
      </div>
    </Fragment>
  );
}
