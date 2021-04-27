import { Fragment, ReactElement } from "react";
import { Helmet } from "react-helmet";

import { Colors, H2 } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { RouteComponentProps } from "@reach/router";
import { useWeb3React } from "@web3-react/core";
import classNames from "classnames";
import { Signer } from "ethers";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { findAssetIcon } from "efi-ui/crypto/CryptoIcon";
import { useCryptoAssetForToken } from "efi-ui/crypto/hooks/useCryptoAssetForToken";
import { useCryptoSymbol } from "efi-ui/crypto/hooks/useCryptoSymbol/useCryptoSymbol";
import { PoolDetails } from "efi-ui/pools/PoolDetails/PoolDetails";
import { useAllPools } from "efi-ui/pools/useAllPools/useAllPools";
import { usePoolTokens } from "efi-ui/pools/usePoolTokens/usePoolTokens";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { useTermAssetSymbol } from "efi-ui/tranche/useTermAssetSymbol";
import { TransactionPendingCard } from "efi-ui/transactions/TransactionPendingCard/TransactionPendingCard";
import { parseSortedTokensForPool } from "efi/pools/parseSortedTokensForPool";
import { PoolContract } from "efi/pools/PoolContract";
import { getConnectorName } from "efi/wallets/connectors";

interface PoolViewProps extends RouteComponentProps {
  poolAddress?: string;
}

export function PoolView({ poolAddress }: PoolViewProps): ReactElement {
  const {
    active,
    account,
    chainId,
    connector,
    library,
  } = useWeb3React<Web3Provider>();

  const signer = account ? (library?.getSigner(account) as Signer) : undefined;
  const allPools = useAllPools(signer);
  const pool = allPools.find((pool) => pool?.address === poolAddress);
  const connectorName = getConnectorName(connector, library);

  return (
    <Fragment>
      <PoolViewTitle pool={pool} />
      <div
        data-testid="pool-view"
        className={tw(
          "flex",
          "p-12",
          "h-full",
          "space-x-12",
          "overflow-scroll"
        )}
      >
        {/* Main content */}
        <div
          className={tw("flex", "flex-col", "flex-1", "space-y-8", "w-full")}
        >
          {/* page title */}
          <div className={tw("flex", "justify-between")}>
            <TokenIcons pool={pool} />
            <TransactionPendingCard
              active={active}
              account={account}
              chainId={chainId}
              connectorName={connectorName}
            />
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
      </div>
    </Fragment>
  );
}

interface TokenIconsProps {
  pool: PoolContract | undefined;
}

function TokenIcons({ pool }: TokenIconsProps) {
  const { isDarkMode } = useDarkMode();
  const { data: [tokens] = [] } = usePoolTokens(pool);
  const { baseAssetContract, termAssetContract } = parseSortedTokensForPool(
    tokens
  );
  const baseAsset = useCryptoAssetForToken(baseAssetContract?.address);
  const baseAssetSymbol = useCryptoSymbol(baseAsset);
  const { label: termAssetSymbol } = useTermAssetSymbol(
    termAssetContract?.address,
    baseAssetSymbol
  );
  const BaseAssetIcon = findAssetIcon(baseAssetSymbol);

  return (
    <div style={{ height: 70 }} className={tw("flex", "items-center")}>
      {BaseAssetIcon ? (
        <div
          className={classNames(
            tw(
              "hidden",
              "md:flex",
              "items-center",
              "rounded",
              "p-2",
              "flex-shrink-0"
            )
          )}
        >
          <div
            style={{
              borderColor: isDarkMode ? Colors.GRAY5 : undefined,
              backgroundColor: isDarkMode ? Colors.WHITE : undefined,
            }}
            className={tw(
              "flex",
              "flex-shrink-0",
              "items-center",
              "p-2",
              "rounded-full",
              "z-10",
              "bg-white",
              "border",
              "shadow-sm"
            )}
          >
            <BaseAssetIcon height={36} width={36} />
          </div>
          <div
            style={{ marginLeft: -8 }}
            className={tw(
              "flex",
              "flex-shrink-0",
              "items-center",
              "p-2",
              "rounded-full",
              "bg-white",
              "border"
            )}
          >
            <BaseAssetIcon height={36} width={36} />
          </div>
        </div>
      ) : null}
      <H2
        className={tw("ml-4", "m-0")}
      >{t`${baseAssetSymbol} - ${termAssetSymbol}`}</H2>
    </div>
  );
}

interface PoolViewTitleProps {
  pool: PoolContract | undefined;
}

function PoolViewTitle({ pool }: PoolViewTitleProps) {
  const { data: [tokens] = [] } = usePoolTokens(pool);
  const { baseAssetContract, termAssetContract } = parseSortedTokensForPool(
    tokens
  );
  const baseAsset = useCryptoAssetForToken(baseAssetContract?.address);
  const baseAssetSymbol = useCryptoSymbol(baseAsset);
  const { symbol: termAssetSymbol } = useTermAssetSymbol(
    termAssetContract?.address,
    baseAssetSymbol
  );

  return (
    <Helmet>
      <title>{t`${baseAssetSymbol} - ${termAssetSymbol} | Element`}</title>
    </Helmet>
  );
}
