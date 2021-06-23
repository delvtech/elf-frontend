import {
  CSSProperties,
  Fragment,
  ReactElement,
  useCallback,
  useState,
} from "react";

import { Intent, Tag } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { RouteComponentProps } from "@reach/router";
import { useWeb3React } from "@web3-react/core";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { EarnCard } from "efi-ui/earn/EarnCard/EarnCard";
import { ViewTitle } from "efi-ui/page/ViewTitle/ViewTitle";
import { useSigner } from "efi-ui/provider/useBlockFromTag/useSigner/useSigner";
import { openPrincipalTokenInfos } from "efi/tranche/tranches";

interface EarnViewProps extends RouteComponentProps {}

export function EarnView(props: EarnViewProps): ReactElement {
  const { account, library } = useWeb3React<Web3Provider>();
  const signer = useSigner(account, library);
  const [expandedPoolIndex, setExpandedPoolIndex] = useState(-1);
  const onExpandClose = useCallback(() => setExpandedPoolIndex(-1), []);

  const earnViewStyle: CSSProperties = { maxWidth: 610 };
  return (
    <Fragment>
      <div
        data-testid="earn-view"
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
        <div style={earnViewStyle}>
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
          {openPrincipalTokenInfos.map((principalTokenInfo, index) => {
            return (
              <EarnCard
                signer={signer}
                library={library}
                account={account}
                isExpanded={index === expandedPoolIndex}
                onExpandOpen={() => {
                  setExpandedPoolIndex(index);
                }}
                onExpandClose={onExpandClose}
                key={principalTokenInfo.address}
                principalTokenInfo={principalTokenInfo}
              />
            );
          })}
        </div>
      </div>
    </Fragment>
  );
}
