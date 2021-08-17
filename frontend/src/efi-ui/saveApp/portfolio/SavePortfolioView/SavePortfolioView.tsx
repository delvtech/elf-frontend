import { Fragment, ReactElement, useCallback } from "react";
import { Helmet } from "react-helmet";

import { Button, NonIdealState } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Web3Provider } from "@ethersproject/providers";
import { navigate, RouteComponentProps } from "@reach/router";
import { useWeb3React } from "@web3-react/core";
import { PrincipalTokenInfo } from "tokenlists/types";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { ViewTitle } from "efi-ui/page/ViewTitle/ViewTitle";
import { SavePortfolioList } from "efi-ui/saveApp/portfolio/SavePortfolioList/SavePortfolioList";
import { useTokensWithBalance } from "efi-ui/token/hooks/useTokensWithBalance";
import { isDust } from "efi/coins/isDust";
import { getTokenInfo } from "efi/tokenlists";
import {
  principalTokenInfos,
  trancheContractsByAddress,
} from "efi/tranche/tranches";
import { SaveAppHeader } from "efi-ui/saveApp/page/SaveAppHeader/SaveAppHeader";

interface SavePortfolioViewProps extends RouteComponentProps {}

export function SavePortfolioView(
  unusedProps: SavePortfolioViewProps
): ReactElement {
  const {
    account,
    library,
    chainId,
    active: walletConnectionActive,
  } = useWeb3React<Web3Provider>();

  const goToSave = useCallback(() => navigate("/"), []);

  const principalTokensWithBalance =
    usePrincipalTokensWithNonDustBalance(account);

  return (
    <Fragment>
      <Helmet>
        <title>{t`Earn fixed yield from buying at a discount. Exit anytime.`}</title>
      </Helmet>
      <div
        className={tw(
          "flex",
          "flex-col",
          "h-full",
          "items-center",
          "overflow-scroll"
        )}
      >
        <SaveAppHeader
          account={account}
          walletConnectionActive={walletConnectionActive}
          chainId={chainId}
        />

        <div
          className={tw(
            "flex",
            "flex-col",
            "w-full",
            "items-center",
            "text-center",
            "space-y-4",
            "lg:space-y-10",
            "pt-2",
            "px-6",
            "pb-24",
            "lg:pt-10",
            "lg:max-w-3xl"
          )}
        >
          <ViewTitle title={t`Wallet Overview`} subtitle={null} />
          <div
            className={tw(
              "flex",
              "w-full",
              "flex-col",
              "space-y-4",
              "lg:max-w-3xl"
            )}
          >
            {principalTokensWithBalance.length ? (
              <div className={tw("text-right", "hidden", "lg:block")}>
                <Button
                  minimal
                  large
                  onClick={goToSave}
                  icon={IconNames.ARROW_LEFT}
                >
                  {t`Back to Save`}
                </Button>
              </div>
            ) : null}

            {!principalTokensWithBalance.length ? (
              <NonIdealState
                icon={IconNames.BANK_ACCOUNT}
                className={tw(
                  "flex",
                  "justify-center",
                  "items-center",
                  "pt-16"
                )}
                description={t`This wallet does not contain any Principal Tokens.`}
                action={
                  <Button
                    outlined
                    large
                    onClick={goToSave}
                    icon={IconNames.ARROW_LEFT}
                  >
                    {t`Back to Save`}
                  </Button>
                }
              />
            ) : (
              <SavePortfolioList
                library={library}
                account={account}
                principalTokens={principalTokensWithBalance}
              />
            )}
          </div>
        </div>
      </div>
    </Fragment>
  );
}

function usePrincipalTokensWithNonDustBalance(
  account: string | null | undefined
): PrincipalTokenInfo[] {
  const principalTokenContracts = principalTokenInfos.map(
    ({ address }) => trancheContractsByAddress[address]
  );

  const principalTokensWithBalance = useTokensWithBalance(
    account,
    principalTokenContracts
  );

  const filteredByDust = principalTokensWithBalance.filter(
    ({ balanceOf, token }) => {
      const { decimals } = getTokenInfo(token.address);
      return !isDust(balanceOf, decimals);
    }
  );
  const principalTokensWithNonDustBalance = filteredByDust.map(({ token }) =>
    getTokenInfo<PrincipalTokenInfo>(token.address)
  );

  return principalTokensWithNonDustBalance;
}
