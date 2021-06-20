import React, { Fragment, ReactElement, useCallback, useState } from "react";

import { Intent, Tag } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { RouteComponentProps } from "@reach/router";
import { useWeb3React } from "@web3-react/core";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { DepositCard } from "efi-ui/mint/DepositCard";
import { ViewTitle } from "efi-ui/page/ViewTitle/ViewTitle";
import { yieldPools } from "efi/pools/weightedPool";

interface MintViewProps extends RouteComponentProps {}

export function MintView(props: MintViewProps): ReactElement {
  const { account, library } = useWeb3React<Web3Provider>();
  const [expandedPoolIndex, setExpandedPoolIndex] = useState(-1);
  const onExpandClose = useCallback(() => setExpandedPoolIndex(-1), []);

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
          {yieldPools.map((poolInfo, index) => {
            return (
              <DepositCard
                isExpanded={index === expandedPoolIndex}
                onExpandOpen={() => {
                  setExpandedPoolIndex(index);
                }}
                onExpandClose={onExpandClose}
                key={poolInfo.address}
                library={library}
                account={account}
                poolInfo={poolInfo}
              />
            );
          })}
        </div>
      </div>
    </Fragment>
  );
}
