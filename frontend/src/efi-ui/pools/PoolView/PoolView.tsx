import { Fragment, ReactElement } from "react";
import { Helmet } from "react-helmet";

import { Web3Provider } from "@ethersproject/providers";
import { RouteComponentProps } from "@reach/router";
import { useWeb3React } from "@web3-react/core";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { PoolDetails } from "efi-ui/pools/PoolDetails/PoolDetails";
import { useSigner } from "efi-ui/provider/useBlockFromTag/useSigner/useSigner";
import { getPoolInfo } from "efi/pools/getPoolInfo";

import { PoolViewHeader } from "./PoolViewHeader";
import { PoolViewTitle } from "./PoolViewTitle";

interface PoolViewProps extends RouteComponentProps {
  poolAddress?: string;
}

export function PoolView({ poolAddress }: PoolViewProps): ReactElement {
  const { account, library } = useWeb3React<Web3Provider>();
  const signer = useSigner(account, library);
  const poolInfo = getPoolInfo(poolAddress as string);

  return (
    <Fragment>
      <Helmet>
        <title>{t`${poolInfo.name} | Element.fi`}</title>
      </Helmet>
      <PoolViewTitle poolInfo={poolInfo} />
      <div
        data-testid="pool-view"
        className={tw(
          "flex",
          "flex-col",
          "pb-24",
          "lg:pb-12",
          "h-full",
          "w-full",
          "space-y-8",
          "overflow-auto",
          "px-4",
          "lg:px-12"
        )}
      >
        {/* page title */}
        <div className={tw("flex", "justify-between")}>
          <PoolViewHeader poolInfo={poolInfo} />
        </div>
        <div className={tw("flex", "flex-col", "justify-between")}>
          <PoolDetails
            library={library}
            signer={signer}
            account={account}
            poolInfo={poolInfo}
          />
        </div>
      </div>
    </Fragment>
  );
}
