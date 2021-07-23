import { CSSProperties, Fragment, ReactElement } from "react";

import { Intent, NonIdealState, Tag } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { RouteComponentProps } from "@reach/router";
import { useWeb3React } from "@web3-react/core";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { ViewTitle } from "efi-ui/page/ViewTitle/ViewTitle";
import { useSigner } from "efi-ui/provider/useBlockFromTag/useSigner/useSigner";
import { IconNames } from "@blueprintjs/icons";
import { Helmet } from "react-helmet";
import { EarnTable } from "efi-ui/earn/EarnTable/EarnTable";
import { useOpenPrincipalTokenInfos } from "efi-ui/tranche/useOpenPrincipaltokenInfos";

interface EarnViewProps extends RouteComponentProps {}

export function EarnView(unusedProps: EarnViewProps): ReactElement {
  const { account, library } = useWeb3React<Web3Provider>();
  const signer = useSigner(account, library);

  const openPrincipalTokenInfos = useOpenPrincipalTokenInfos();

  const earnViewStyle: CSSProperties = { maxWidth: 610 };
  return (
    <Fragment>
      <Helmet>
        <title>{t`Earn | Element.fi`}</title>
      </Helmet>
      <div
        data-testid="earn-view"
        className={tw(
          "flex",
          "flex-col",
          "w-full",
          "h-full",
          "space-y-12",
          "items-center",
          "pb-5"
        )}
      >
        <div style={earnViewStyle}>
          <ViewTitle
            title={t`Capital efficiency for your yield positions.`}
            titleTag={<Tag minimal intent={Intent.WARNING}>{t`alpha`}</Tag>}
            className={tw("text-center")}
            subtitle={t`Mint Principal and Yield Tokens from your base asset, boost your APY by providing liquidity and view current APYs across all available terms.`}
          />
        </div>
        <div
          className={tw(
            "flex",
            "flex-col",
            "items-center",
            "w-full",
            "space-y-5",
            "pb-5"
          )}
        >
          {!openPrincipalTokenInfos.length ? (
            <NonIdealState
              className={tw("mt-12")}
              icon={IconNames.CLEAN}
              title={t`No available terms`}
              description={t`Please check back soon!`}
            />
          ) : (
            <EarnTable library={library} account={account} signer={signer} />
          )}
        </div>
      </div>
    </Fragment>
  );
}
