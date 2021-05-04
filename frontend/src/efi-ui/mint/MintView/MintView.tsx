import React, { Fragment, ReactElement } from "react";
import { Helmet } from "react-helmet";

import { Intent, Tag } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { RouteComponentProps } from "@reach/router";
import { useWeb3React } from "@web3-react/core";
import { jt, t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { ViewTitle } from "efi-ui/page/ViewTitle/ViewTitle";

interface MintViewProps extends RouteComponentProps {}

export function MintView(props: MintViewProps): ReactElement {
  const {
    account,
    library,
    active,
    chainId,
    connector,
  } = useWeb3React<Web3Provider>();

  return (
    <Fragment>
      <div
        data-testid="mint-view"
        className={tw(
          "flex",
          "flex-col",
          "p-12",
          "h-full",
          "space-y-12",
          "overflow-scroll"
        )}
      >
        {/* Main content */}
        <div
          className={tw(
            "flex",
            "flex-col",
            "flex-1",
            "space-y-12",
            "pt-12",
            "items-center",
            "justify-center"
          )}
        >
          <div
            className={tw("flex", "flex-col", "space-y-12", "text-center")}
            style={{ width: 672 }}
          >
            {/* page title */}
            <ViewTitle
              title={t`Stay liquid with Principal and Yield Tokens`}
              titleTag={<Tag minimal intent={Intent.WARNING}>{t`alpha`}</Tag>}
              subtitle={"hi"}
            />
          </div>
        </div>
      </div>
    </Fragment>
  );
}
