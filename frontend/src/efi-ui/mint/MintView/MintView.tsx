import React, { Fragment, ReactElement } from "react";

import { Intent, Tag } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { RouteComponentProps } from "@reach/router";
import { useWeb3React } from "@web3-react/core";
import { WeightedPool } from "elf-contracts/types/WeightedPool";
import { Signer } from "ethers";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { ViewTitle } from "efi-ui/page/ViewTitle/ViewTitle";
import { MintPoolCard } from "efi-ui/pools/PoolsTable/MintPoolCard";
import { useWeightedPools } from "efi-ui/pools/useWeightedPools/useWeightedPools";

interface MintViewProps extends RouteComponentProps {}

export function MintView(props: MintViewProps): ReactElement {
  const { account, library, active, chainId, connector } =
    useWeb3React<Web3Provider>();
  const signer = account ? (library?.getSigner(account) as Signer) : undefined;

  const interestTokenPools = useWeightedPools(signer);

  return (
    <Fragment>
      <div
        data-testid="pools-view"
        className={tw(
          "flex",
          "flex-col",
          "p-12",
          "pt-24",
          "lg:pt-12",
          "h-full",
          "space-y-12",
          "items-center",
          "overflow-scroll"
        )}
      >
        <div style={{ maxWidth: 610 }}>
          <ViewTitle
            title={t`Stay liquid with principal and yield tokens.`}
            titleTag={<Tag minimal intent={Intent.WARNING}>{t`alpha`}</Tag>}
            className={tw("text-center")}
            subtitle={t`Gain capital efficiency on your existing positions, boost your APY by staking, and view current APYs across all available terms.`}
          />
        </div>
        <div
          className={tw(
            "flex",
            "flex-col",
            "items-center",
            "w-full",
            "space-y-5"
          )}
        >
          {interestTokenPools
            .filter((pool): pool is WeightedPool => !!pool)
            .map((pool, index) => {
              return (
                <MintPoolCard
                  key={pool?.contractAddress || index}
                  library={library}
                  account={account}
                  chainId={chainId}
                  walletConnectionActive={active}
                  connector={connector}
                  pool={pool}
                />
              );
            })}
        </div>
      </div>
    </Fragment>
  );
}
