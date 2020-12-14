import React, { FC } from "react";

import { Card, Classes, HTMLTable } from "@blueprintjs/core";
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

  const totalBalance = "$10,000.00";

  return (
    <Card className={tw("flex", "flex-col", "space-y-4")}>
      <div className={tw("flex", "justify-between", "text-base")}>
        <span className={Classes.TEXT_MUTED}>{t`Wallet balance`}</span>
        <span>{totalBalance}</span>
      </div>

      <HTMLTable striped className={tw("w-full")}>
        <thead>
          <tr className={Classes.TEXT_SMALL}>
            {[t`Asset`, t`Price`, t`Balance`].map((label) => (
              <th key={label}>
                <span className={classNames(tw("text-xs"), Classes.TEXT_MUTED)}>
                  {label}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={Classes.TEXT_LARGE}>
          <tr>
            <td>
              <div className={tw("flex", "space-x-2", "font-semibold")}>
                ETH
              </div>
            </td>
            <td
              className={classNames({ [Classes.SKELETON]: isEthPriceLoading })}
            >
              {`$${ethPrice}`}
            </td>
            <td>
              <div
                className={tw(
                  "flex",
                  "h-full",
                  "flex-col",
                  "w-full",
                  "justify-center",
                  "space-y-1"
                )}
              >
                <span>{t`${formattedEthBalance} ETH`}</span>
                <span className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}>
                  {t`${formatMoney(fiatBalance)} USD`}
                </span>
              </div>
            </td>
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
        <div className={tw("flex", "space-x-2", "font-semibold")}>
          {tokenSymbol}
        </div>
      </td>

      {/* Price per token */}
      <td className={classNames({ [Classes.SKELETON]: isTokenPriceLoading })}>
        {`$${tokenPrice}`}
      </td>

      {/* Fiat balance */}
      <td>
        <div
          className={tw(
            "flex",
            "h-full",
            "flex-col",
            "w-full",
            "justify-center",
            "space-y-1"
          )}
        >
          <span>{t`${formattedTokenBalance} ETH`}</span>
          <span className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}>
            {t`${formattedFiatBalance} USD`}
          </span>
        </div>
      </td>
    </tr>
  );
};
