import React, { FC } from "react";

import { Card, Classes, Divider, H4, HTMLTable } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import classNames from "classnames";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { useEthBalance } from "efi-ui/coins/ether/hooks/useEthBalance/useEthBalance";
import { useCryptoPrice } from "efi-ui/crypto/hooks/useCryptoPrice/useCryptoPrice";
import { useConvertToFiatBalance } from "efi-ui/money/hooks/useConvertCryptoToFiatBalance";
import { useTokenBalance } from "efi-ui/token/hooks/useTokenBalance/useTokenBalance";
import { useWallet } from "efi-ui/wallets/hooks/useWallet";
import styles from "efi-ui/wallets/WalletSummaryPane/WalletSummaryPane.module.css";
import { formatCurrency } from "efi/base/formatCurrency/formatCurrency";
import { formatEth } from "efi/coins/ether/formatEth";
import { TokenContractSymbols } from "efi/crypto/TokenContractSymbols";
import { formatMoney } from "efi/money/formatMoney";

interface WalletBalancesCardProps {}

const WALLET_TOKENS: TokenContractSymbols[] = ["WETH"];

export const WalletBalancesCard: FC<WalletBalancesCardProps> = () => {
  const { fiatBalance } = useWallet();
  const { library, account } = useWeb3React<Web3Provider>();

  const { data: ethBalance } = useEthBalance(library, account);
  const { data: ethPrice, isLoading: isEthPriceLoading } = useCryptoPrice(
    "ETH"
  );
  const formattedEthBalance = formatEth(ethBalance);

  const totalBalance = "$1,0000";

  return (
    <Card className={tw("flex", "flex-col", "space-y-4")}>
      <div className={tw("flex", "justify-between")}>
        <H4 className={tw("m-0")}>{t`Wallet balance:`}</H4>
        <H4 className={tw("m-0")}>{totalBalance}</H4>
      </div>
      <Divider />

      <HTMLTable striped className={tw("w-full")}>
        <thead>
          <tr className={Classes.TEXT_SMALL}>
            {[t`Asset`, t`Price`, t`USD`, t`Balance`].map((label) => (
              <th key={label} className={styles.tableHeader}>
                <span className={tw("text-xs")}>{label}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={Classes.TEXT_LARGE}>
          <tr>
            <td>
              <div className={tw("flex", "space-x-2")}>
                <strong>ETH</strong>
              </div>
            </td>
            <td
              className={classNames({ [Classes.SKELETON]: isEthPriceLoading })}
            >
              {`$${ethPrice}`}
            </td>
            {fiatBalance && (
              <td>{`$${fiatBalance.toDecimal().toLocaleString()}`}</td>
            )}
            <td>{formattedEthBalance}</td>
          </tr>
          {WALLET_TOKENS.map((tokenSymbol) => {
            return (
              <TokenBalanceTableRow
                key={tokenSymbol}
                account={account}
                tokenSymbol={tokenSymbol}
              />
            );
          })}
        </tbody>
      </HTMLTable>
    </Card>
  );
};

export default WalletBalancesCard;

const TokenBalanceTableRow: FC<{
  account: string | null | undefined;
  tokenSymbol: TokenContractSymbols;
}> = ({ account, tokenSymbol }) => {
  const { data: tokenPrice, isLoading: isTokenPriceLoading } = useCryptoPrice(
    tokenSymbol
  );

  const [tokenBalance] = useTokenBalance(tokenSymbol, account);
  const [fiatBalance] = useConvertToFiatBalance(
    tokenSymbol,
    tokenBalance?.value,
    tokenBalance?.decimals.toNumber()
  );

  const formattedTokenBalance = formatCurrency(
    tokenBalance?.value,
    tokenBalance?.decimals.toNumber()
  );
  const formattedFiatBalance = formatMoney(fiatBalance);

  return (
    <tr>
      {/* Token name */}
      <td>
        <div className={tw("flex", "space-x-2")}>
          <strong>{tokenSymbol}</strong>
        </div>
      </td>

      {/* Price per token */}
      <td className={classNames({ [Classes.SKELETON]: isTokenPriceLoading })}>
        {`$${tokenPrice}`}
      </td>

      {/* Fiat balance */}
      <td>{formattedFiatBalance}</td>

      {/* Token balance */}
      <td>{formattedTokenBalance}</td>
    </tr>
  );
};
