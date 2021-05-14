import { Fragment, ReactElement, useMemo } from "react";

import { Web3Provider } from "@ethersproject/providers";
import { RouteComponentProps } from "@reach/router";
import { useWeb3React } from "@web3-react/core";
import { Signer } from "ethers";

import tw from "efi-tailwindcss-classnames";
import { PoolDetails } from "efi-ui/pools/PoolDetails/PoolDetails";
import { useAllPools } from "efi-ui/pools/useAllPools/useAllPools";

import { PoolViewHeader } from "./PoolViewHeader";
import { PoolViewTitle } from "./PoolViewTitle";

interface PoolViewProps extends RouteComponentProps {
  poolAddress?: string;
}

export function PoolView({ poolAddress }: PoolViewProps): ReactElement {
  const web3ReactContext = useWeb3React<Web3Provider>();
  const { active, account, chainId, connector, library } = web3ReactContext;
  const signer = useSigner(account, library);
  const allPools = useAllPools();
  const pool = allPools.find((pool) => pool?.address === poolAddress);

  return (
    <Fragment>
      <PoolViewTitle pool={pool} />
      <div
        data-testid="pool-view"
        className={tw(
          "flex",
          "flex-col",
          "p-12",
          "h-full",
          "w-full",
          "space-y-8",
          "overflow-scroll"
        )}
      >
        {/* page title */}
        <div className={tw("flex", "justify-between")}>
          <PoolViewHeader pool={pool} />
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
    </Fragment>
  );
}
function useSigner(
  account: string | null | undefined,
  library: Web3Provider | undefined
) {
  return useMemo(() => {
    return account ? (library?.getSigner(account) as Signer) : undefined;
  }, [account, library]);
}
