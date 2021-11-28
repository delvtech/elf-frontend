import { Fragment, ReactElement } from "react";
import { Helmet } from "react-helmet";
import { GetStaticPropsContext } from "next";

import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { PoolDetails } from "efi-ui/pools/PoolDetails/PoolDetails";
import { useSigner } from "efi-ui/provider/useBlockFromTag/useSigner/useSigner";
import { getAllPoolAddresses, getPoolInfo } from "efi/pools/getPoolInfo";
import { PoolInfo } from "efi/pools/PoolInfo";

import { PoolViewHeader } from "./PoolViewHeader";
import { PoolViewTitle } from "./PoolViewTitle";
import { PoolAction } from "efi-ui/pools/hooks/usePoolViewPoolActionsPref/usePoolViewPoolActionsPref";

export async function getStaticProps({ params }: GetStaticPropsContext) {
  const poolInfo = await getPoolInfo(params?.poolAddress as string);
  return {
    props: { poolInfo },
  };
}

interface PoolViewProps {
  poolInfo: PoolInfo;
  poolAction?: PoolAction;
}

export function PoolView({
  poolInfo,
  poolAction = PoolAction.BUY,
}: PoolViewProps): ReactElement {
  const { account, library } = useWeb3React<Web3Provider>();
  const signer = useSigner(account, library);

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
            poolAction={poolAction}
          />
        </div>
      </div>
    </Fragment>
  );
}

export async function getStaticPaths() {
  const addresses = getAllPoolAddresses();
  const paths = addresses.map((poolAddress) => ({
    params: { poolAddress },
  }));
  return {
    paths,
    fallback: false,
  };
}
