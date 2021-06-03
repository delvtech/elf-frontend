import { Fragment, ReactElement } from "react";

import { Web3Provider } from "@ethersproject/providers";
import { RouteComponentProps } from "@reach/router";
import { useWeb3React } from "@web3-react/core";

import tw from "efi-tailwindcss-classnames";
import { PoolDetails } from "efi-ui/pools/PoolDetails/PoolDetails";
import { useSigner } from "efi-ui/provider/useBlockFromTag/useSigner/useSigner";

import { PoolViewHeader } from "./PoolViewHeader";
import { PoolViewTitle } from "./PoolViewTitle";
import { getPoolTokenInfo } from "efi/pools/getPoolInfo";
import { principalPoolContractsByAddress } from "efi/pools/ccpool";
import { yieldPoolContractsByAddress } from "efi/pools/weightedPool";
import { PoolContract } from "efi/pools/PoolContract";

interface PoolViewProps extends RouteComponentProps {
  poolAddress?: string;
}

export function PoolView({ poolAddress }: PoolViewProps): ReactElement {
  const { active, account, chainId, connector, library } =
    useWeb3React<Web3Provider>();
  const signer = useSigner(account, library);
  const poolInfo = getPoolTokenInfo(poolAddress as string);
  const pool = getPoolContract(poolAddress);

  return (
    <Fragment>
      <PoolViewTitle poolInfo={poolInfo} />
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
            poolInfo={poolInfo}
          />
        </div>
      </div>
    </Fragment>
  );
}
function getPoolContract(poolAddress: string | undefined): PoolContract {
  return (
    principalPoolContractsByAddress[poolAddress as string] ??
    yieldPoolContractsByAddress[poolAddress as string]
  );
}
